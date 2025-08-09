import { NextRequest, NextResponse } from 'next/server';
import { templateStore } from '@/lib/templateStore';
import { documentProcessor } from '@/lib/documentProcessor';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { variables } = await request.json();
    
    const template = templateStore.get(params.id);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check for missing required variables
    const missingRequired = template.variables
      .filter(v => v.required && !variables[v.name])
      .map(v => v.name);

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required variables',
          missing: missingRequired,
        },
        { status: 400 }
      );
    }

    // Render template with variables
    const renderedHtml = documentProcessor.replaceVariables(template.html, variables);
    const renderedText = documentProcessor.replaceVariables(template.plainText, variables);

    return NextResponse.json({
      html: renderedHtml,
      plainText: renderedText,
    });
  } catch (error) {
    console.error('Render error:', error);
    return NextResponse.json(
      { error: 'Failed to render template' },
      { status: 500 }
    );
  }
}