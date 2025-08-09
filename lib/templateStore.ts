import { ProcessedTemplate } from '@/types';

class TemplateStore {
  private templates = new Map<string, ProcessedTemplate>();
  private readonly maxAge = 24 * 60 * 60 * 1000; // 24 hours

  set(template: ProcessedTemplate): void {
    this.templates.set(template.id, template);
    this.cleanup();
  }

  get(id: string): ProcessedTemplate | undefined {
    return this.templates.get(id);
  }

  delete(id: string): void {
    this.templates.delete(id);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, template] of this.templates.entries()) {
      if (now - template.createdAt.getTime() > this.maxAge) {
        this.templates.delete(id);
      }
    }
  }
}

export const templateStore = new TemplateStore();