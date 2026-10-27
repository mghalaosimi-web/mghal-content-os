import type { PlatformType } from '@/types';

export interface PlatformCredential {
  platform: PlatformType; // Strictly FACEBOOK | INSTAGRAM | TIKTOK (WhatsApp is forbidden)
  accountName: string;
  accountId: string; // Facebook Page ID, Instagram User ID, or TikTok Open ID
  accessToken: string;
  refreshToken?: string;
  appId?: string;
  appSecret?: string;
  expiresAt?: string;
  isActive: boolean;
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishRequest {
  contentItemId: string;
  platform: PlatformType;
  caption: string;
  hashtags: string[];
  imageUrl?: string; // Relative path e.g. /generated/images/... or public absolute URL
  scheduledTime?: string;
}

export interface PublishResult {
  success: boolean;
  platform: PlatformType;
  platformPostId?: string;
  postUrl?: string;
  error?: string;
  durationMs: number;
  rawResponse?: Record<string, unknown>;
}

export interface AccountConnectionStatus {
  platform: PlatformType;
  isConnected: boolean;
  accountName?: string;
  accountId?: string;
  lastVerifiedAt?: string;
  details?: string;
}
