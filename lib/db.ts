import { neon } from '@neondatabase/serverless';
import { ProcessedTemplate } from '@/types';
import { nanoid } from 'nanoid';

// Initialize Neon connection - ensure postgresql:// format
const dbUrl = process.env.DATABASE_URL || '';
const sql = neon(dbUrl.startsWith('postgres://') ? dbUrl.replace('postgres://', 'postgresql://') : dbUrl);

// Create table if not exists (run this once)
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(20) PRIMARY KEY,
        html TEXT NOT NULL,
        plain_text TEXT NOT NULL,
        variables JSONB NOT NULL,
        original_file_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `;
    
    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_templates_expires_at 
      ON templates(expires_at)
    `;
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export class TemplateDB {
  // Generate a short, URL-safe ID
  static generateShortId(): string {
    return nanoid(8);
  }

  // Store template in PostgreSQL
  static async store(template: ProcessedTemplate): Promise<string> {
    const shortId = this.generateShortId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      await sql`
        INSERT INTO templates (
          id, 
          html, 
          plain_text, 
          variables, 
          original_file_name, 
          expires_at
        ) VALUES (
          ${shortId},
          ${template.html},
          ${template.plainText},
          ${JSON.stringify(template.variables)},
          ${template.originalFileName},
          ${expiresAt}
        )
      `;

      // Clean up expired templates occasionally
      if (Math.random() < 0.1) { // 10% chance
        this.cleanupExpired();
      }

      return shortId;
    } catch (error) {
      console.error('Failed to store template:', error);
      // Fallback to returning a temporary ID if storage fails
      return this.generateShortId();
    }
  }

  // Retrieve template from PostgreSQL
  static async retrieve(shortId: string): Promise<ProcessedTemplate | null> {
    try {
      const result = await sql`
        SELECT 
          id,
          html,
          plain_text,
          variables,
          original_file_name,
          created_at
        FROM templates
        WHERE id = ${shortId}
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1
      `;

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      return {
        id: row.id,
        html: row.html,
        plainText: row.plain_text,
        variables: row.variables as any,
        originalFileName: row.original_file_name || 'Untitled',
        createdAt: new Date(row.created_at),
      };
    } catch (error) {
      console.error('Failed to retrieve template:', error);
      return null;
    }
  }

  // Delete template
  static async delete(shortId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM templates
        WHERE id = ${shortId}
      `;
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }

  // Clean up expired templates
  static async cleanupExpired(): Promise<void> {
    try {
      const result = await sql`
        DELETE FROM templates
        WHERE expires_at < CURRENT_TIMESTAMP
      `;
      console.log('Cleaned up expired templates');
    } catch (error) {
      console.error('Failed to cleanup expired templates:', error);
    }
  }

  // Get template count (for monitoring)
  static async getCount(): Promise<number> {
    try {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM templates
        WHERE expires_at > CURRENT_TIMESTAMP
      `;
      return parseInt(result[0].count);
    } catch (error) {
      console.error('Failed to get template count:', error);
      return 0;
    }
  }
}