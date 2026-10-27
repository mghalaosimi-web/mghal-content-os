import { z } from 'zod';

export const ContentStatusEnum = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'SCHEDULED',
  'PUBLISHED',
]);
export type ContentStatus = z.infer<typeof ContentStatusEnum>;

export const ContentTypeEnum = z.enum([
  'MOTIVATIONAL',
  'SELF_DEVELOPMENT',
  'CONTEMPLATIVE',
  'EDUCATIONAL',
  'STORY',
  'AWARENESS',
  'QUOTE_COMMENTARY',
]);
export type ContentType = z.infer<typeof ContentTypeEnum>;

export const PlatformTypeEnum = z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK']);
export type PlatformType = z.infer<typeof PlatformTypeEnum>;

export const VariantStatusEnum = z.enum([
  'DRAFT',
  'READY_FOR_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
  'CANCELLED',
]);
export type VariantStatus = z.infer<typeof VariantStatusEnum>;

export const MediaTypeEnum = z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'SUBTITLE', 'THUMBNAIL']);
export type MediaType = z.infer<typeof MediaTypeEnum>;

export const AuditStatusEnum = z.enum(['SUCCESS', 'FAILURE', 'WARNING', 'INFO']);
export type AuditStatus = z.infer<typeof AuditStatusEnum>;

export const createContentItemSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  topic: z.string().trim().min(2, 'Topic must be at least 2 characters').max(100),
  brief: z.string().trim().max(4000).optional(),
  contentType: ContentTypeEnum.default('MOTIVATIONAL'),
  status: ContentStatusEnum.default('DRAFT'),
  language: z.string().min(2).max(10).default('ar'),
});
export type CreateContentItemInput = z.infer<typeof createContentItemSchema>;

export const updateContentItemSchema = createContentItemSchema.partial();
export type UpdateContentItemInput = z.infer<typeof updateContentItemSchema>;

export const createPlatformVariantSchema = z.object({
  contentItemId: z.string().min(1, 'Content Item ID is required'),
  platform: PlatformTypeEnum,
  caption: z.string().trim().min(1, 'Caption cannot be empty'),
  hashtags: z.array(z.string().trim()).default([]),
  status: VariantStatusEnum.default('DRAFT'),
});
export type CreatePlatformVariantInput = z.infer<typeof createPlatformVariantSchema>;

export const createMediaAssetSchema = z.object({
  contentItemId: z.string().min(1, 'Content Item ID is required'),
  mediaType: MediaTypeEnum,
  mimeType: z.string().min(1, 'Mime type is required'),
  storageKey: z.string().optional(),
  mediaUrl: z.string().url('Must be a valid URL').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateMediaAssetInput = z.infer<typeof createMediaAssetSchema>;

export const createAuditLogSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().optional(),
  status: AuditStatusEnum.default('INFO'),
  durationMs: z.number().int().nonnegative().optional(),
  errorCode: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
