import type { PlatformType } from '@/types';
import { LocalJsonStorage } from '@/modules/content/local-store';
import { FacebookPublisher } from './facebook-publisher';
import { InstagramPublisher } from './instagram-publisher';
import { TikTokPublisher } from './tiktok-publisher';
import type {
  AccountConnectionStatus,
  PlatformCredential,
  PublishRequest,
  PublishResult,
} from './types';

export class PublisherService {
  private static readonly SUPPORTED_PLATFORMS: PlatformType[] = [
    'FACEBOOK',
    'INSTAGRAM',
    'TIKTOK',
  ];

  /**
   * Helper to retrieve credential either from local storage or environment variables
   */
  static getCredential(platform: PlatformType): PlatformCredential | null {
    if (platform === ('WHATSAPP' as PlatformType)) {
      throw new Error('منصة WHATSAPP غير مدعومة ومحظورة نهائياً.');
    }

    // 1. Check local storage
    const stored = LocalJsonStorage.getConnectedAccountByPlatform(platform);
    if (stored && stored.accessToken) {
      return stored;
    }

    // 2. Check environment variables as fallback
    if (platform === 'FACEBOOK') {
      const pageId = process.env.FACEBOOK_PAGE_ID;
      const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      if (pageId && accessToken) {
        return {
          platform: 'FACEBOOK',
          accountName: 'Facebook Page (Env)',
          accountId: pageId,
          accessToken,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } else if (platform === 'INSTAGRAM') {
      const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      if (accountId && accessToken) {
        return {
          platform: 'INSTAGRAM',
          accountName: 'Instagram Business (Env)',
          accountId,
          accessToken,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } else if (platform === 'TIKTOK') {
      const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
      if (accessToken) {
        return {
          platform: 'TIKTOK',
          accountName: 'TikTok Creator (Env)',
          accountId: process.env.TIKTOK_CREATOR_ID || 'tiktok-env',
          accessToken,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    return null;
  }

  /**
   * Get connection status for all allowed platforms
   */
  static async getAccountStatuses(): Promise<AccountConnectionStatus[]> {
    const statuses: AccountConnectionStatus[] = [];

    for (const platform of this.SUPPORTED_PLATFORMS) {
      const cred = this.getCredential(platform);
      if (!cred) {
        statuses.push({
          platform,
          isConnected: false,
          details: 'غير متصل. يتطلب إدخال بيانات الاعتماد ورمز الوصول.',
        });
        continue;
      }

      statuses.push({
        platform,
        isConnected: cred.isActive,
        accountName: cred.accountName,
        accountId: cred.accountId,
        lastVerifiedAt: cred.lastVerifiedAt || cred.updatedAt,
        details: cred.isActive ? 'متصل وجاهز للنشر الحقيقي' : 'معطل',
      });
    }

    return statuses;
  }

  /**
   * Save and verify platform credentials
   */
  static async saveAndVerifyCredential(params: {
    platform: PlatformType;
    accountId?: string;
    accessToken: string;
    accountName?: string;
    appId?: string;
    appSecret?: string;
  }): Promise<{ success: boolean; accountName?: string; error?: string }> {
    const { platform, accountId, accessToken, appId, appSecret } = params;

    if (platform === ('WHATSAPP' as PlatformType)) {
      return { success: false, error: 'منصة WHATSAPP محظورة في هذا النظام.' };
    }

    if (!accessToken?.trim()) {
      return { success: false, error: 'رمز الوصول (Access Token) مطلوب.' };
    }

    let verifyResult: {
      success: boolean;
      accountName?: string;
      accountId?: string;
      error?: string;
    };

    if (platform === 'FACEBOOK') {
      if (!accountId?.trim()) {
        return { success: false, error: 'معرف الصفحة (Page ID) مطلوب لفيسبوك.' };
      }
      verifyResult = await FacebookPublisher.verifyConnection(accountId, accessToken);
    } else if (platform === 'INSTAGRAM') {
      if (!accountId?.trim()) {
        return { success: false, error: 'معرف حساب إنستغرام (Instagram Account ID) مطلوب.' };
      }
      verifyResult = await InstagramPublisher.verifyConnection(accountId, accessToken);
    } else if (platform === 'TIKTOK') {
      verifyResult = await TikTokPublisher.verifyConnection(accessToken);
    } else {
      return { success: false, error: `المنصة ${platform} غير مدعومة.` };
    }

    if (!verifyResult.success) {
      LocalJsonStorage.addAuditLog({
        id: `audit-${Date.now()}`,
        action: 'ACCOUNT_VERIFICATION_FAILED',
        entityType: 'PlatformCredential',
        entityId: platform,
        status: 'FAILED',
        durationMs: null,
        errorCode: 'VERIFY_ERROR',
        metadata: { platform, error: verifyResult.error },
        createdAt: new Date(),
      });
      return { success: false, error: verifyResult.error };
    }

    const finalAccountName =
      verifyResult.accountName || params.accountName || `${platform} Account`;
    const finalAccountId = verifyResult.accountId || accountId || platform.toLowerCase();

    const credential: PlatformCredential = {
      platform,
      accountName: finalAccountName,
      accountId: finalAccountId,
      accessToken: accessToken.trim(),
      appId: appId?.trim(),
      appSecret: appSecret?.trim(),
      isActive: true,
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    LocalJsonStorage.saveConnectedAccount(credential);

    LocalJsonStorage.addAuditLog({
      id: `audit-${Date.now()}`,
      action: 'ACCOUNT_CONNECTED',
      entityType: 'PlatformCredential',
      entityId: platform,
      status: 'SUCCESS',
      durationMs: null,
      errorCode: null,
      metadata: { platform, accountName: finalAccountName, accountId: finalAccountId },
      createdAt: new Date(),
    });

    return {
      success: true,
      accountName: finalAccountName,
    };
  }

  /**
   * Disconnect a platform account
   */
  static disconnectAccount(platform: PlatformType): boolean {
    const success = LocalJsonStorage.deleteConnectedAccount(platform);
    if (success) {
      LocalJsonStorage.addAuditLog({
        id: `audit-${Date.now()}`,
        action: 'ACCOUNT_DISCONNECTED',
        entityType: 'PlatformCredential',
        entityId: platform,
        status: 'SUCCESS',
        durationMs: null,
        errorCode: null,
        metadata: { platform },
        createdAt: new Date(),
      });
    }
    return success;
  }

  /**
   * Publish a post variant live to the specified platform
   */
  static async publishLive(request: PublishRequest): Promise<PublishResult> {
    const { platform, contentItemId } = request;

    if (platform === ('WHATSAPP' as PlatformType)) {
      return {
        success: false,
        platform,
        durationMs: 0,
        error: 'منصة WHATSAPP محظورة في هذا النظام.',
      };
    }

    const cred = this.getCredential(platform);
    if (!cred || !cred.isActive) {
      const errorMsg = `حساب منصة ${platform} غير مربوط حالياً. يرجى إدخال بيانات الاعتماد وتصريح الوصول (Access Token) في تبويب "ربط الحسابات" أولاً.`;
      
      LocalJsonStorage.addAuditLog({
        id: `audit-${Date.now()}`,
        action: 'REAL_PUBLISH_FAILED',
        entityType: 'PlatformVariant',
        entityId: `${contentItemId}-${platform}`,
        status: 'FAILED',
        durationMs: 0,
        errorCode: 'CREDENTIAL_MISSING',
        metadata: { platform, contentItemId, error: errorMsg },
        createdAt: new Date(),
      });

      return {
        success: false,
        platform,
        durationMs: 0,
        error: errorMsg,
      };
    }

    let result: PublishResult;

    if (platform === 'FACEBOOK') {
      result = await FacebookPublisher.publish(request, cred);
    } else if (platform === 'INSTAGRAM') {
      result = await InstagramPublisher.publish(request, cred);
    } else if (platform === 'TIKTOK') {
      result = await TikTokPublisher.publish(request, cred);
    } else {
      result = {
        success: false,
        platform,
        durationMs: 0,
        error: `المنصة ${platform} غير مدعومة.`,
      };
    }

    // Update variant status in persistent storage
    if (result.success) {
      LocalJsonStorage.updateVariant(contentItemId, platform, {
        status: 'PUBLISHED',
      });

      // Check if all variants for this item are published
      const item = LocalJsonStorage.getContentById(contentItemId);
      if (item) {
        const allPublished = item.platformVariants.every((v) => v.status === 'PUBLISHED');
        if (allPublished) {
          LocalJsonStorage.updateContentStatus(contentItemId, 'PUBLISHED');
        }
      }

      LocalJsonStorage.addAuditLog({
        id: `audit-${Date.now()}`,
        action: 'REAL_PUBLISH_SUCCESS',
        entityType: 'PlatformVariant',
        entityId: `${contentItemId}-${platform}`,
        status: 'SUCCESS',
        durationMs: result.durationMs,
        errorCode: null,
        metadata: {
          platform,
          contentItemId,
          platformPostId: result.platformPostId,
          postUrl: result.postUrl,
        },
        createdAt: new Date(),
      });
    } else {
      LocalJsonStorage.updateVariant(contentItemId, platform, {
        status: 'FAILED',
      });

      LocalJsonStorage.addAuditLog({
        id: `audit-${Date.now()}`,
        action: 'REAL_PUBLISH_FAILED',
        entityType: 'PlatformVariant',
        entityId: `${contentItemId}-${platform}`,
        status: 'FAILED',
        durationMs: result.durationMs,
        errorCode: 'PUBLISH_API_ERROR',
        metadata: {
          platform,
          contentItemId,
          error: result.error,
          rawResponse: result.rawResponse,
        },
        createdAt: new Date(),
      });
    }

    return result;
  }
}
