import prisma from '@/lib/db/prisma';
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
   * Create a new ContentItem with audit logging
   */
  static async createContent(input: CreateContentItemInput) {
    const validated = this.validateContentInput(input);
    const item = await prisma.contentItem.create({
      data: validated,
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
   * Update status of a ContentItem
   */
  static async updateStatus(id: string, status: ContentStatus) {
    const updated = await prisma.contentItem.update({
      where: { id },
      data: { status },
    });

    await this.recordAudit({
      action: 'CONTENT_STATUS_UPDATED',
      entityType: 'ContentItem',
      entityId: id,
      status: 'SUCCESS',
      metadata: { newStatus: status },
    }).catch(() => {});

    return updated;
  }

  /**
   * Record an audit log entry
   */
  static async recordAudit(input: CreateAuditLogInput) {
    const validated = this.validateAuditLogInput(input);
    return prisma.auditLog.create({
      data: {
        action: validated.action,
        entityType: validated.entityType,
        entityId: validated.entityId,
        status: validated.status,
        durationMs: validated.durationMs,
        errorCode: validated.errorCode,
        metadata: validated.metadata ? JSON.parse(JSON.stringify(validated.metadata)) : undefined,
      },
    });
  }
}
