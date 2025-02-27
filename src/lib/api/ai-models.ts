import { GroqAPI } from './groq';
import { PerplexityAPI } from './perplexity';
import { v4 as uuidv4 } from 'uuid';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface AIResponse {
  id: string;
  content: string;
  sources: Source[];
}

export interface AIError {
  message: string;
  code: string;
}

// Classify the medical query to determine the best approach
async function classifyQuery(query: string): Promise<string> {
  try {
    const response = await GroqAPI.generateCompletion({
      model: "deepseek-r1-distill",
      prompt: `Classify the following medical query into one of these categories:
      - General medical information (e.g., "What are symptoms of diabetes?")
      - Specific medical advice (e.g., "What medication should I take for my headache?")
      - Medical emergency (e.g., "I'm having chest pain and difficulty breathing")
      - Medical analysis (e.g., "What do these blood test results mean?")
      
      Query: "${query}"
      
      Category:`,
      max_tokens: 50,
      temperature: 0.1
    });
    
    return response.choices[0].text.trim();
  } catch (error) {
    console.error("Error classifying query:", error);
    return "General medical information"; // Default fallback
  }
}

// Generate the initial medical response
async function generateMedicalResponse(query: string, category: string): Promise<string> {
  // Select model based on query category
  let model = "deepseek-r1-distill"; // Default model
  
  if (category.includes("Specific medical advice") || category.includes("Medical analysis")) {
    model = "qwen-32b"; // More advanced model for complex queries
  }
  
  try {
    const systemPrompt = `You are Pulse, a medical AI assistant that provides accurate, evidence-based health information.
    
    Guidelines:
    - Provide factual, scientifically accurate medical information
    - Include relevant context and explanations
    - Structure responses with clear headings and bullet points when appropriate
    - For symptoms or serious conditions, advise consulting with healthcare professionals
    - Never provide definitive diagnoses or prescribe specific medications
    - Cite reliable medical sources when possible
    - Format your response in Markdown
    - Use a compassionate, professional tone`;
    
    const response = await GroqAPI.generateChatCompletion({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating medical response:", error);
    throw error;
  }
}

// Verify factual claims using Perplexity Search
async function verifyFactualClaims(response: string, query: string): Promise<{ verifiedResponse: string, sources: Source[] }> {
  try {
    // Extract key claims from the AI response
    const claimsResponse = await GroqAPI.generateCompletion({
      model: "deepthink",
      prompt: `Extract 3-5 key factual claims from this medical response:
      
      Original query: "${query}"
      
      Medical response: "${response}"
      
      List only the factual claims that should be verified, one per line:`,
      max_tokens: 300,
      temperature: 0.1
    });
    
    const claims = claimsResponse.choices[0].text.trim().split('\n').filter(claim => claim.trim() !== '');
    
    // Verify each claim with Perplexity Search
    const sources: Source[] = [];
    let verifiedResponse = response;
    
    for (const claim of claims) {
      if (claim.length < 10) continue; // Skip very short claims
      
      const searchResults = await PerplexityAPI.search(claim);
      
      if (searchResults.results && searchResults.results.length > 0) {
        const relevantResults = searchResults.results.slice(0, 2);
        
        for (const result of relevantResults) {
          sources.push({
            title: result.title,
            url: result.url,
            snippet: result.snippet
          });
        }
        
        // Check if any correction is needed based on search results
        const correctionCheck = await GroqAPI.generateChatCompletion({
          model: "deepthink",
          messages: [
            { role: "system", content: "You are a medical fact-checker. Review the claim against the search results and determine if any correction is needed." },
            { role: "user", content: `Claim: "${claim}"
            
            Search results:
            ${relevantResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}
            
            Is the original claim accurate based on these results? If not, what correction is needed?` }
          ],
          temperature: 0.1,
          max_tokens: 250
        });
        
        const correctionResult = correctionCheck.choices[0].message.content.trim();
        
        // If correction is needed, update the response
        if (correctionResult.toLowerCase().includes("no") && correctionResult.toLowerCase().includes("correction")) {
          const correction = await GroqAPI.generateChatCompletion({
            model: "deepthink",
            messages: [
              { role: "system", content: "You are an expert at making minimal, precise corrections to text while preserving the surrounding content." },
              { role: "user", content: `Original text: "${response}"
              
              The following claim needs correction: "${claim}"
              
              Correct information based on reliable sources: "${correctionResult}"
              
              Please provide the full text with ONLY this specific correction made. Preserve all other content exactly as is.` }
            ],
            temperature: 0.1,
            max_tokens: 1500
          });
          
          verifiedResponse = correction.choices[0].message.content.trim();
        }
      }
    }
    
    // Deduplicate sources
    const uniqueSources = sources.filter((source, index, self) =>
      index === self.findIndex((s) => s.url === source.url)
    );
    
    return {
      verifiedResponse,
      sources: uniqueSources
    };
  } catch (error) {
    console.error("Error verifying factual claims:", error);
    return {
      verifiedResponse: response,
      sources: []
    };
  }
}

// Main function to process medical queries
export async function processMedicalQuery(query: string): Promise<AIResponse | AIError> {
  try {
    // Step 1: Classify the query
    const category = await classifyQuery(query);
    
    // For medical emergencies, provide emergency guidance
    if (category.includes("Medical emergency")) {
      return {
        id: uuidv4(),
        content: `# Medical Emergency\n\nIt sounds like you may be describing a medical emergency. **Please call emergency services (911 in the US) immediately.**\n\nDo not wait for online advice when experiencing symptoms that could indicate a serious, time-sensitive condition such as:\n\n- Chest pain\n- Difficulty breathing\n- Stroke symptoms\n- Severe bleeding\n- Sudden severe pain\n\nThis AI assistant cannot provide emergency medical care or diagnosis.`,
        sources: [
          {
            title: "CDC - Emergency Department Visits",
            url: "https://www.cdc.gov/nchs/fastats/emergency-department.htm",
            snippet: "The CDC provides guidelines on when to seek emergency care."
          }
        ]
      };
    }
    
    // Step 2: Generate initial response
    const initialResponse = await generateMedicalResponse(query, category);
    
    // Step 3: Verify factual claims and get sources
    const { verifiedResponse, sources } = await verifyFactualClaims(initialResponse, query);
    
    // Step 4: Return the verified response with sources
    return {
      id: uuidv4(),
      content: verifiedResponse,
      sources: sources
    };
    
  } catch (error) {
    console.error("Error processing medical query:", error);
    return {
      message: "I encountered an error while processing your medical query. Please try again or rephrase your question.",
      code: "PROCESSING_ERROR"
    };
  }
}

// Process medical documents
export async function processMedicalDocument(documentContent: string): Promise<AIResponse | AIError> {
  try {
    // Step 1: Extract key information from document
    const extractionResponse = await GroqAPI.generateChatCompletion({
      model: "qwen-32b",
      messages: [
        { 
          role: "system", 
          content: "You are a medical document analyzer that extracts key medical information from documents. Focus on diagnoses, treatments, medications, test results, and important medical findings."
        },
        { 
          role: "user", 
          content: `Extract and summarize the key medical information from this document:\n\n${documentContent.substring(0, 10000)}` // Limit length
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });
    
    const extractedInfo = extractionResponse.choices[0].message.content.trim();
    
    // Step 2: Generate analysis of the medical document
    const analysisResponse = await GroqAPI.generateChatCompletion({
      model: "deepthink",
      messages: [
        { 
          role: "system", 
          content: "You are Pulse, a medical AI assistant. Provide clear, accurate analysis of medical documents with a professional tone. Focus on explaining medical terms, providing context, and highlighting important information."
        },
        { 
          role: "user", 
          content: `Based on this extracted medical information, provide an analysis that helps the user understand the document:\n\n${extractedInfo}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });
    
    const analysis = analysisResponse.choices[0].message.content.trim();
    
    // Step 3: Verify key information with Perplexity Search
    const { verifiedResponse, sources } = await verifyFactualClaims(analysis, extractedInfo);
    
    return {
      id: uuidv4(),
      content: verifiedResponse,
      sources: sources.length > 0 ? sources : [
        {
          title: "Document Analysis",
          url: "https://example.com/document-analysis",
          snippet: "Analysis based on the uploaded document content."
        }
      ]
    };
    
  } catch (error) {
    console.error("Error processing medical document:", error);
    return {
      message: "I encountered an error while analyzing your document. Please try again or upload a different document.",
      code: "DOCUMENT_PROCESSING_ERROR"
    };
  }
}
