// /app/api/pulse/document/sources/route.ts
import { NextRequest } from 'next/server';
import { PerplexityAPI } from '@/lib/api/perplexity';

export async function POST(request: NextRequest) {
  try {
    const { documentContent, content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract key terms and topics from the document analysis
    const keyPhrases = extractKeyPhrasesFromContent(content);
    
    // Get sources for each key phrase using Perplexity
    const sources = await getSources(keyPhrases);
    
    return new Response(
      JSON.stringify({ sources }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in document sources API:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Failed to generate sources for document analysis. Please try again.',
        code: 'SOURCES_ERROR',
        sources: []
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function extractKeyPhrasesFromContent(content: string): string[] {
  // Extract medical terms and topics from the analysis
  const medicalTermPattern = /(?:\*\*|#)([^*#]+)(?:\*\*|#)/g;
  const matches = [...content.matchAll(medicalTermPattern)].map(match => match[1].trim());
  
  // Also extract key sentences
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20);
  const keySentences = sentences.slice(0, Math.min(3, sentences.length));
  
  // Combine and remove duplicates
  return [...new Set([...matches, ...keySentences])].slice(0, 5);
}

async function getSources(phrases: string[]): Promise<Array<{ title: string, url: string, snippet: string }>> {
  const allSources: Array<{ title: string, url: string, snippet: string }> = [];
  
  // Get sources for each phrase (limit to 3 phrases to avoid too many API calls)
  for (const phrase of phrases.slice(0, 3)) {
    try {
      const results = await PerplexityAPI.search(phrase);
      
      if (results.results && results.results.length > 0) {
        // Take top 2 results for each phrase
        const topResults = results.results.slice(0, 2);
        
        for (const result of topResults) {
          // Check if this source is already in our list
          if (!allSources.some(s => s.url === result.url)) {
            allSources.push({
              title: result.title,
              url: result.url,
              snippet: result.snippet
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Error getting sources for phrase: ${phrase}`, error);
      // Continue with other phrases
    }
  }
  
  // Limit to maximum 5 sources
  return allSources.slice(0, 5);
}
