import prisma from '@/lib/db/prisma';
import type { ContentStatus, ContentType, PlatformType, VariantStatus } from '@/types';

export interface StoredPlatformVariant {
  id: string;
  contentItemId: string;
  platform: PlatformType;
  caption: string;
  hashtags: string[];
  status: VariantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredContentItem {
  id: string;
  title: string;
  topic: string;
  brief: string | null;
  contentType: ContentType;
  status: ContentStatus;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  platformVariants: StoredPlatformVariant[];
}

export interface StoredAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  status: string;
  durationMs: number | null;
  errorCode: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// In-memory fallback repository when live PostgreSQL database is not connected
const fallbackContentStore: StoredContentItem[] = [
  {
    id: 'item-demo-1',
    title: 'لا تستسلم بسبب تأخر النتائج؛ فكل بذرة تحتاج وقتاً لتزهر',
    topic: 'الصبر والاستمرارية في بناء المهارات',
    brief: 'محتوى تحفيزي يركز على قيمة الانضباط الهادئ والتراكم اليومي وتجنب المقارنات المحبطة.',
    contentType: 'MOTIVATIONAL',
    status: 'PENDING_APPROVAL',
    language: 'ar',
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
    platformVariants: [
      {
        id: 'var-demo-1-fb',
        contentItemId: 'item-demo-1',
        platform: 'FACEBOOK',
        caption:
          'في رحلة التطوير، قد تشعر أحياناً أن جهودك اليومية لا تُحدث فرقاً ملحوظاً، لكن الحقيقة أن البناء الحقيقي يحدث في الخفاء. الاستمرارية الهادئة تصنع فارقاً هائلاً مع الوقت.\n\nما هي العادة التي تلتزم بها يومياً وتؤمن أنها ستغير مستقبلك؟ شاركنا في التعليقات 👇',
        hashtags: ['#تطوير_الذات', '#الاستمرارية', '#عقلية_النجاح'],
        status: 'READY_FOR_REVIEW',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: 'var-demo-1-ig',
        contentItemId: 'item-demo-1',
        platform: 'INSTAGRAM',
        caption:
          'النجاح ليس قفزة واحدة، بل خطوات صغيرة متتالية لا يراها أحد. ✨\n\nركّز على مسارك الخاص، ولا تقارن بدايتك بمواسم حصاد الآخرين. توقيتك قادم، فقط استمر. 🚀\n.\n.\nاحفظ المنشور لتعود إليه حين تشعر بالإحباط 🔖',
        hashtags: ['#تحفيز', '#ريادة_أعمال', '#تطوير', '#إيجابية', '#MghalStudio'],
        status: 'READY_FOR_REVIEW',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: 'var-demo-1-tt',
        contentItemId: 'item-demo-1',
        platform: 'TIKTOK',
        caption:
          'وقف ثانية واسمع هذا الكلام! ⏳\nلا تقارن سرعتك بغيرك.. لكل شخص توقيته الخاص! 🔥 شارك الفيديو مع شخص محتاج يسمع هذا الكلام الآن! #تطوير_الذات #تحفيز #fyp',
        hashtags: ['#fyp', '#تطوير_الذات', '#إلهام', '#نصائح_حياة'],
        status: 'READY_FOR_REVIEW',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 2),
      },
    ],
  },
  {
    id: 'item-demo-2',
    title: 'قاعدة الـ 20 دقيقة اليومية لإتقان أي مهارة',
    topic: 'إدارة الوقت واكتساب المهارات',
    brief: 'شرح تعليمي وعملي لكيفية بناء عادات تعلم يومية دون ضغط نفسي أو تسويف.',
    contentType: 'EDUCATIONAL',
    status: 'APPROVED',
    language: 'ar',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 43200000),
    platformVariants: [
      {
        id: 'var-demo-2-fb',
        contentItemId: 'item-demo-2',
        platform: 'FACEBOOK',
        caption:
          'هل تعاني من ضيق الوقت لتعلم مهارة جديدة؟ الحل ليس في تخصيص 5 ساعات دفعة واحدة، بل في قاعدة العشرين دقيقة اليومية.\n\nتخصيص 20 دقيقة بتركيز كامل يعادل أكثر من 120 ساعة تعلم سنوياً!\n\nشارك المنشور مع صديق يحتاج تنظيم وقته 💡',
        hashtags: ['#تعلم_ذاتي', '#مهارات', '#إنتاجية'],
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 43200000),
      },
      {
        id: 'var-demo-2-ig',
        contentItemId: 'item-demo-2',
        platform: 'INSTAGRAM',
        caption:
          'كيف تتقن أي مهارة في 20 دقيقة يومياً؟ ⏱️\n1. اختر مهارة واحدة محددة.\n2. ابتعد عن المشتتات كلياً.\n3. التزم يومياً دون انقطاع.\n\nالنتائج ستدهشك بعد 30 يوماً فقط! 📈\nاحفظ المنشور وطبقه اليوم 🔖',
        hashtags: ['#إنتاجية', '#مهارات_المستقبل', '#تنظيم_الوقت'],
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 43200000),
      },
      {
        id: 'var-demo-2-tt',
        contentItemId: 'item-demo-2',
        platform: 'TIKTOK',
        caption:
          'أسرع طريقة لاكتساب أي مهارة حتى لو جدولك مليان! 🚀 جرب قاعدة الـ 20 دقيقة وشوف الفرق! #إنتاجية #تعلم #fyp',
        hashtags: ['#fyp', '#تطوير', '#مهارات'],
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 43200000),
      },
    ],
  },
];

