import { NextRequest, NextResponse } from 'next/server';
import { TemplateDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await TemplateDB.retrieve(params.id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to retrieve template:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve template' },
      { status: 500 }
    );
  }
}