import { describe, it, expect } from 'vitest';
import { generatedContentResultSchema } from '@/lib/ai/schema';

describe('AI Schema & Validation Tests', () => {
  it('should accept valid AI generated result for Facebook, Instagram, and TikTok', () => {
    const validResult = {
      title: 'قوة الانضباط الذاتي',
      brief: 'محتوى تحفيزي عن أهمية الالتزام اليومي لتحقيق الأهداف الكبرى.',
      contentType: 'MOTIVATIONAL',
      language: 'ar',
      variants: [
        {
          platform: 'FACEBOOK',
          caption: 'نص المنشور لفيسبوك بالتفصيل والمناقشة...',
          hashtags: ['#تطوير', '#إلهام'],
          mediaSuggestion: 'تصميم عريض داكن',
          callToAction: 'شاركنا رأيك',
        },
        {
          platform: 'INSTAGRAM',
          caption: 'كابشن إنستغرام الأنيق...',
          hashtags: ['#تحفيز', '#ريادة'],
          mediaSuggestion: 'صورة عمودية بدقة عالية',
          callToAction: 'احفظ المنشور',
        },
        {
          platform: 'TIKTOK',
          caption: 'هوك سريع وكلام مباشر في 15 ثانية...',
          hashtags: ['#fyp', '#نصيحة'],
          mediaSuggestion: 'فيديو عمودي سريع مع ترجمة',
          callToAction: 'تابع للمزيد',
        },
      ],
      suggestedVisualPrompt: 'A minimalist dark aesthetic workspace with warm desk lamp, 8k resolution',
      modelUsed: 'gemini-2.5-flash',
    };

    const parsed = generatedContentResultSchema.safeParse(validResult);
    expect(parsed.success).toBe(true);
  });

  it('should reject if any of the 3 required platforms is missing', () => {
    const missingTikTok = {
      title: 'عنوان تجريبي',
      brief: 'وصف تجريبي موجز لفكرة المحتوى.',
      contentType: 'MOTIVATIONAL',
      variants: [
        {
          platform: 'FACEBOOK',
          caption: 'نص فيسبوك',
          hashtags: ['#هاشتاق'],
          mediaSuggestion: 'صورة',
        },
        {
          platform: 'INSTAGRAM',
          caption: 'نص إنستغرام',
          hashtags: ['#هاشتاق'],
          mediaSuggestion: 'صورة',
        },
      ],
      suggestedVisualPrompt: 'Prompt',
    };

    const parsed = generatedContentResultSchema.safeParse(missingTikTok);
    expect(parsed.success).toBe(false);
  });

  it('should strictly reject any attempt to include WHATSAPP in the variants', () => {
    const withWhatsApp = {
      title: 'عنوان تجريبي',
      brief: 'وصف تجريبي موجز لفكرة المحتوى.',
      contentType: 'MOTIVATIONAL',
      variants: [
        {
          platform: 'FACEBOOK',
          caption: 'نص فيسبوك',
          hashtags: ['#هاشتاق'],
          mediaSuggestion: 'صورة',
        },
        {
          platform: 'INSTAGRAM',
          caption: 'نص إنستغرام',
          hashtags: ['#هاشتاق'],
          mediaSuggestion: 'صورة',
        },
        {
          platform: 'TIKTOK',
          caption: 'نص تيك توك',
          hashtags: ['#هاشتاق'],
          mediaSuggestion: 'فيديو',
        },
        {
          platform: 'WHATSAPP', // Forbidden platform!
          caption: 'حالة واتساب',
          hashtags: ['#حالة'],
          mediaSuggestion: 'صورة',
        },
      ],
      suggestedVisualPrompt: 'Prompt',
    };

    const parsed = generatedContentResultSchema.safeParse(withWhatsApp);
    expect(parsed.success).toBe(false);
  });
});