const fallbackAuditLogs: StoredAuditLog[] = [
  {
    id: 'audit-demo-1',
    action: 'AI_CONTENT_GENERATION_SUCCESS',
    entityType: 'ContentItem',
    entityId: 'item-demo-1',
    status: 'SUCCESS',
    durationMs: 420,
    errorCode: null,
    metadata: { modelUsed: 'gemini-2.5-flash', topic: 'الصبر والاستمرارية' },
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: 'audit-demo-2',
    action: 'CONTENT_STATUS_UPDATED',
    entityType: 'ContentItem',
    entityId: 'item-demo-2',
    status: 'SUCCESS',
    durationMs: 45,
    errorCode: null,
    metadata: { previousStatus: 'PENDING_APPROVAL', newStatus: 'APPROVED' },
    createdAt: new Date(Date.now() - 43200000),
  },
];

export class ContentStorage {
  /**
   * Fetch all content items with optional status/platform filters
   */
  static async getAll(filter?: {
    status?: ContentStatus;
    contentType?: ContentType;
    search?: string;
  }): Promise<StoredContentItem[]> {
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
      // Fallback to in-memory store
      let list = [...fallbackContentStore];
      if (filter?.status) {
        list = list.filter((i) => i.status === filter.status);
      }
      if (filter?.contentType) {
        list = list.filter((i) => i.contentType === filter.contentType);
      }
      if (filter?.search) {
        const query = filter.search.toLowerCase();
        list = list.filter(
          (i) => i.title.toLowerCase().includes(query) || (i.topic && i.topic.toLowerCase().includes(query))
        );
      }
      return list;
    }
  }

  /**
   * Get single content item by ID
   */
  static async getById(id: string): Promise<StoredContentItem | null> {
    try {
      const item = await prisma.contentItem.findUnique({
        where: { id },
        include: { platformVariants: true },
      });
      return (item as StoredContentItem) || null;
    } catch {
      return fallbackContentStore.find((i) => i.id === id) || null;
    }
  }

  /**
   * Add new item to storage
   */
  static async add(item: Omit<StoredContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredContentItem> {
    const newItem: StoredContentItem = {
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      platformVariants: item.platformVariants.map((v) => ({
        ...v,
        id: `var-${Date.now()}-${v.platform.toLowerCase()}`,
        contentItemId: `item-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

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
    } catch {
      fallbackContentStore.unshift(newItem);
    }

    return newItem;
  }

  /**
   * Update status of content item and its variants
   */
  static async updateStatus(id: string, status: ContentStatus): Promise<StoredContentItem | null> {
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
      const item = fallbackContentStore.find((i) => i.id === id);
      if (item) {
        item.status = status;
        item.updatedAt = new Date();
        item.platformVariants.forEach((v) => {
          v.status = status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'CANCELLED' : 'DRAFT';
          v.updatedAt = new Date();
        });

        await this.recordAudit({
          action: 'CONTENT_STATUS_UPDATED',
          entityType: 'ContentItem',
          entityId: id,
          status: 'SUCCESS',
          durationMs: 5,
          metadata: { newStatus: status },
        });

        return item;
      }
      return null;
    }
  }

  /**
   * Update caption or hashtags of a specific platform variant
   */
  static async updateVariant(
    contentItemId: string,
    platform: PlatformType,
    data: { caption?: string; hashtags?: string[] }
  ): Promise<StoredPlatformVariant | null> {
    try {
      const updated = await prisma.platformVariant.update({
        where: {
          contentItemId_platform: { contentItemId, platform },
        },
        data: {
          caption: data.caption,
          hashtags: data.hashtags,
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
      const item = fallbackContentStore.find((i) => i.id === contentItemId);
      if (item) {
        const variant = item.platformVariants.find((v) => v.platform === platform);
        if (variant) {
          if (data.caption !== undefined) variant.caption = data.caption;
          if (data.hashtags !== undefined) variant.hashtags = data.hashtags;
          variant.updatedAt = new Date();
          item.updatedAt = new Date();

          await this.recordAudit({
            action: 'PLATFORM_VARIANT_EDITED',
            entityType: 'PlatformVariant',
            entityId: variant.id,
            status: 'SUCCESS',
            durationMs: 5,
            metadata: { platform, contentItemId },
          });

          return variant;
        }
      }
      return null;
    }
  }

  /**
   * Delete content item
   */
  static async delete(id: string): Promise<boolean> {
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
      const index = fallbackContentStore.findIndex((i) => i.id === id);
      if (index !== -1) {
        fallbackContentStore.splice(index, 1);
        await this.recordAudit({
          action: 'CONTENT_DELETED',
          entityType: 'ContentItem',
          entityId: id,
          status: 'SUCCESS',
          durationMs: 5,
          metadata: {},
        });
        return true;
      }
      return false;
    }
  }

  /**
   * Record audit log
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

    try {
      await prisma.auditLog.create({
        data: {
          id: newLog.id,
          action: newLog.action,
          entityType: newLog.entityType,
          entityId: newLog.entityId,
          status: (newLog.status === 'SUCCESS' || newLog.status === 'FAILURE' || newLog.status === 'WARNING' ? newLog.status : 'INFO'),
          durationMs: newLog.durationMs,
          errorCode: newLog.errorCode,
          metadata: newLog.metadata ? JSON.parse(JSON.stringify(newLog.metadata)) : undefined,
        },
      });
    } catch {
      fallbackAuditLogs.unshift(newLog);
      if (fallbackAuditLogs.length > 50) fallbackAuditLogs.pop();
    }

    return newLog;
  }

  /**
   * Get recent audit logs
   */
  static async getAuditLogs(limit = 20): Promise<StoredAuditLog[]> {
    try {
      const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return logs as unknown as StoredAuditLog[];
    } catch {
      return fallbackAuditLogs.slice(0, limit);
    }
  }
}
