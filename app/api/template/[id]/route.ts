import { NextRequest, NextResponse } from 'next/server';
import { templateStore } from '@/lib/templateStore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const template = templateStore.get(params.id);

  if (!template) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(template);
}