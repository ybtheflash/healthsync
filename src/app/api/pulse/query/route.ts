// /app/api/pulse/query/route.ts
import { NextRequest } from 'next/server';
import { GroqAPI } from '@/lib/api/groq';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query } = body;
  
  if (!query || typeof query !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Query is required and must be a string' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const systemPrompt = `You are Pulse, a medical AI assistant that provides accurate, evidence-based health information.
    
    Guidelines:
    - Provide factual, scientifically accurate medical information
    - Include relevant context and explanations
    - Structure responses with clear headings and bullet points when appropriate
    - For symptoms or serious conditions, advise consulting with healthcare professionals
    - Never provide definitive diagnoses or prescribe specific medications
    - Cite reliable medical sources when possible
    - Format your response in Markdown
    - Use a compassionate, professional tone
    
    IMPORTANT: DO NOT include any <think> tags or thinking process in your final output. Only return the final response.`;
    
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
    console.error('Error in pulse query API:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Our servers are currently busy. Please try again in a moment.',
        code: 'SERVER_ERROR'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
