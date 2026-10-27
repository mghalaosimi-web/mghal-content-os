import { describe, it, expect } from 'vitest';
import { AIContentGenerator } from '@/modules/content/ai-generator';

describe('AIContentGenerator Tests', () => {
  it('should generate content without crashing even if database is offline', async () => {
    const response = await AIContentGenerator.generate({
      topic: 'كيف تنظم وقتك وتزيد إنتاجيتك',
      contentType: 'SELF_DEVELOPMENT',
      saveToDatabase: false,
    });

    expect(response.success).toBe(true);
    expect(response.content.variants).toHaveLength(3);
    expect(response.content.language).toBe('ar');
    expect(response.persisted).toBe(false);
  });
});
