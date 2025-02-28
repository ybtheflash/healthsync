// src/lib/pulse-client.ts
import { useState, useEffect, useRef } from "react";

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface PulseError {
  message: string;
}

// Add the streamPulseQuery function that your component is trying to use
export async function streamPulseQuery(
  query: string,
  onChunk: (chunk: string) => void,
  onComplete: (sources: Source[], suggestedQueries?: string[]) => void,
  onError: (error: PulseError) => void
) {
  try {
    // Create a new AbortController for this request
    const controller = new AbortController();
    const signal = controller.signal;

    const response = await fetch('/api/pulse/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query }),
      signal
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to search for medical information');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let partialChunk = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const combinedChunk = partialChunk + chunk;
      
      try {
        // Check if we have a complete JSON object
        const messages = combinedChunk.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        
        // Process complete messages
        for (const message of messages) {
          if (message.type === 'content') {
            onChunk(message.value);
          } else if (message.type === 'complete') {
            onComplete(message.sources || [], message.suggestedQueries || []);
          } else if (message.type === 'error') {
            throw new Error(message.value);
          }
        }
        
        // Store any incomplete data for the next chunk
        const lastNewlineIndex = combinedChunk.lastIndexOf('\n');
        if (lastNewlineIndex !== -1 && lastNewlineIndex < combinedChunk.length - 1) {
          partialChunk = combinedChunk.substring(lastNewlineIndex + 1);
        } else {
          partialChunk = '';
        }
      } catch {
        // If we fail to parse, store the chunk for combining with the next one
        partialChunk = combinedChunk;
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      onError({ message: 'Request was cancelled' });
    } else {
      onError({ message: err instanceof Error ? err.message : 'An error occurred during search' });
      console.error('Error during search:', err);
    }
  }
}

// Add the streamDocumentAnalysis function for consistency
export async function streamDocumentAnalysis(
  document: string,
  onChunk: (chunk: string) => void,
  onComplete: (sources: Source[], suggestedQueries?: string[]) => void,
  onError: (error: PulseError) => void
) {
  try {
    // Create a new AbortController for this request
    const controller = new AbortController();
    const signal = controller.signal;

    const response = await fetch('/api/pulse/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ document }),
      signal
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to analyze document');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let partialChunk = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const combinedChunk = partialChunk + chunk;
      
      try {
        // Check if we have complete JSON objects
        const messages = combinedChunk.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        
        // Process complete messages
        for (const message of messages) {
          if (message.type === 'content') {
            onChunk(message.value);
          } else if (message.type === 'complete') {
            onComplete(message.sources || [], message.suggestedQueries || []);
          } else if (message.type === 'error') {
            throw new Error(message.value);
          }
        }
        
        // Store any incomplete data for the next chunk
        const lastNewlineIndex = combinedChunk.lastIndexOf('\n');
        if (lastNewlineIndex !== -1 && lastNewlineIndex < combinedChunk.length - 1) {
          partialChunk = combinedChunk.substring(lastNewlineIndex + 1);
        } else {
          partialChunk = '';
        }
      } catch {
        // If we fail to parse, store the chunk for combining with the next one
        partialChunk = combinedChunk;
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      onError({ message: 'Request was cancelled' });
    } else {
      onError({ message: err instanceof Error ? err.message : 'An error occurred during document analysis' });
      console.error('Error during document analysis:', err);
    }
  }
}

export const usePulseClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setResponse("");
    setSources([]);
    setSuggestedQueries([]);
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cancelRequest();
    };
  }, []);

  const searchMedicalInfo = async (query: string) => {
    try {
      resetState();
      setIsLoading(true);
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      await streamPulseQuery(
        query,
        (chunk) => {
          setResponse(prev => prev + chunk);
        },
        (sources, suggestedQueries) => {
          setSources(sources);
          setSuggestedQueries(suggestedQueries || []);
          setIsLoading(false);
        },
        (error) => {
          setError(error.message);
          setIsLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const analyzeDocument = async (document: string) => {
    try {
      resetState();
      setIsLoading(true);
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      await streamDocumentAnalysis(
        document,
        (chunk) => {
          setResponse(prev => prev + chunk);
        },
        (sources, suggestedQueries) => {
          setSources(sources);
          setSuggestedQueries(suggestedQueries || []);
          setIsLoading(false);
        },
        (error) => {
          setError(error.message);
          setIsLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  return {
    searchMedicalInfo,
    analyzeDocument,
    cancelRequest,
    isLoading,
    error,
    response,
    sources,
    suggestedQueries
  };
};

// For use with API routes
import { NextApiResponse } from 'next';

export const streamResponse = async (
  res: NextApiResponse,
  callback: (
    onChunk: (chunk: string) => void,
    onComplete: (sources: Source[], suggestedQueries?: string[]) => void,
    onError: (error: PulseError) => void
  ) => Promise<void>
) => {
  // Set headers for streaming
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const sendChunk = (chunk: string) => {
    res.write(JSON.stringify({ type: 'content', value: chunk }) + '\n');
  };

  const sendComplete = (sources: Source[], suggestedQueries?: string[]) => {
    res.write(JSON.stringify({ 
      type: 'complete', 
      sources, 
      suggestedQueries 
    }) + '\n');
    res.end();
  };

  const sendError = (error: PulseError) => {
    res.write(JSON.stringify({ type: 'error', value: error.message }) + '\n');
    res.end();
  };

  try {
    await callback(sendChunk, sendComplete, sendError);
  } catch (error) {
    console.error('Error streaming response:', error);
    sendError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};
