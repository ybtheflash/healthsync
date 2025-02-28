// src/app/api/pulse/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PerplexityAPI } from '@/lib/api/perplexity';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query } = body;
  
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }
  
  // Create a TransformStream to stream the response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Start the response
  const response = new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff'
    }
  });
  
  // Process in the background
  (async () => {
    try {
      await PerplexityAPI.streamMedicalSearch(
        query,
        // On chunk received
        (chunk) => {
          writer.write(
            encoder.encode(
              JSON.stringify({ type: 'content', value: chunk }) + '\n'
            )
          );
        },
        // On complete
        (result) => {
          writer.write(
            encoder.encode(
              JSON.stringify({
                type: 'complete',
                sources: result.sources,
                suggestedQueries: result.suggestedQueries
              }) + '\n'
            )
          );
          writer.close();
        },
        // On error
        (error) => {
          writer.write(
            encoder.encode(
              JSON.stringify({ type: 'error', value: error.message }) + '\n'
            )
          );
          writer.close();
        }
      );
    } catch (error) {
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'error',
            value: error instanceof Error ? error.message : 'Unknown error'
          }) + '\n'
        )
      );
      writer.close();
    }
  })();
  
  return response;
}
