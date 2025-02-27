import { NextRequest, NextResponse } from 'next/server';
import { analyzeMedicalQuery } from '@/lib/api/pulse-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    const response = await analyzeMedicalQuery(query);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in pulse query API:', error);
    return NextResponse.json(
      { 
        message: 'An error occurred while processing your request',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
