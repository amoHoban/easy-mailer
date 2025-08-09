export interface TemplateVariable {
  name: string;
  required: boolean;
  value?: string;
}

export interface ProcessedTemplate {
  id: string;
  html: string;
  plainText: string;
  variables: TemplateVariable[];
  originalFileName: string;
  createdAt: Date;
}

export interface EmailVerification {
  token: string;
  email: string;
  templateId: string;
  variables: Record<string, string>;
  subject: string;
  expiresAt: Date;
  verified: boolean;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResponse>;
}

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}