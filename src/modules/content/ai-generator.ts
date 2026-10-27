import { getAIProvider, type ContentGenerationInput, type GeneratedContentResult } from '@/lib/ai';
import { ContentService } from './service';
import prisma from '@/lib/db/prisma';

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
   * and optionally persist to PostgreSQL database via ContentService.
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

    // Persist to database if requested (default: true)
    if (options.saveToDatabase !== false) {
      try {
        const item = await prisma.contentItem.create({
          data: {
            title: result.title,
            topic: options.topic,
            brief: result.brief,
            contentType: result.contentType,
            status: 'PENDING_APPROVAL',
            language: result.language,
            platformVariants: {
              create: result.variants.map((v) => ({
                platform: v.platform,
                caption: v.caption,
                hashtags: v.hashtags,
                status: 'READY_FOR_REVIEW',
              })),
            },
          },
        });

        contentItemId = item.id;
        persisted = true;

        const audit = await ContentService.recordAudit({
          action: 'AI_CONTENT_GENERATION_SUCCESS',
          entityType: 'ContentItem',
          entityId: item.id,
          status: 'SUCCESS',
          durationMs: result.durationMs,
          metadata: {
            modelUsed: result.modelUsed,
            topic: options.topic,
            platformsCount: result.variants.length,
          },
        });

        auditLogId = audit?.id;
      } catch (dbError: unknown) {
        // If DB is offline (e.g. dev environment before Postgres is started),
        // we log gracefully and still return the generated content to the user.
        persisted = false;
        console.warn(
          'Database offline or migration pending; returning generated content in memory:',
          (dbError as Error).message
        );
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
