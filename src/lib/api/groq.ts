interface CompletionRequest {
    model: string;
    prompt: string;
    max_tokens: number;
    temperature: number;
  }
  
  interface ChatCompletionRequest {
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    temperature: number;
    max_tokens: number;
  }
  
  interface CompletionResponse {
    choices: Array<{
      text: string;
    }>;
  }
  
  interface ChatCompletionResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }
  
  export const GroqAPI = {
    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
      try {
        const response = await fetch('https://api.groq.com/v1/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify(request)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error calling Groq completion API:', error);
        throw error;
      }
    },
    
    async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
      try {
        const response = await fetch('https://api.groq.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify(request)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error calling Groq chat completion API:', error);
        throw error;
      }
    }
  };
  