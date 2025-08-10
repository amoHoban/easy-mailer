import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import { ProcessedTemplate, TemplateVariable } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentProcessor {
  private static readonly VARIABLE_PATTERN = /\[([*]?)([^\]]+)\]/g;

  async processDocument(buffer: Buffer, originalName: string): Promise<ProcessedTemplate> {
    try {
      const fileExtension = originalName.toLowerCase().split('.').pop();
      let html = '';
      let plainText = '';

      switch (fileExtension) {
        case 'docx':
        case 'doc':
          // Use Mammoth for Word documents
          const result = await mammoth.convertToHtml({ buffer });
          const textResult = await mammoth.extractRawText({ buffer });
          html = result.value;
          plainText = textResult.value;
          break;

        case 'rtf':
          // For RTF files, extract plain text content
          // RTF files have a specific structure, we'll extract readable text
          plainText = this.extractTextFromRTF(buffer.toString('utf8'));
          // Convert plain text to basic HTML
          html = this.convertPlainTextToHtml(plainText);
          break;

        case 'txt':
          // For plain text files
          plainText = buffer.toString('utf8');
          html = this.convertPlainTextToHtml(plainText);
          break;

        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      const sanitizedHtml = this.sanitizeContent(html);
      const variables = this.extractVariables(sanitizedHtml + ' ' + plainText);

      return {
        id: uuidv4(),
        html: sanitizedHtml,
        plainText,
        variables,
        originalFileName: originalName,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTextFromRTF(rtfContent: string): string {
    // Basic RTF text extraction
    // Remove RTF control words and groups
    let text = rtfContent;
    
    // Remove RTF header
    text = text.replace(/^{\\rtf1[^}]*}/, '');
    
    // Remove RTF groups
    text = text.replace(/{\\[^}]*}/g, '');
    
    // Replace RTF line breaks with actual line breaks
    text = text.replace(/\\par\s*/g, '\n');
    text = text.replace(/\\line\s*/g, '\n');
    
    // Remove other RTF control words (start with backslash)
    text = text.replace(/\\[a-z]+\d*\s?/gi, '');
    
    // Remove extra brackets
    text = text.replace(/[{}]/g, '');
    
    // Replace RTF special characters
    text = text.replace(/\\'([0-9a-f]{2})/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ');
    text = text.trim();
    
    return text;
  }

  private convertPlainTextToHtml(text: string): string {
    // Convert plain text to HTML, preserving line breaks and basic formatting
    let html = text
      // Escape HTML special characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      // Convert line breaks to <br> tags
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph tags
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
    
    return html;
  }

  private sanitizeContent(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 
        'tbody', 'tr', 'td', 'th', 'figure', 'figcaption', 'br'
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height'],
        a: ['href', 'target'],
        '*': ['style'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'data'],
      allowedStyles: {
        '*': {
          'color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/],
          'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/],
          'font-size': [/^\d+(?:px|em|rem|%)$/],
          'text-align': [/^(left|right|center|justify)$/],
          'font-weight': [/^(bold|normal|\d{3})$/],
          'font-style': [/^(italic|normal)$/],
          'text-decoration': [/^(underline|none|line-through)$/],
        },
      },
    });
  }

  private extractVariables(content: string): TemplateVariable[] {
    const variables = new Map<string, boolean>();
    let match;

    DocumentProcessor.VARIABLE_PATTERN.lastIndex = 0;
    while ((match = DocumentProcessor.VARIABLE_PATTERN.exec(content)) !== null) {
      const isRequired = match[1] === '*';
      const variableName = match[2].trim();
      
      if (!variables.has(variableName) || (isRequired && !variables.get(variableName))) {
        variables.set(variableName, isRequired);
      }
    }

    return Array.from(variables.entries()).map(([name, required]) => ({
      name,
      required,
    }));
  }

  replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(DocumentProcessor.VARIABLE_PATTERN, (match, star, varName) => {
      const trimmedName = varName.trim();
      return variables[trimmedName] || '';
    });
  }
}

export const documentProcessor = new DocumentProcessor();