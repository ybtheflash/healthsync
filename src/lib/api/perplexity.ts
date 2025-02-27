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
        const response = await fetch('https://api.perplexity.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            query: query,
            max_results: 5,
            search_mode: "sonar" // Use Perplexity's advanced search
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Perplexity API error: ${errorData.error || response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error calling Perplexity search API:', error);
        throw error;
      }
    }
  };
  