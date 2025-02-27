// /app/api/pulse/document/stream/route.ts
import { NextRequest } from 'next/server';
import { GroqAPI } from '@/lib/api/groq';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { documentContent } = await request.json();
    
    if (!documentContent || typeof documentContent !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Document content is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // First, we analyze the document content
    const systemPrompt = `You are Pulse, a medical AI assistant that analyzes medical documents.
    
    Guidelines:
    - Extract and explain key medical information from the document
    - Define medical terms and explain their significance
    - Format your response in Markdown with clear sections
    - Maintain a professional, educational tone
    - Focus on explaining the document in an accessible way
    - Never make definitive diagnoses or recommend specific treatments`;
    
    const stream = await GroqAPI.generateChatCompletionStream({
      model: "deepseek-r1-distill-qwen-32b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze this medical document and explain its key points in an accessible way:\n\n${documentContent.substring(0, 10000)}` }
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
    console.error('Error in document stream API:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Our document analysis servers are currently busy. Please try again in a moment.',
        code: 'SERVER_ERROR'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
