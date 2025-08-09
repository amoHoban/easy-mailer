import { EmailOptions, EmailResponse } from '@/types';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export class EmailService {
  private provider: string;
  private resend?: Resend;
  private transporter?: nodemailer.Transporter;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'resend';
    
    switch (this.provider) {
      case 'resend':
        if (process.env.RESEND_API_KEY) {
          this.resend = new Resend(process.env.RESEND_API_KEY);
        }
        break;
      
      case 'sendgrid':
        if (process.env.SENDGRID_API_KEY) {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        }
        break;
      
      case 'smtp':
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        break;
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      switch (this.provider) {
        case 'resend':
          if (!this.resend) {
            throw new Error('Resend not configured');
          }
          const resendResult = await this.resend.emails.send({
            from: options.from || process.env.DEFAULT_FROM_EMAIL || 'onboarding@resend.dev',
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html || '',
            text: options.text,
          });
          return {
            success: true,
            messageId: resendResult.data?.id,
          };

        case 'sendgrid':
          const msg = {
            to: options.to,
            from: options.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com',
            subject: options.subject,
            text: options.text,
            html: options.html,
          };
          const sgResult = await sgMail.send(msg as any);
          return {
            success: true,
            messageId: sgResult[0].headers['x-message-id'],
          };

        case 'smtp':
          if (!this.transporter) {
            throw new Error('SMTP not configured');
          }
          const info = await this.transporter.sendMail({
            from: options.from || process.env.DEFAULT_FROM_EMAIL,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
          });
          return {
            success: true,
            messageId: info.messageId,
          };

        default:
          throw new Error('No email provider configured');
      }
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendVerificationEmail(to: string, verificationUrl: string): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification Required</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Please verify your email address to send your message.</p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
              For security reasons, we need to confirm that you own this email address before we can send emails on your behalf.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify & Send Email</a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              This verification link will expire in 1 hour. If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '✉️ Verify Your Email to Send Message',
      html,
      text: `Please verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 1 hour.`,
    });
  }
}

export const emailService = new EmailService();