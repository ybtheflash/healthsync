// /app/api/pulse/stream/route.ts
import { NextRequest } from 'next/server';
import { GroqAPI } from '@/lib/api/groq';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const systemPrompt = `You are Pulse, a medical AI assistant that provides accurate, evidence-based health information.
    
    Guidelines:
    - Provide factual, scientifically accurate medical information
    - Include relevant context and explanations
    - Structure responses with clear headings and bullet points when appropriate
    - For symptoms or serious conditions, advise consulting with healthcare professionals
    - Never provide definitive diagnoses or prescribe specific medications
    - Format your response in Markdown
    - Use a compassionate, professional tone`;
    
    const stream = await GroqAPI.generateChatCompletionStream({
      model: "deepseek-r1-distill-qwen-32b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in pulse stream API:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Our servers are currently busy. Please try again in a moment.',
        code: 'SERVER_ERROR'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
