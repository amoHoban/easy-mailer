import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';
import { ProcessedTemplate, TemplateVariable } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentProcessor {
  private static readonly VARIABLE_PATTERN = /\[([*]?)([^\]]+)\]/g;

  async processDocument(buffer: Buffer, originalName: string): Promise<ProcessedTemplate> {
    try {
      const result = await mammoth.convertToHtml({ buffer });
      const textResult = await mammoth.extractRawText({ buffer });
      
      const sanitizedHtml = this.sanitizeContent(result.value);
      const plainText = textResult.value;
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
      throw new Error('Failed to process document');
    }
  }

  private sanitizeContent(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 
        'tbody', 'tr', 'td', 'th', 'figure', 'figcaption'
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