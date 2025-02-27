interface Source {
    title: string;
    url: string;
    snippet: string;
  }
  
  export interface PulseResponse {
    id: string;
    content: string;
    sources: Source[];
  }
  
  export interface PulseError {
    message: string;
    code: string;
  }
  
  export async function queryPulse(query: string): Promise<PulseResponse | PulseError> {
    try {
      const response = await fetch('/api/pulse/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          message: errorData.message || 'Failed to process your query',
          code: errorData.code || 'API_ERROR',
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying Pulse:', error);
      return {
        message: 'An unexpected error occurred. Please try again.',
        code: 'CLIENT_ERROR',
      };
    }
  }
  
  export async function analyzeDocument(documentContent: string): Promise<PulseResponse | PulseError> {
    try {
      const response = await fetch('/api/pulse/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentContent }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          message: errorData.message || 'Failed to analyze your document',
          code: errorData.code || 'API_ERROR',
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing document with Pulse:', error);
      return {
        message: 'An unexpected error occurred while analyzing your document. Please try again.',
        code: 'CLIENT_ERROR',
      };
    }
  }
  