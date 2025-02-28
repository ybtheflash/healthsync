// src/lib/api/perplexity.ts
interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface PulseResponse {
  content: string;
  sources: Source[];
  suggestedQueries?: string[];
}

interface PulseError {
  message: string;
}

export const PerplexityAPI = {
  async streamMedicalSearch(
    query: string,
    onChunk: (chunk: string) => void,
    onComplete: (response: PulseResponse) => void,
    onError: (error: PulseError) => void
  ): Promise<void> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY || process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
      
      if (!apiKey) {
        throw new Error("Perplexity API key is not configured. Please add PERPLEXITY_API_KEY to your environment variables.");
      }

      // Determine if the query is medical or conversational
      const isMedicalQuery = await isQueryMedical(query, apiKey);
      
      // Create a properly formatted system prompt
      const systemPrompt = `You are Pulse AI, a medical assistant with a conversational, friendly GROWN UP doctor-like approach.

IMPORTANT GUIDELINES:
- ALWAYS write in complete, coherent english and grammar correct sentences. Never output partial or fragmented text.
- For identity questions like "who are you" or "what are you": Respond that you are Pulse AI, a medical assistant designed to help with health questions.
- For non-medical greetings or casual conversation: Respond conversationally as a friendly doctor would, without providing any medical information.
- For medical questions: Provide detailed, evidence-based information with proper citations to reputable sources.
- Always cite your sources in the format [1], [2], etc., with full references at the end of your response.
- Keep your tone professional but warm and accessible.
- Structure your responses with clear paragraphs and proper punctuation.
- Never respond with song lyrics or unrelated cultural references.
- Respond directly and clearly to the user's question.

Your primary purpose is to provide reliable medical information and chat in a friendly manner. Keep responses clear, complete, and well-structured.`;


      // Create a properly formatted query
      let promptContent = query;
      if (isMedicalQuery) {
        promptContent = `Please provide accurate medical information about: ${query}
        
Please include:
1. Evidence-based information with proper citations
2. Clear explanations in accessible language
3. References to reputable medical sources
4. ALWAYS write in complete sentences and paragraphs`;
      }
      
      console.log("Sending request to Perplexity API");
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: isMedicalQuery ? "sonar" : "sonar",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: promptContent
            }
          ],
          stream: true
        })
      });
      
      if (!response.ok) {
        let errorMessage = response.statusText || 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (e) {
          // If parsing JSON fails, use the status text
        }
        throw new Error(`Perplexity API error: ${errorMessage}`);
      }
      
      if (!response.body) {
        throw new Error("Perplexity API returned an empty response body");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      let buffer = "";
      
      // Function to handle each token in a smart way
      const processToken = (token: string) => {
        // Add to buffer
        buffer += token;
        
        // Check if we have complete words or sentences
        if (/[.!?]\s*$/.test(buffer) || // Complete sentence
            /\s$/.test(buffer) ||       // Complete word
            buffer.length > 20) {       // Buffer getting long
          
          // Send the buffered content
          onChunk(buffer);
          fullContent += buffer;
          buffer = "";
        }
      };
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush any remaining buffer
          if (buffer.length > 0) {
            onChunk(buffer);
            fullContent += buffer;
          }
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          try {
            if (line.includes('[DONE]')) continue;
            
            const data = JSON.parse(line.substring(6));
            if (data.choices && data.choices[0]?.delta?.content) {
              const text = data.choices[0].delta.content;
              processToken(text);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
      
      // Extract sources from the completed response
      const sources = isMedicalQuery ? extractSources(fullContent) : [];
      
      // Generate suggested follow-up queries only for medical queries
      const suggestedQueries = isMedicalQuery ? 
        await generateSuggestedQueries(query, fullContent, apiKey) : 
        [];
      
      // Complete the process
      onComplete({
        content: fullContent,
        sources,
        suggestedQueries
      });
      
    } catch (error) {
      console.error("Error in streamMedicalSearch:", error);
      onError({
        message: error instanceof Error ? error.message : "An error occurred while processing your query. Please try again."
      });
    }
  },
  
  // Keep the rest of your implementation...
};

