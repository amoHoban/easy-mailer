import { ProcessedTemplate } from '@/types';
import { nanoid } from 'nanoid';

// Try to import Vercel KV, fallback to Upstash Redis
let storage: any = null;

async function initStorage() {
  if (storage) return storage;

  // Try Vercel KV first (automatically configured in Vercel)
  if (process.env.KV_URL) {
    try {
      const { kv } = await import('@vercel/kv');
      storage = kv;
      console.log('Using Vercel KV storage');
      return storage;
    } catch (error) {
      console.log('Vercel KV not available, trying Upstash');
    }
  }

  // Fallback to Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      storage = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log('Using Upstash Redis storage');
      return storage;
    } catch (error) {
      console.log('Upstash Redis not available');
    }
  }

  // Fallback to in-memory storage (for development)
  console.log('Using in-memory storage (not suitable for production)');
  const memoryStore = new Map<string, any>();
  storage = {
    get: async (key: string) => memoryStore.get(key),
    set: async (key: string, value: any, options?: any) => {
      memoryStore.set(key, value);
      if (options?.ex) {
        setTimeout(() => memoryStore.delete(key), options.ex * 1000);
      }
      return 'OK';
    },
    del: async (key: string) => memoryStore.delete(key),
  };
  return storage;
}

export class TemplateStorage {
  // Generate a short, URL-safe ID (6-8 characters)
  static generateShortId(): string {
    return nanoid(8); // 8 characters, URL-safe
  }

  // Store template with a short ID
  static async store(template: ProcessedTemplate): Promise<string> {
    const store = await initStorage();
    const shortId = this.generateShortId();
    
    // Store for 7 days (604800 seconds)
    const ttl = 604800;
    
    try {
      // Store minimal data to save space
      const minimalTemplate = {
        h: template.html,
        t: template.plainText,
        v: template.variables,
        n: template.originalFileName,
        c: new Date().toISOString(),
      };
      
      await store.set(
        `template:${shortId}`,
        JSON.stringify(minimalTemplate),
        { ex: ttl }
      );
      
      return shortId;
    } catch (error) {
      console.error('Failed to store template:', error);
      // Fallback to base64 encoding if storage fails
      return this.generateFallbackId(template);
    }
  }

  // Retrieve template by short ID
  static async retrieve(shortId: string): Promise<ProcessedTemplate | null> {
    const store = await initStorage();
    
    try {
      // First try to get from storage
      const data = await store.get(`template:${shortId}`);
      
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return {
          id: shortId,
          html: parsed.h,
          plainText: parsed.t,
          variables: parsed.v,
          originalFileName: parsed.n,
          createdAt: new Date(parsed.c || Date.now()),
        };
      }
      
      // If not found in storage, try to decode as base64 (backward compatibility)
      if (shortId.length > 20) {
        return this.decodeFallback(shortId);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve template:', error);
      
      // Try to decode as base64 fallback
      if (shortId.length > 20) {
        return this.decodeFallback(shortId);
      }
      
      return null;
    }
  }

  // Delete template
  static async delete(shortId: string): Promise<void> {
    const store = await initStorage();
    try {
      await store.del(`template:${shortId}`);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }

  // Fallback: Generate base64 ID if storage is not available
  private static generateFallbackId(template: ProcessedTemplate): string {
    try {
      const minified = {
        h: template.html.substring(0, 2000), // Limit size
        t: template.plainText.substring(0, 1000),
        v: template.variables,
        n: template.originalFileName,
      };
      
      const json = JSON.stringify(minified);
      return Buffer.from(json).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (error) {
      console.error('Failed to generate fallback ID:', error);
      return nanoid(8);
    }
  }

  // Decode base64 fallback
  private static decodeFallback(encoded: string): ProcessedTemplate | null {
    try {
      const base64 = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const paddingNeeded = (4 - (base64.length % 4)) % 4;
      const padded = base64 + '='.repeat(paddingNeeded);
      
      const json = Buffer.from(padded, 'base64').toString('utf-8');
      const minified = JSON.parse(json);
      
      return {
        id: encoded,
        html: minified.h,
        plainText: minified.t,
        variables: minified.v,
        originalFileName: minified.n,
        createdAt: new Date(),
      };
    } catch (error) {
      return null;
    }
  }
}