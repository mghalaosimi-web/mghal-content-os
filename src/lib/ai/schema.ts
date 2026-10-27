import { z } from 'zod';
import { ContentTypeEnum, PlatformTypeEnum } from '@/lib/validation/content.schema';

export const generatedVariantSchema = z.object({
  platform: PlatformTypeEnum,
  caption: z.string().min(5, 'Caption must be at least 5 characters'),
  hashtags: z.array(z.string().trim()).min(1, 'At least 1 hashtag is required'),
  mediaSuggestion: z.string().min(5, 'Media suggestion must be specified'),
  callToAction: z.string().optional(),
});

export const generatedContentResultSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  brief: z.string().min(10, 'Brief must be at least 10 characters'),
  contentType: ContentTypeEnum,
  language: z.string().default('ar'),
  variants: z
    .array(generatedVariantSchema)
    .refine((variants) => {
      const platforms = variants.map((v) => v.platform);
      return (
        platforms.includes('FACEBOOK') &&
        platforms.includes('INSTAGRAM') &&
        platforms.includes('TIKTOK')
      );
    }, 'Variants must contain entries for FACEBOOK, INSTAGRAM, and TIKTOK')
    .refine((variants) => {
      // Strictly ensure WhatsApp is absent
      return !variants.some((v) => (v.platform as string) === 'WHATSAPP');
    }, 'WhatsApp is strictly forbidden in this platform scope'),
  suggestedVisualPrompt: z.string().min(5, 'Visual prompt is required'),
  modelUsed: z.string().default('gemini-2.5-flash'),
  durationMs: z.number().int().nonnegative().optional(),
});

export type GeneratedContentResultSchema = z.infer<typeof generatedContentResultSchema>;
