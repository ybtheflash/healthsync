// /lib/api/pulse-client.ts

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

export async function streamPulseQuery(
  query: string,
  onChunk: (chunk: string, thinking?: string) => void,
  onComplete: (sources: Source[]) => void,
  onError: (error: PulseError) => void
) {
  try {
    const response = await fetch('/api/pulse/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      onError({
        message: errorData.message || 'Our servers are currently busy. Please try again later.',
        code: errorData.code || 'API_ERROR',
      });
      return;
    }
    
    if (!response.body) {
      onError({
        message: 'Stream response not supported by your browser.',
        code: 'STREAM_ERROR',
      });
      return;
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let thinkingContent = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // After streaming is complete, get sources for the content
        try {
          const sourcesResponse = await fetch('/api/pulse/sources', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              query,
              content: fullContent 
            }),
          });
          
          if (sourcesResponse.ok) {
            const { sources } = await sourcesResponse.json();
            onComplete(sources);
          } else {
            onComplete([]);
          }
        } catch (error) {
          console.error('Error fetching sources:', error);
          onComplete([]);
        }
        break;
      }
      
      // Decode the chunk
      const text = decoder.decode(value, { stream: true });
      
      // Process the SSE data
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6); // Remove "data: " prefix
          
          // Skip the [DONE] marker
          if (data === '[DONE]') continue;
          
          try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);
            
            // Extract the content from the delta if it exists
            if (jsonData.choices && 
                jsonData.choices[0] && 
                jsonData.choices[0].delta && 
                jsonData.choices[0].delta.content) {
              const newContent = jsonData.choices[0].delta.content;
              fullContent += newContent;
              
              // Extract thinking content and regular content
              const regex = /<think>([\s\S]*?)<\/think>/g;
              let match;
              let cleanContent = fullContent;
              thinkingContent = '';
              
              // Extract all thinking content
              while ((match = regex.exec(fullContent)) !== null) {
                thinkingContent += match[1];
                cleanContent = cleanContent.replace(match[0], '');
              }
              
              // Send both the clean content and thinking content
              onChunk(cleanContent.trim(), thinkingContent.trim() || undefined);
            }
          } catch (error) {
            console.warn('Error parsing SSE JSON data:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from Pulse:', error);
    onError({
      message: 'An unexpected error occurred. Please try again.',
      code: 'CLIENT_ERROR',
    });
  }
}

function processStreamChunk(chunk: string): string {
  // Remove any <think> tags and their content
  return chunk.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
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

export async function streamDocumentAnalysis(
  documentContent: string,
  onChunk: (chunk: string) => void,
  onComplete: (sources: Source[]) => void,
  onError: (error: PulseError) => void
) {
  try {
    const response = await fetch('/api/pulse/document/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentContent }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      onError({
        message: errorData.message || 'Our servers are currently busy. Please try again later.',
        code: errorData.code || 'API_ERROR',
      });
      return;
    }
    
    if (!response.body) {
      onError({
        message: 'Stream response not supported by your browser.',
        code: 'STREAM_ERROR',
      });
      return;
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // After streaming is complete, get sources for the document analysis
        try {
          const sourcesResponse = await fetch('/api/pulse/document/sources', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              documentContent: documentContent.substring(0, 1000), // Send a preview for source generation
              content: buffer 
            }),
          });
          
          if (sourcesResponse.ok) {
            const { sources } = await sourcesResponse.json();
            onComplete(sources);
          } else {
            onComplete([]);
          }
        } catch (error) {
          console.error('Error fetching document sources:', error);
          onComplete([]);
        }
        break;
      }
      
      // Decode the chunk and add to buffer
      const text = decoder.decode(value, { stream: true });
      
      // Process the text to remove thinking tags if present
      const processedText = processStreamChunk(text);
      
      if (processedText) {
        buffer = processedText;
        onChunk(buffer);
      }
    }
  } catch (error) {
    console.error('Error streaming document analysis:', error);
    onError({
      message: 'An unexpected error occurred. Please try again.',
      code: 'CLIENT_ERROR',
    });
  }
}
