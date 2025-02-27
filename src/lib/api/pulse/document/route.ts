import { NextRequest, NextResponse } from 'next/server';
import { analyzeMedicalDocument } from '@/lib/api/pulse-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentContent } = body;
    
    if (!documentContent || typeof documentContent !== 'string') {
      return NextResponse.json(
        { error: 'Document content is required and must be a string' },
        { status: 400 }
      );
    }
    
    const response = await analyzeMedicalDocument(documentContent);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in pulse document API:', error);
    return NextResponse.json(
      { 
        message: 'An error occurred while processing your document',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
