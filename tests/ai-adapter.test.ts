import { describe, it, expect } from 'vitest';
import { GeminiAdapter } from '@/lib/ai/adapters/gemini.adapter';

describe('GeminiAdapter Tests', () => {
  it('should initialize with default providerName and model', () => {
    const adapter = new GeminiAdapter();
    expect(adapter.providerName).toBe('GeminiAdapter');
  });

  it('should generate structured Arabic fallback content when no API key is provided', async () => {
    const adapter = new GeminiAdapter({ apiKey: undefined });
    const result = await adapter.generateContent({
      topic: 'الاستثمار في تعلم المهارات الرقمية',
      contentType: 'SELF_DEVELOPMENT',
      tone: 'عملي وتحفيزي',
    });

    expect(result.title).toBeDefined();
    expect(result.brief).toContain('الاستثمار في تعلم المهارات الرقمية');
    expect(result.language).toBe('ar');
    expect(result.variants).toHaveLength(3);

    const platforms = result.variants.map((v) => v.platform);
    expect(platforms).toContain('FACEBOOK');
    expect(platforms).toContain('INSTAGRAM');
    expect(platforms).toContain('TIKTOK');
    expect(platforms).not.toContain('WHATSAPP');
    expect(result.mode).toBe('LOCAL_FALLBACK');
    expect(adapter.hasValidApiKey()).toBe(false);

    expect(result.suggestedVisualPrompt).toBeDefined();
  });

  it('should return valid captions and hashtags for each platform', async () => {
    const adapter = new GeminiAdapter({ apiKey: undefined });
    const result = await adapter.generateContent({
      topic: 'أهمية الرياضة الصباحية',
      contentType: 'AWARENESS',
    });

    for (const variant of result.variants) {
      expect(variant.caption.length).toBeGreaterThan(10);
      expect(variant.hashtags.length).toBeGreaterThan(0);
      expect(variant.mediaSuggestion.length).toBeGreaterThan(5);
    }
  });

  it('should detect valid API key correctly', () => {
    const adapter = new GeminiAdapter({ apiKey: 'valid-mock-gemini-key-for-unit-test' });
    expect(adapter.hasValidApiKey()).toBe(true);
  });
});
