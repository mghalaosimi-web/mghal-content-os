import { getAIProvider, type ContentGenerationInput, type GeneratedContentResult } from '@/lib/ai';
import { ContentStorage } from './storage';

export interface GenerateAndSaveOptions extends ContentGenerationInput {
  saveToDatabase?: boolean;
}

export interface GeneratedContentResponse {
  success: boolean;
  content: GeneratedContentResult;
  persisted: boolean;
  contentItemId?: string;
  auditLogId?: string;
  error?: string;
}

export class AIContentGenerator {
  /**
   * Generate Arabic content for Facebook, Instagram, and TikTok using AI provider
   * and persist to ContentStorage (Prisma or fallback store).
   */
  static async generate(options: GenerateAndSaveOptions): Promise<GeneratedContentResponse> {
    const provider = getAIProvider();
    const result = await provider.generateContent({
      topic: options.topic,
      contentType: options.contentType,
      tone: options.tone,
      targetAudience: options.targetAudience,
      keywords: options.keywords,
      language: options.language || 'ar',
    });

    let persisted = false;
    let contentItemId: string | undefined;
    let auditLogId: string | undefined;

    // Persist to storage if requested
    if (options.saveToDatabase !== false) {
      try {
        const stored = await ContentStorage.add({
          title: result.title,
          topic: options.topic,
          brief: result.brief,
          contentType: result.contentType,
          status: 'PENDING_APPROVAL',
          language: result.language,
          platformVariants: result.variants.map((v) => ({
            id: '',
            contentItemId: '',
            platform: v.platform,
            caption: v.caption,
            hashtags: v.hashtags,
            status: 'READY_FOR_REVIEW',
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        });

        contentItemId = stored.id;
        persisted = true;

        const audit = await ContentStorage.recordAudit({
          action: 'AI_CONTENT_GENERATION_SUCCESS',
          entityType: 'ContentItem',
          entityId: stored.id,
          status: 'SUCCESS',
          durationMs: result.durationMs,
          metadata: {
            modelUsed: result.modelUsed,
            topic: options.topic,
            variantsCount: result.variants.length,
          },
        });

        auditLogId = audit.id;
      } catch (err: unknown) {
        persisted = false;
        console.warn('Failed to persist generated content:', (err as Error).message);
      }
    }

    return {
      success: true,
      content: result,
      persisted,
      contentItemId,
      auditLogId,
    };
  }
}
