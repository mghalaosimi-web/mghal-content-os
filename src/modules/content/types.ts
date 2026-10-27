import type {
  CreateContentItemInput,
  UpdateContentItemInput,
  CreatePlatformVariantInput,
  CreateMediaAssetInput,
  CreateAuditLogInput,
  ContentStatus,
  ContentType,
  PlatformType,
} from '@/types';

export interface ContentFilter {
  status?: ContentStatus;
  contentType?: ContentType;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlatformVariantFilter {
  platform?: PlatformType;
  contentItemId?: string;
}

export type {
  CreateContentItemInput,
  UpdateContentItemInput,
  CreatePlatformVariantInput,
  CreateMediaAssetInput,
  CreateAuditLogInput,
};
