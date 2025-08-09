import { NextRequest, NextResponse } from 'next/server';
import { documentProcessor } from '@/lib/documentProcessor';

export async function POST(request: NextRequest) {
  try {
    const { template, variables } = await request.json();
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template data required' },
        { status: 400 }
      );
    }

    // Check for missing required variables
    const missingRequired = template.variables
      .filter((v: any) => v.required && !variables[v.name])
      .map((v: any) => v.name);

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