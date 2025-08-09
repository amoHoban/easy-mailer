import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { verificationService } from '@/lib/verificationService';
import { templateStore } from '@/lib/templateStore';
import { documentProcessor } from '@/lib/documentProcessor';

export async function POST(request: NextRequest) {
  try {
    const { templateId, variables, to, subject } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Email and subject are required' },
        { status: 400 }
      );
    }

    const template = templateStore.get(templateId);
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

    // Create verification token
    const token = verificationService.createVerification(to, templateId, variables, subject);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    const verificationUrl = `${baseUrl}/api/email/verify/${token}`;
    
    // Send verification email
    const verificationResult = await emailService.sendVerificationEmail(to, verificationUrl);
    
    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          details: verificationResult.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}