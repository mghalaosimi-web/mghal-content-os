import fs from 'node:fs';
import path from 'node:path';
import type { ContentStatus, ContentType, PlatformType, VariantStatus } from '@/types';
import type { AutomationRule, ScheduledPublishJob } from '@/modules/agent/types';

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

export interface StoredMediaAsset {
  id: string;
  contentItemId: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'SUBTITLE' | 'THUMBNAIL';
  storageKey: string | null;
  mediaUrl: string | null;
  mimeType: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface LocalDatabaseSchema {
  version: number;
  lastUpdated: string;
  contentItems: StoredContentItem[];
  mediaAssets: StoredMediaAsset[];
  auditLogs: StoredAuditLog[];
  automationRules: AutomationRule[];
  scheduledJobs: ScheduledPublishJob[];
  connectedAccounts: import('@/modules/publishing/types').PlatformCredential[];
}

const INITIAL_DEMO_ITEMS: StoredContentItem[] = [
  {
    id: 'item-demo-1',
    title: 'لا تستسلم بسبب تأخر النتائج؛ فكل بذرة تحتاج وقتاً لتزهر',
    topic: 'الصبر والاستمرارية في بناء المهارات',
    brief: 'محتوى تحفيزي يركز على قيمة الانضباط الهادئ والتراكم اليومي وتجنب المقارنات المحبطة.',
    contentType: 'MOTIVATIONAL',
    status: 'PENDING_APPROVAL',
    language: 'ar',
    createdAt: new Date('2026-10-27T18:00:00Z'),
    updatedAt: new Date('2026-10-27T18:00:00Z'),
    platformVariants: [
      {
        id: 'var-demo-1-fb',
        contentItemId: 'item-demo-1',
        platform: 'FACEBOOK',
        caption:
          'في رحلة التطوير، قد تشعر أحياناً أن جهودك اليومية لا تُحدث فرقاً ملحوظاً، لكن الحقيقة أن البناء الحقيقي يحدث في الخفاء. الاستمرارية الهادئة تصنع فارقاً هائلاً مع الوقت.\n\nما هي العادة التي تلتزم بها يومياً وتؤمن أنها ستغير مستقبلك؟ شاركنا في التعليقات 👇',
        hashtags: ['#تطوير_الذات', '#الاستمرارية', '#عقلية_النجاح'],
        status: 'READY_FOR_REVIEW',
        createdAt: new Date('2026-10-27T18:00:00Z'),
        updatedAt: new Date('2026-10-27T18:00:00Z'),
      },
      {
        id: 'var-demo-1-ig',
        contentItemId: 'item-demo-1',
        platform: 'INSTAGRAM',
        caption:
          'النجاح ليس قفزة واحدة، بل خطوات صغيرة متتالية لا يراها أحد. ✨\n\nركّز على مسارك الخاص، ولا تقارن بدايتك بمواسم حصاد الآخرين. توقيتك قادم، فقط استمر. 🚀\n.\n.\nاحفظ المنشور لتعود إليه حين تشعر بالإحباط 🔖',
        hashtags: ['#تحفيز', '#ريادة_أعمال', '#تطوير', '#إيجابية', '#MghalStudio'],
        status: 'READY_FOR_REVIEW',
        createdAt: new Date('2026-10-27T18:00:00Z'),
        updatedAt: new Date('2026-10-27T18:00:00Z'),
      },
      {
        id: 'var-demo-1-tt',
        contentItemId: 'item-demo-1',
        platform: 'TIKTOK',
        caption:
          'وقف ثانية واسمع هذا الكلام! ⏳\nلا تقارن سرعتك بغيرك.. لكل شخص توقيته الخاص! 🔥 شارك الفيديو مع شخص محتاج يسمع هذا الكلام الآن! #تطوير_الذات #تحفيز #fyp',
        hashtags: ['#fyp', '#تطوير_الذات', '#إلهام', '#نصائح_حياة'],
        status: 'READY_FOR_REVIEW',
        createdAt: new Date('2026-10-27T18:00:00Z'),
        updatedAt: new Date('2026-10-27T18:00:00Z'),
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
    createdAt: new Date('2026-10-26T12:00:00Z'),
    updatedAt: new Date('2026-10-27T12:00:00Z'),
    platformVariants: [
      {
        id: 'var-demo-2-fb',
        contentItemId: 'item-demo-2',
        platform: 'FACEBOOK',
        caption:
          'هل تعاني من ضيق الوقت لتعلم مهارة جديدة؟ الحل ليس في تخصيص 5 ساعات دفعة واحدة، بل في قاعدة العشرين دقيقة اليومية.\n\nتخصيص 20 دقيقة بتركيز كامل يعادل أكثر من 120 ساعة تعلم سنوياً!\n\nشارك المنشور مع صديق يحتاج تنظيم وقته 💡',
        hashtags: ['#تعلم_ذاتي', '#مهارات', '#إنتاجية'],
        status: 'APPROVED',
        createdAt: new Date('2026-10-26T12:00:00Z'),
        updatedAt: new Date('2026-10-27T12:00:00Z'),
      },
      {
        id: 'var-demo-2-ig',
        contentItemId: 'item-demo-2',
        platform: 'INSTAGRAM',
        caption:
          'كيف تتقن أي مهارة في 20 دقيقة يومياً؟ ⏱️\n1. اختر مهارة واحدة محددة.\n2. ابتعد عن المشتتات كلياً.\n3. التزم يومياً دون انقطاع.\n\nالنتائج ستدهشك بعد 30 يوماً فقط! 📈\nاحفظ المنشور وطبقه اليوم 🔖',
        hashtags: ['#إنتاجية', '#مهارات_المستقبل', '#تنظيم_الوقت'],
        status: 'APPROVED',
        createdAt: new Date('2026-10-26T12:00:00Z'),
        updatedAt: new Date('2026-10-27T12:00:00Z'),
      },
      {
        id: 'var-demo-2-tt',
        contentItemId: 'item-demo-2',
        platform: 'TIKTOK',
        caption:
          'أسرع طريقة لاكتساب أي مهارة حتى لو جدولك مليان! 🚀 جرب قاعدة الـ 20 دقيقة وشوف الفرق! #إنتاجية #تعلم #fyp',
        hashtags: ['#fyp', '#تطوير', '#مهارات'],
        status: 'APPROVED',
        createdAt: new Date('2026-10-26T12:00:00Z'),
        updatedAt: new Date('2026-10-27T12:00:00Z'),
      },
    ],
  },
];

const INITIAL_DEMO_LOGS: StoredAuditLog[] = [
  {
    id: 'audit-demo-1',
    action: 'AI_CONTENT_GENERATION_SUCCESS',
    entityType: 'ContentItem',
    entityId: 'item-demo-1',
    status: 'SUCCESS',
    durationMs: 420,
    errorCode: null,
    metadata: { modelUsed: 'gemini-2.5-flash', topic: 'الصبر والاستمرارية' },
    createdAt: new Date('2026-10-27T18:00:00Z'),
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
    createdAt: new Date('2026-10-27T12:00:00Z'),
  },
];

const INITIAL_DEMO_RULES: AutomationRule[] = [
  {
    id: 'rule-mghal-daily',
    name: 'خطة النشر الذاتية اليومية لـ M.GH.AL',
    isEnabled: true,
    cronOrTimes: ['21:00'],
    timezone: 'Asia/Aden',
    topicsPool: [
      'الصبر والاستمرارية في بناء المهارات',
      'قاعدة الـ 20 دقيقة اليومية لإتقان أي مهارة',
      'عقلية الوفرة والتركيز على الإنجاز اليومي',
      'الانضباط الهادئ يتغلب على الحماس المؤقت',
      'كيف تحول الأخطاء إلى دروس نجاح قادمة',
      'بناء الهوية الرقمية الرصينة وصناعة الأثر',
    ],
    targetPlatforms: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
    approvalPolicy: 'REQUIRE_APPROVAL',
    lastRunAt: null,
    nextRunAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: '2026-10-27T18:00:00Z',
    updatedAt: '2026-10-27T18:00:00Z',
  },
];

export class LocalJsonStorage {
  private static filePath = path.join(process.cwd(), 'data', 'local-store.json');
  private static legacyFilePath = path.join(process.cwd(), 'data', 'local-db.json');
  private static isInitialized = false;

  public static getFilePath(): string {
    return this.filePath;
  }

  private static ensureInitialized(): void {
    if (this.isInitialized && fs.existsSync(this.filePath)) {
      return;
    }

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      let migratedData: LocalDatabaseSchema | null = null;
      if (fs.existsSync(this.legacyFilePath)) {
        try {
          const raw = fs.readFileSync(this.legacyFilePath, 'utf-8');
          const legacy = JSON.parse(raw);
          migratedData = {
            version: 2,
            lastUpdated: new Date().toISOString(),
            contentItems: Array.isArray(legacy.contentItems) ? legacy.contentItems : INITIAL_DEMO_ITEMS,
            mediaAssets: Array.isArray(legacy.mediaAssets) ? legacy.mediaAssets : [],
            auditLogs: Array.isArray(legacy.auditLogs) ? legacy.auditLogs : INITIAL_DEMO_LOGS,
            automationRules: Array.isArray(legacy.automationRules) ? legacy.automationRules : INITIAL_DEMO_RULES,
            scheduledJobs: Array.isArray(legacy.scheduledJobs) ? legacy.scheduledJobs : [],
            connectedAccounts: Array.isArray(legacy.connectedAccounts) ? legacy.connectedAccounts : [],
          };
        } catch {
          migratedData = null;
        }
      }

      const initialData: LocalDatabaseSchema = migratedData || {
        version: 2,
        lastUpdated: new Date().toISOString(),
        contentItems: INITIAL_DEMO_ITEMS,
        mediaAssets: [],
        auditLogs: INITIAL_DEMO_LOGS,
        automationRules: INITIAL_DEMO_RULES,
        scheduledJobs: [],
        connectedAccounts: [],
      };

      fs.writeFileSync(this.filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    }

    this.isInitialized = true;
  }

  private static readData(): LocalDatabaseSchema {
    this.ensureInitialized();
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      // Restore Date objects
      if (Array.isArray(parsed.contentItems)) {
        parsed.contentItems.forEach((item: StoredContentItem) => {
          item.createdAt = new Date(item.createdAt);
          item.updatedAt = new Date(item.updatedAt);
          if (Array.isArray(item.platformVariants)) {
            item.platformVariants.forEach((v) => {
              v.createdAt = new Date(v.createdAt);
              v.updatedAt = new Date(v.updatedAt);
            });
          }
        });
      }
      if (Array.isArray(parsed.mediaAssets)) {
        parsed.mediaAssets.forEach((a: StoredMediaAsset) => {
          a.createdAt = new Date(a.createdAt);
          a.updatedAt = new Date(a.updatedAt);
        });
      }
      if (Array.isArray(parsed.auditLogs)) {
        parsed.auditLogs.forEach((l: StoredAuditLog) => {
          l.createdAt = new Date(l.createdAt);
        });
      }
      if (!Array.isArray(parsed.automationRules)) {
        parsed.automationRules = [...INITIAL_DEMO_RULES];
      }
      if (!Array.isArray(parsed.scheduledJobs)) {
        parsed.scheduledJobs = [];
      }
      if (!Array.isArray(parsed.connectedAccounts)) {
        parsed.connectedAccounts = [];
      }
      return parsed as LocalDatabaseSchema;
    } catch {
      return {
        version: 2,
        lastUpdated: new Date().toISOString(),
        contentItems: [...INITIAL_DEMO_ITEMS],
        mediaAssets: [],
        auditLogs: [...INITIAL_DEMO_LOGS],
        automationRules: [...INITIAL_DEMO_RULES],
        scheduledJobs: [],
        connectedAccounts: [],
      };
    }
  }

  private static writeData(data: LocalDatabaseSchema): void {
    this.ensureInitialized();
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Content Items ---

  static getAllContent(filter?: {
    status?: ContentStatus;
    contentType?: ContentType;
    search?: string;
  }): StoredContentItem[] {
    const data = this.readData();
    let list = [...data.contentItems];

    if (filter?.status) {
      list = list.filter((i) => i.status === filter.status);
    }
    if (filter?.contentType) {
      list = list.filter((i) => i.contentType === filter.contentType);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (i) => i.title.toLowerCase().includes(q) || (i.topic && i.topic.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static getContentById(id: string): StoredContentItem | null {
    const data = this.readData();
    return data.contentItems.find((i) => i.id === id) || null;
  }

  static addContent(item: StoredContentItem): StoredContentItem {
    const data = this.readData();
    data.contentItems.unshift(item);
    this.writeData(data);
    return item;
  }

  static updateContentStatus(id: string, status: ContentStatus): StoredContentItem | null {
    const data = this.readData();
    const item = data.contentItems.find((i) => i.id === id);
    if (!item) return null;

    item.status = status;
    item.updatedAt = new Date();
    item.platformVariants.forEach((v) => {
      v.status =
        status === 'APPROVED'
          ? 'APPROVED'
          : status === 'SCHEDULED'
          ? 'SCHEDULED'
          : status === 'PUBLISHED'
          ? 'PUBLISHED'
          : status === 'REJECTED'
          ? 'CANCELLED'
          : 'DRAFT';
      v.updatedAt = new Date();
    });

    this.writeData(data);
    return item;
  }

  static updateVariant(
    contentItemId: string,
    platform: PlatformType,
    fields: { caption?: string; hashtags?: string[]; status?: VariantStatus }
  ): StoredPlatformVariant | null {
    const data = this.readData();
    const item = data.contentItems.find((i) => i.id === contentItemId);
    if (!item) return null;

    const variant = item.platformVariants.find((v) => v.platform === platform);
    if (!variant) return null;

    if (fields.caption !== undefined) variant.caption = fields.caption;
    if (fields.hashtags !== undefined) variant.hashtags = fields.hashtags;
    if (fields.status !== undefined) variant.status = fields.status;
    variant.updatedAt = new Date();
    item.updatedAt = new Date();

    this.writeData(data);
    return variant;
  }

  static deleteContent(id: string): boolean {
    const data = this.readData();
    const index = data.contentItems.findIndex((i) => i.id === id);
    if (index === -1) return false;

    data.contentItems.splice(index, 1);
    data.mediaAssets = data.mediaAssets.filter((a) => a.contentItemId !== id);
    data.scheduledJobs = data.scheduledJobs.filter((j) => j.contentItemId !== id);
    this.writeData(data);
    return true;
  }

  // --- Media Assets (M004) ---

  static addMediaAsset(asset: StoredMediaAsset): StoredMediaAsset {
    const data = this.readData();
    data.mediaAssets.unshift(asset);
    this.writeData(data);
    return asset;
  }

  static getMediaAssets(contentItemId?: string): StoredMediaAsset[] {
    const data = this.readData();
    if (contentItemId) {
      return data.mediaAssets.filter((a) => a.contentItemId === contentItemId);
    }
    return data.mediaAssets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static getMediaAssetById(id: string): StoredMediaAsset | null {
    const data = this.readData();
    return data.mediaAssets.find((a) => a.id === id) || null;
  }

  // --- Audit Logs ---

  static addAuditLog(log: StoredAuditLog): StoredAuditLog {
    const data = this.readData();
    data.auditLogs.unshift(log);
    if (data.auditLogs.length > 200) {
      data.auditLogs.pop();
    }
    this.writeData(data);
    return log;
  }

  static getAuditLogs(limit = 20): StoredAuditLog[] {
    const data = this.readData();
    return data.auditLogs.slice(0, limit);
  }

  // --- Automation Rules (M005 / Autonomous Agent) ---

  static getAutomationRules(): AutomationRule[] {
    const data = this.readData();
    return [...data.automationRules];
  }

  static getAutomationRuleById(id: string): AutomationRule | null {
    const data = this.readData();
    return data.automationRules.find((r) => r.id === id) || null;
  }

  static saveAutomationRule(rule: AutomationRule): AutomationRule {
    const data = this.readData();
    const existingIndex = data.automationRules.findIndex((r) => r.id === rule.id);
    if (existingIndex >= 0) {
      data.automationRules[existingIndex] = {
        ...rule,
        updatedAt: new Date().toISOString(),
      };
    } else {
      data.automationRules.unshift({
        ...rule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.writeData(data);
    return rule;
  }

  static deleteAutomationRule(id: string): boolean {
    const data = this.readData();
    const index = data.automationRules.findIndex((r) => r.id === id);
    if (index === -1) return false;
    data.automationRules.splice(index, 1);
    this.writeData(data);
    return true;
  }

  // --- Scheduled Publish Jobs (Idempotent) ---

  static getScheduledJobs(contentItemId?: string): ScheduledPublishJob[] {
    const data = this.readData();
    if (contentItemId) {
      return data.scheduledJobs.filter((j) => j.contentItemId === contentItemId);
    }
    return [...data.scheduledJobs];
  }

  static getScheduledJobById(id: string): ScheduledPublishJob | null {
    const data = this.readData();
    return data.scheduledJobs.find((j) => j.id === id) || null;
  }

  static getScheduledJobByIdempotencyKey(key: string): ScheduledPublishJob | null {
    const data = this.readData();
    return data.scheduledJobs.find((j) => j.idempotencyKey === key) || null;
  }

  static addScheduledJob(job: ScheduledPublishJob): ScheduledPublishJob {
    const data = this.readData();
    const existing = data.scheduledJobs.find((j) => j.idempotencyKey === job.idempotencyKey);
    if (existing) {
      return existing;
    }
    data.scheduledJobs.unshift(job);
    this.writeData(data);
    return job;
  }

  static updateScheduledJob(
    id: string,
    updates: Partial<ScheduledPublishJob>
  ): ScheduledPublishJob | null {
    const data = this.readData();
    const job = data.scheduledJobs.find((j) => j.id === id);
    if (!job) return null;

    Object.assign(job, updates);
    this.writeData(data);
    return job;
  }

  // --- Connected Platform Accounts (Real Live Publishing) ---

  static getConnectedAccounts(): import('@/modules/publishing/types').PlatformCredential[] {
    const data = this.readData();
    return [...(data.connectedAccounts || [])];
  }

  static getConnectedAccountByPlatform(
    platform: PlatformType
  ): import('@/modules/publishing/types').PlatformCredential | null {
    const data = this.readData();
    return (data.connectedAccounts || []).find((a) => a.platform === platform && a.isActive) || null;
  }

  static saveConnectedAccount(
    credential: import('@/modules/publishing/types').PlatformCredential
  ): import('@/modules/publishing/types').PlatformCredential {
    const data = this.readData();
    if (!Array.isArray(data.connectedAccounts)) {
      data.connectedAccounts = [];
    }
    const index = data.connectedAccounts.findIndex((a) => a.platform === credential.platform);
    if (index >= 0) {
      data.connectedAccounts[index] = {
        ...credential,
        updatedAt: new Date().toISOString(),
      };
    } else {
      data.connectedAccounts.push({
        ...credential,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.writeData(data);
    return credential;
  }

  static deleteConnectedAccount(platform: PlatformType): boolean {
    const data = this.readData();
    if (!Array.isArray(data.connectedAccounts)) return false;
    const index = data.connectedAccounts.findIndex((a) => a.platform === platform);
    if (index === -1) return false;
    data.connectedAccounts.splice(index, 1);
    this.writeData(data);
    return true;
  }
}

