import { NextRequest, NextResponse } from 'next/server';
import { documentProcessor } from '@/lib/documentProcessor';
import { templateStore } from '@/lib/templateStore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/rtf',
      'text/rtf',
      'text/plain',
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(docx?|rtf|txt)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a .docx, .doc, .rtf, or .txt file' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process document
    const processedTemplate = await documentProcessor.processDocument(
      buffer,
      file.name
    );

    // Store template (for backward compatibility)
    templateStore.set(processedTemplate);

    // Return full template data for client-side storage
    return NextResponse.json({
      id: processedTemplate.id,
      html: processedTemplate.html,
      plainText: processedTemplate.plainText,
      variables: processedTemplate.variables,
      originalFileName: processedTemplate.originalFileName,
      createdAt: processedTemplate.createdAt,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}