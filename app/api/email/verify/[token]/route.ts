import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { verificationService } from '@/lib/verificationService';
import { templateStore } from '@/lib/templateStore';
import { documentProcessor } from '@/lib/documentProcessor';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const verification = verificationService.verifyToken(params.token);
    
    if (!verification) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Failed</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
              <h2 style="color: #ef4444; margin-bottom: 20px;">❌ Verification Failed</h2>
              <p style="color: #666; margin-bottom: 30px;">This verification link is invalid or has expired.</p>
              <a href="/" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Go Back</a>
            </div>
          </body>
        </html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Try to get template from verification data or from store
    const template = (verification as any).templateData || templateStore.get(verification.templateId);
    if (!template) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Template Not Found</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
              <h2 style="color: #ef4444; margin-bottom: 20px;">❌ Template Not Found</h2>
              <p style="color: #666; margin-bottom: 30px;">The email template could not be found.</p>
              <a href="/" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Go Back</a>
            </div>
          </body>
        </html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Render template with variables
    const renderedHtml = documentProcessor.replaceVariables(template.html, verification.variables);
    const renderedText = documentProcessor.replaceVariables(template.plainText, verification.variables);

    // Send the actual email
    const result = await emailService.sendEmail({
      to: verification.email,
      from: verification.email,
      subject: verification.subject,
      html: renderedHtml,
      text: renderedText,
    });

    // Delete verification after use
    verificationService.deleteVerification(params.token);

    if (result.success) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Sent Successfully</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
              <h2 style="color: #10b981; margin-bottom: 20px;">✅ Email Sent Successfully!</h2>
              <p style="color: #666; margin-bottom: 10px;">Your email has been sent from:</p>
              <p style="color: #333; font-weight: 600; margin-bottom: 30px;">${verification.email}</p>
              <p style="color: #999; font-size: 14px;">You can close this window now.</p>
            </div>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    } else {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Failed to Send Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
              <h2 style="color: #ef4444; margin-bottom: 20px;">❌ Failed to Send Email</h2>
              <p style="color: #666; margin-bottom: 30px;">${result.error || 'An error occurred while sending the email'}</p>
              <a href="/" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Try Again</a>
            </div>
          </body>
        </html>`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  } catch (error) {
    console.error('Verify and send error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
            <h2 style="color: #ef4444; margin-bottom: 20px;">❌ An Error Occurred</h2>
            <p style="color: #666; margin-bottom: 30px;">Something went wrong. Please try again.</p>
            <a href="/" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: 500;">Go Back</a>
          </div>
        </body>
      </html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}