import { ContentStorage } from './storage';
import {
  createContentItemSchema,
  updateContentItemSchema,
  createPlatformVariantSchema,
  createMediaAssetSchema,
  createAuditLogSchema,
  type CreateContentItemInput,
  type UpdateContentItemInput,
  type CreatePlatformVariantInput,
  type CreateMediaAssetInput,
  type CreateAuditLogInput,
  type ContentStatus,
} from '@/lib/validation/content.schema';

export class ContentService {
  /**
   * Validate and prepare content item data
   */
  static validateContentInput(input: unknown): CreateContentItemInput {
    return createContentItemSchema.parse(input);
  }

  /**
   * Validate and prepare content item update data
   */
  static validateUpdateInput(input: unknown): UpdateContentItemInput {
    return updateContentItemSchema.parse(input);
  }

  /**
   * Validate and prepare platform variant data
   */
  static validateVariantInput(input: unknown): CreatePlatformVariantInput {
    return createPlatformVariantSchema.parse(input);
  }

  /**
   * Validate and prepare media asset data
   */
  static validateMediaInput(input: unknown): CreateMediaAssetInput {
    return createMediaAssetSchema.parse(input);
  }

  /**
   * Validate and prepare audit log data
   */
  static validateAuditLogInput(input: unknown): CreateAuditLogInput {
    return createAuditLogSchema.parse(input);
  }

  /**
   * Create a new ContentItem with audit logging safely via ContentStorage
   */
  static async createContent(input: CreateContentItemInput) {
    const validated = this.validateContentInput(input);
    const item = await ContentStorage.add({
      title: validated.title,
      topic: validated.topic,
      brief: validated.brief || null,
      contentType: validated.contentType,
      status: validated.status,
      language: validated.language,
      platformVariants: [],
    });

    await this.recordAudit({
      action: 'CONTENT_CREATED',
      entityType: 'ContentItem',
      entityId: item.id,
      status: 'SUCCESS',
      metadata: { title: item.title, contentType: item.contentType },
    }).catch(() => {
      // Non-blocking audit error
    });

    return item;
  }

  /**
   * Update status of a ContentItem safely via ContentStorage
   */
  static async updateStatus(id: string, status: ContentStatus) {
    const updated = await ContentStorage.updateStatus(id, status);
    return updated;
  }

  /**
   * Record an audit log entry safely via ContentStorage
   */
  static async recordAudit(input: CreateAuditLogInput) {
    const validated = this.validateAuditLogInput(input);
    return ContentStorage.recordAudit({
      action: validated.action,
      entityType: validated.entityType,
      entityId: validated.entityId || null,
      status: validated.status,
      durationMs: validated.durationMs,
      errorCode: validated.errorCode,
      metadata: validated.metadata,
    });
  }
}