// Helper function to determine if query is medical
async function isQueryMedical(query: string, apiKey: string): Promise<boolean> {
  // Simple heuristics for identity questions and greetings
  const identityPatterns = [
    /^(who|what) are you(\?|!|\.|)?$/i,
    /^(tell me about yourself|introduce yourself)(\?|!|\.|)?$/i,
    /^what is pulse(\?|!|\.|)?$/i,
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)( there)?(!|\.|)?$/i,
    /^how are you( doing)?( today)?(\?|!|\.|)?$/i,
    /^what'?s up(\?|!|\.|)?$/i,
    /^nice to (meet|see) you(\?|!|\.|)?$/i
  ];
  
  // Check for simple identity or greeting patterns
  for (const pattern of identityPatterns) {
    if (pattern.test(query.trim())) {
      return false;
    }
  }
  
  // Simple check for medical keywords
  const medicalKeywords = [
    'pain', 'symptom', 'disease', 'illness', 'treatment', 'doctor', 
    'medicine', 'medical', 'health', 'diagnosis', 'hospital', 'heart',
    'blood', 'condition', 'syndrome', 'cancer', 'therapy', 'surgery',
    'infection', 'vaccine', 'diabetes', 'prescription', 'allergy'
  ];
  
  for (const keyword of medicalKeywords) {
    if (query.toLowerCase().includes(keyword)) {
      return true;
    }
  }
  
  // For more complex queries, use AI to determine if medical
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You determine if a query is requesting medical information or is just casual conversation. Respond with ONLY 'medical' or 'casual'."
          },
          {
            role: "user",
            content: `Classify this query: "${query}"`
          }
        ]
      })
    });
    
    if (!response.ok) return true; // Default to medical if classification fails
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.toLowerCase() || '';
    
    return content.includes('medical');
  } catch (e) {
    console.error("Error classifying query:", e);
    // Default to treating as medical if classification fails
    return true;
  }
}

// Helper function to extract sources from the content
function extractSources(content: string): Source[] {
  const sources: Source[] = [];
  
  // Extract references section
  const referencesMatch = content.match(/references:?\s*\n([\s\S]+)$/i) || 
                         content.match(/sources:?\s*\n([\s\S]+)$/i);
  
  if (referencesMatch) {
    // Extract individual references
    const referenceRegex = /\[(\d+)\]\s+(.*?)(?:\s*\(\s*(https?:\/\/[^\s)]+)\s*\)|$)/g;
    let match;
    
    while ((match = referenceRegex.exec(referencesMatch[0])) !== null) {
      const number = match[1];
      const title = match[2].trim();
      const url = match[3]?.trim() || "";
      
      // Find a snippet with context around the citation
      const citationMarker = `[${number}]`;
      const citationIndex = content.indexOf(citationMarker);
      let snippet = "Referenced in document";
      
      if (citationIndex !== -1) {
        const startSnippet = Math.max(0, citationIndex - 100);
        const endSnippet = Math.min(content.length, citationIndex + 100);
        snippet = content.substring(startSnippet, endSnippet)
          .replace(citationMarker, '')
          .trim();
      }
      
      sources.push({
        title,
        url,
        snippet
      });
    }
    
    // If regex didn't find any, try line-by-line approach
    if (sources.length === 0) {
      const lines = referencesMatch[0].split('\n').filter(line => line.trim().length > 0);
      
      for (const line of lines) {
        // Skip the "References:" header line
        if (/^references:?|^sources:?/i.test(line)) continue;
        
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const url = urlMatch[1];
          const title = line.replace(url, '').replace(/^\d+\.\s*|\[\d+\]\s*/, '').trim();
          
          sources.push({
            title: title || "Referenced source",
            url,
            snippet: "Referenced in document"
          });
        } else {
          // Try to match numbered references without URLs
          const numberedRef = line.match(/^\d+\.\s*(.+)$|^\[\d+\]\s*(.+)$/);
          if (numberedRef) {
            sources.push({
              title: (numberedRef[1] || numberedRef[2]).trim(),
              url: "",
              snippet: "Referenced in document"
            });
          }
        }
      }
    }
  } else {
    // If no references section, look for inline citations
    const inlineCitationRegex = /\[(\d+)\]/g;
    let citationMatch;
    const citationNumbers = new Set<string>();
    
    while ((citationMatch = inlineCitationRegex.exec(content)) !== null) {
      citationNumbers.add(citationMatch[1]);
    }
    
    // For each citation number, try to find the corresponding reference
    citationNumbers.forEach(number => {
      sources.push({
        title: `Source ${number}`,
        url: "",
        snippet: `Citation [${number}] used in document`
      });
    });
  }
  
  return sources;
}

// Helper function to generate suggested follow-up queries
async function generateSuggestedQueries(
  originalQuery: string, 
  responseContent: string,
  apiKey: string
): Promise<string[]> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You generate helpful follow-up questions for medical queries."
          },
          {
            role: "user",
            content: `Based on this original medical query: "${originalQuery}" and the information provided in the response, generate 3 specific follow-up questions that would help explore this medical topic further. Format as a numbered list with just the questions.`
          }
        ]
      })
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Extract questions using regex
    const questions = content.match(/^\d+\.\s*(.+)$/gm)
      ?.map((q: string) => q.replace(/^\d+\.\s*/, '').trim())
      ?.filter((q: string) => q.length > 0 && q.endsWith('?'))
      ?.slice(0, 3) || [];
    
    return questions;
  } catch (error) {
    console.error("Error generating suggested queries:", error);
    return [];
  }
}
