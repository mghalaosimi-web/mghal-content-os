import { describe, it, expect } from 'vitest';
import {
  createContentItemSchema,
  createPlatformVariantSchema,
  createMediaAssetSchema,
  createAuditLogSchema,
  ContentStatusEnum,
  ContentTypeEnum,
  PlatformTypeEnum,
} from '@/lib/validation/content.schema';

describe('Content Schema Validation', () => {
  describe('ContentItem Schema', () => {
    it('should accept valid Arabic content item with defaults', () => {
      const payload = {
        title: 'قوة الاستمرار والتركيز',
        topic: 'تطوير الذات',
        brief: 'منشور تحفيزي عن الصبر والاستمرارية في بناء المهارات اليومية.',
      };

      const result = createContentItemSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe('MOTIVATIONAL');
        expect(result.data.status).toBe('DRAFT');
        expect(result.data.language).toBe('ar');
      }
    });

    it('should reject titles shorter than 3 characters', () => {
      const payload = {
        title: 'لا',
        topic: 'تطوير الذات',
      };

      const result = createContentItemSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid content status values', () => {
      const payload = {
        title: 'عنوان تجريبي صالح',
        topic: 'موضوع عام',
        status: 'NON_EXISTENT_STATUS',
      };

      const result = createContentItemSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should support all specified content status values', () => {
      const statuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const;
      statuses.forEach((status) => {
        expect(ContentStatusEnum.safeParse(status).success).toBe(true);
      });
    });

    it('should support all specified content types', () => {
      const types = [
        'MOTIVATIONAL',
        'SELF_DEVELOPMENT',
        'CONTEMPLATIVE',
        'EDUCATIONAL',
        'STORY',
        'AWARENESS',
        'QUOTE_COMMENTARY',
      ] as const;

      types.forEach((type) => {
        expect(ContentTypeEnum.safeParse(type).success).toBe(true);
      });
    });
  });

  describe('PlatformVariant Schema', () => {
    it('should accept supported platforms: FACEBOOK, INSTAGRAM, TIKTOK', () => {
      const platforms = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'] as const;
      platforms.forEach((platform) => {
        const payload = {
          contentItemId: 'item-123',
          platform,
          caption: 'نص المنشور المخصص للمنصة #تطوير',
          hashtags: ['#تطوير', '#إلهام'],
        };
        const result = createPlatformVariantSchema.safeParse(payload);
        expect(result.success).toBe(true);
      });
    });

    it('should strictly reject WHATSAPP and unsupported platforms', () => {
      const payload = {
        contentItemId: 'item-123',
        platform: 'WHATSAPP',
        caption: 'حالة واتساب تجريبية',
      };

      const result = createPlatformVariantSchema.safeParse(payload);
      expect(result.success).toBe(false);
      expect(PlatformTypeEnum.safeParse('WHATSAPP').success).toBe(false);
    });

    it('should reject empty captions', () => {
      const payload = {
        contentItemId: 'item-123',
        platform: 'FACEBOOK',
        caption: '   ',
      };

      const result = createPlatformVariantSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('MediaAsset Schema', () => {
    it('should accept valid media asset', () => {
      const payload = {
        contentItemId: 'item-123',
        mediaType: 'IMAGE',
        mimeType: 'image/jpeg',
        mediaUrl: 'https://cdn.example.com/images/sample.jpg',
        metadata: { width: 1080, height: 1080, format: 'jpg' },
      };

      const result = createMediaAssetSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid media URL', () => {
      const payload = {
        contentItemId: 'item-123',
        mediaType: 'VIDEO',
        mimeType: 'video/mp4',
        mediaUrl: 'not_a_valid_url',
      };

      const result = createMediaAssetSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('AuditLog Schema', () => {
    it('should accept valid audit log entry', () => {
      const payload = {
        action: 'CONTENT_PUBLISH_ATTEMPT',
        entityType: 'PlatformVariant',
        entityId: 'var-999',
        status: 'SUCCESS',
        durationMs: 420,
        metadata: { targetPlatform: 'FACEBOOK' },
      };

      const result = createAuditLogSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject negative durationMs', () => {
      const payload = {
        action: 'TEST_ACTION',
        entityType: 'Test',
        durationMs: -50,
      };

      const result = createAuditLogSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
