// /lib/api/perplexity.ts
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export const PerplexityAPI = {
  async search(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that searches the web to provide accurate information with sources."
            },
            {
              role: "user",
              content: `Please search for reliable medical information about: ${query}\n\nProvide only factual information from reputable medical sources.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract sources from the response
      const sources: SearchResult[] = [];
      
      if (data.choices && data.choices.length > 0) {
        // Parse the source citations from the response
        const content = data.choices[0].message.content;
        
        // Look for citations in the format [1], [2], etc. and their corresponding URLs
        const sourceRegex = /\[(\d+)\]\s*(.+?)(?:\s*\(\s*(https?:\/\/[^\s)]+)\s*\))/g;
        let match;
        
        while ((match = sourceRegex.exec(content)) !== null) {
          const title = match[2].trim();
          const url = match[3].trim();
          
          // Extract a snippet by finding text around the citation
          const citationMarker = `[${match[1]}]`;
          const citationIndex = content.indexOf(citationMarker);
          const startSnippet = Math.max(0, citationIndex - 100);
          const endSnippet = Math.min(content.length, citationIndex + 100);
          const snippet = content.substring(startSnippet, endSnippet)
            .replace(citationMarker, '')
            .trim();
          
          sources.push({
            title,
            url,
            snippet
          });
        }
        
        // If no sources were extracted with the regex, use the reference links
        if (sources.length === 0 && data.references && Array.isArray(data.references)) {
          data.references.forEach((ref: any) => {
            if (ref.title && ref.url) {
              sources.push({
                title: ref.title,
                url: ref.url,
                snippet: ref.text || "Referenced source"
              });
            }
          });
        }
      }
      
      return {
        results: sources,
        query
      };
    } catch (error) {
      console.error('Error calling Perplexity search API:', error);
      throw error;
    }
  }
};
