// /lib/api/groq.ts
export const GroqAPI = {
  async generateChatCompletionStream(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    max_tokens: number;
  }): Promise<ReadableStream<Uint8Array>> {
    // Check if API key exists
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.");
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          ...params,
          max_tokens: params.max_tokens, // Renamed from max_completion_tokens for API compatibility
          stream: true
        })
      });

      if (!response.ok) {
        const statusCode = response.status;
        let errorMessage = response.statusText || 'Unknown error';
        
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.error?.message || 
                          errorData.message || 
                          errorMessage;
          }
        } catch (e) {
          // If parsing JSON fails, use the status text
        }
        
        if (statusCode === 401) {
          throw new Error("Authentication failed: Please check your Groq API key is valid and properly configured.");
        } else {
          throw new Error(`Groq API error: ${errorMessage}`);
        }
      }

      if (!response.body) {
        throw new Error("Groq API returned an empty response body");
      }

      return response.body;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to call Groq API: ${error}`);
    }
  },

  async generateCompletion(params: {
    model: string;
    prompt: string;
    max_tokens: number;
    temperature: number;
  }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.");
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const statusCode = response.status;
        let errorMessage = response.statusText || 'Unknown error';
        
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.error?.message || 
                          errorData.message || 
                          errorMessage;
          }
        } catch (e) {
          // If parsing JSON fails, use the status text
        }
        
        if (statusCode === 401) {
          throw new Error("Authentication failed: Please check your Groq API key is valid and properly configured.");
        } else {
          throw new Error(`Groq API error: ${errorMessage}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to call Groq API: ${error}`);
    }
  }
};
