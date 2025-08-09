import { ProcessedTemplate } from '@/types';

export class TemplateEncoder {
  // Encode template to base64 URL-safe string
  static encode(template: ProcessedTemplate): string {
    try {
      const minified = {
        h: template.html,
        t: template.plainText,
        v: template.variables,
        n: template.originalFileName,
      };
      
      const json = JSON.stringify(minified);
      // Use base64url encoding (URL-safe)
      const base64 = Buffer.from(json).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      return base64;
    } catch (error) {
      console.error('Failed to encode template:', error);
      throw new Error('Failed to encode template');
    }
  }

  // Decode template from base64 URL-safe string
  static decode(encoded: string): ProcessedTemplate | null {
    try {
      // Add back padding if needed
      const base64 = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const paddingNeeded = (4 - (base64.length % 4)) % 4;
      const padded = base64 + '='.repeat(paddingNeeded);
      
      const json = Buffer.from(padded, 'base64').toString('utf-8');
      const minified = JSON.parse(json);
      
      return {
        id: Date.now().toString(),
        html: minified.h,
        plainText: minified.t,
        variables: minified.v,
        originalFileName: minified.n,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to decode template:', error);
      return null;
    }
  }

  // Create a shareable URL
  static createShareableUrl(template: ProcessedTemplate, baseUrl: string): string {
    const encoded = this.encode(template);
    return `${baseUrl}/render/${encoded}`;
  }
}