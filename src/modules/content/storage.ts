import prisma, { isDatabaseAvailable } from '@/lib/db/prisma';
import type { ContentStatus, ContentType, PlatformType } from '@/types';
import {
  LocalJsonStorage,
  type StoredContentItem,
  type StoredPlatformVariant,
  type StoredMediaAsset,
  type StoredAuditLog,
} from './local-store';

export type { StoredContentItem, StoredPlatformVariant, StoredMediaAsset, StoredAuditLog };

export class ContentStorage {
  /**
   * Fetch all content items with optional status/platform filters.
   * Transparently uses persistent LocalJsonStorage if PostgreSQL is unavailable.
   */
  static async getAll(filter?: {
    status?: ContentStatus;
    contentType?: ContentType;
    search?: string;
  }): Promise<StoredContentItem[]> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const items = await prisma.contentItem.findMany({
          where: {
            status: filter?.status,
            contentType: filter?.contentType,
            title: filter?.search ? { contains: filter.search, mode: 'insensitive' } : undefined,
          },
          include: { platformVariants: true },
          orderBy: { createdAt: 'desc' },
        });
        return items as StoredContentItem[];
      } catch {
        // Graceful fallback to persistent local storage
        return LocalJsonStorage.getAllContent(filter);
      }
    }

    return LocalJsonStorage.getAllContent(filter);
  }

  /**
   * Get single content item by ID.
   */
  static async getById(id: string): Promise<StoredContentItem | null> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const item = await prisma.contentItem.findUnique({
          where: { id },
          include: { platformVariants: true },
        });
        return (item as StoredContentItem) || null;
      } catch {
        return LocalJsonStorage.getContentById(id);
      }
    }

    return LocalJsonStorage.getContentById(id);
  }

  /**
   * Add new item to storage.
   */
  static async add(
    item: Omit<StoredContentItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StoredContentItem> {
    const newItemId = `item-${Date.now()}`;
    const now = new Date();
    const newItem: StoredContentItem = {
      ...item,
      id: newItemId,
      createdAt: now,
      updatedAt: now,
      platformVariants: item.platformVariants.map((v) => ({
        ...v,
        id: `var-${Date.now()}-${v.platform.toLowerCase()}`,
        contentItemId: newItemId,
        createdAt: now,
        updatedAt: now,
      })),
    };

    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        await prisma.contentItem.create({
          data: {
            id: newItem.id,
            title: newItem.title,
            topic: newItem.topic,
            brief: newItem.brief,
            contentType: newItem.contentType,
            status: newItem.status,
            language: newItem.language,
            platformVariants: {
              create: newItem.platformVariants.map((v) => ({
                platform: v.platform,
                caption: v.caption,
                hashtags: v.hashtags,
                status: v.status,
              })),
            },
          },
        });
        return newItem;
      } catch {
        return LocalJsonStorage.addContent(newItem);
      }
    }

    return LocalJsonStorage.addContent(newItem);
  }

  /**
   * Update status of content item and its variants.
   */
  static async updateStatus(id: string, status: ContentStatus): Promise<StoredContentItem | null> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const updated = await prisma.contentItem.update({
          where: { id },
          data: {
            status,
            platformVariants: {
              updateMany: {
                where: { contentItemId: id },
                data: {
                  status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'CANCELLED' : 'DRAFT',
                },
              },
            },
          },
          include: { platformVariants: true },
        });

        await this.recordAudit({
          action: 'CONTENT_STATUS_UPDATED',
          entityType: 'ContentItem',
          entityId: id,
          status: 'SUCCESS',
          durationMs: 15,
          metadata: { newStatus: status },
        });

        return updated as StoredContentItem;
      } catch {
        // Fallback to persistent local storage
      }
    }

    const updated = LocalJsonStorage.updateContentStatus(id, status);
    if (updated) {
      await this.recordAudit({
        action: 'CONTENT_STATUS_UPDATED',
        entityType: 'ContentItem',
        entityId: id,
        status: 'SUCCESS',
        durationMs: 5,
        metadata: { newStatus: status, storageMode: 'LOCAL_JSON' },
      });
    }
    return updated;
  }

  /**
   * Update caption or hashtags of a specific platform variant.
   */
  static async updateVariant(
    contentItemId: string,
    platform: PlatformType,
    data: { caption?: string; hashtags?: string[]; status?: import('@/types').VariantStatus }
  ): Promise<StoredPlatformVariant | null> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const updated = await prisma.platformVariant.update({
          where: {
            contentItemId_platform: { contentItemId, platform },
          },
          data: {
            caption: data.caption,
            hashtags: data.hashtags,
            status: data.status,
          },
        });

        await this.recordAudit({
          action: 'PLATFORM_VARIANT_EDITED',
          entityType: 'PlatformVariant',
          entityId: updated.id,
          status: 'SUCCESS',
          durationMs: 10,
          metadata: { platform, contentItemId },
        });

        return updated as StoredPlatformVariant;
      } catch {
        // Fallback to local
      }
    }

    const updated = LocalJsonStorage.updateVariant(contentItemId, platform, data);
    if (updated) {
      await this.recordAudit({
        action: 'PLATFORM_VARIANT_EDITED',
        entityType: 'PlatformVariant',
        entityId: updated.id,
        status: 'SUCCESS',
        durationMs: 5,
        metadata: { platform, contentItemId, storageMode: 'LOCAL_JSON' },
      });
    }
    return updated;
  }

  /**
   * Delete content item.
   */
  static async delete(id: string): Promise<boolean> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        await prisma.contentItem.delete({ where: { id } });
        await this.recordAudit({
          action: 'CONTENT_DELETED',
          entityType: 'ContentItem',
          entityId: id,
          status: 'SUCCESS',
          durationMs: 12,
          metadata: {},
        });
        return true;
      } catch {
        // Fallback
      }
    }

    const deleted = LocalJsonStorage.deleteContent(id);
    if (deleted) {
      await this.recordAudit({
        action: 'CONTENT_DELETED',
        entityType: 'ContentItem',
        entityId: id,
        status: 'SUCCESS',
        durationMs: 5,
        metadata: { storageMode: 'LOCAL_JSON' },
      });
    }
    return deleted;
  }

  // --- Media Asset Storage Operations (M004) ---

  /**
   * Add a newly rendered media asset (e.g. image, video, audio) to storage.
   */
  static async addMediaAsset(
    asset: Omit<StoredMediaAsset, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StoredMediaAsset> {
    const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newAsset: StoredMediaAsset = {
      id,
      contentItemId: asset.contentItemId,
      mediaType: asset.mediaType,
      storageKey: asset.storageKey,
      mediaUrl: asset.mediaUrl,
      mimeType: asset.mimeType,
      metadata: asset.metadata,
      createdAt: now,
      updatedAt: now,
    };

    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        await prisma.mediaAsset.create({
          data: {
            id: newAsset.id,
            contentItemId: newAsset.contentItemId,
            mediaType: newAsset.mediaType,
            storageKey: newAsset.storageKey,
            mediaUrl: newAsset.mediaUrl,
            mimeType: newAsset.mimeType,
            metadata: newAsset.metadata ? JSON.parse(JSON.stringify(newAsset.metadata)) : undefined,
          },
        });
        return newAsset;
      } catch {
        // Fallback to local
      }
    }

    return LocalJsonStorage.addMediaAsset(newAsset);
  }

  /**
   * Get media assets optionally filtered by contentItemId.
   */
  static async getMediaAssets(contentItemId?: string): Promise<StoredMediaAsset[]> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const assets = await prisma.mediaAsset.findMany({
          where: contentItemId ? { contentItemId } : undefined,
          orderBy: { createdAt: 'desc' },
        });
        return assets as unknown as StoredMediaAsset[];
      } catch {
        // Fallback to local
      }
    }

    return LocalJsonStorage.getMediaAssets(contentItemId);
  }

  /**
   * Get media asset by ID.
   */
  static async getMediaAssetById(id: string): Promise<StoredMediaAsset | null> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const asset = await prisma.mediaAsset.findUnique({ where: { id } });
        return (asset as unknown as StoredMediaAsset) || null;
      } catch {
        // Fallback to local
      }
    }

    return LocalJsonStorage.getMediaAssetById(id);
  }

  // --- Audit Logs ---

  /**
   * Record an audit log event.
   */
  static async recordAudit(log: {
    action: string;
    entityType: string;
    entityId: string | null;
    status: string;
    durationMs?: number;
    errorCode?: string;
    metadata?: Record<string, unknown>;
  }): Promise<StoredAuditLog> {
    const newLog: StoredAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      status: log.status,
      durationMs: log.durationMs ?? null,
      errorCode: log.errorCode ?? null,
      metadata: log.metadata ?? null,
      createdAt: new Date(),
    };

    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        await prisma.auditLog.create({
          data: {
            id: newLog.id,
            action: newLog.action,
            entityType: newLog.entityType,
            entityId: newLog.entityId,
            status:
              newLog.status === 'SUCCESS' || newLog.status === 'FAILURE' || newLog.status === 'WARNING'
                ? newLog.status
                : 'INFO',
            durationMs: newLog.durationMs,
            errorCode: newLog.errorCode,
            metadata: newLog.metadata ? JSON.parse(JSON.stringify(newLog.metadata)) : undefined,
          },
        });
        return newLog;
      } catch {
        // Fallback to local
      }
    }

    return LocalJsonStorage.addAuditLog(newLog);
  }

  /**
   * Get recent audit logs.
   */
  static async getAuditLogs(limit = 20): Promise<StoredAuditLog[]> {
    const dbActive = await isDatabaseAvailable();
    if (dbActive) {
      try {
        const logs = await prisma.auditLog.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
        return logs as unknown as StoredAuditLog[];
      } catch {
        // Fallback to local
      }
    }

    return LocalJsonStorage.getAuditLogs(limit);
  }

  // --- Automation Rules & Scheduling ---

  static getAutomationRules() {
    return LocalJsonStorage.getAutomationRules();
  }

  static getAutomationRuleById(id: string) {
    return LocalJsonStorage.getAutomationRuleById(id);
  }

  static saveAutomationRule(rule: import('@/modules/agent/types').AutomationRule) {
    return LocalJsonStorage.saveAutomationRule(rule);
  }

  static deleteAutomationRule(id: string) {
    return LocalJsonStorage.deleteAutomationRule(id);
  }

  static getScheduledJobs(contentItemId?: string) {
    return LocalJsonStorage.getScheduledJobs(contentItemId);
  }

  static getScheduledJobByIdempotencyKey(key: string) {
    return LocalJsonStorage.getScheduledJobByIdempotencyKey(key);
  }

  static addScheduledJob(job: import('@/modules/agent/types').ScheduledPublishJob) {
    return LocalJsonStorage.addScheduledJob(job);
  }

  static updateScheduledJob(
    id: string,
    updates: Partial<import('@/modules/agent/types').ScheduledPublishJob>
  ) {
    return LocalJsonStorage.updateScheduledJob(id, updates);
  }
}
