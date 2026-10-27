import type { PlatformCredential, PublishRequest, PublishResult } from './types';

export class InstagramPublisher {
  private static readonly GRAPH_API_VERSION = 'v21.0';
  private static readonly GRAPH_API_BASE = `https://graph.facebook.com/${this.GRAPH_API_VERSION}`;

  /**
   * Verify Instagram Professional / Creator account connection
   */
  static async verifyConnection(
    accountId: string,
    accessToken: string
  ): Promise<{ success: boolean; accountName?: string; accountId?: string; error?: string }> {
    if (!accountId?.trim() || !accessToken?.trim()) {
      return {
        success: false,
        error: 'معرف حساب إنستغرام (Instagram Account ID) أو رمز الوصول (Access Token) مفقود.',
      };
    }

    try {
      const url = `${this.GRAPH_API_BASE}/${encodeURIComponent(accountId.trim())}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(accessToken.trim())}`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();

      if (!res.ok || data.error) {
        const errorMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
        return {
          success: false,
          error: `فشل التحقق من حساب إنستغرام: ${errorMsg}`,
        };
      }

      const username = data.username ? `@${data.username}` : (data.name || `Instagram (${accountId})`);

      return {
        success: true,
        accountName: username,
        accountId: data.id || accountId,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `خطأ اتصال بشبكة إنستغرام: ${msg}`,
      };
    }
  }

  /**
   * Publish photo post to Instagram Business/Creator Account via Meta 2-step Container API
   */
  static async publish(
    request: PublishRequest,
    credential: PlatformCredential
  ): Promise<PublishResult> {
    const startTime = Date.now();
    const accountId = credential.accountId?.trim();
    const token = credential.accessToken?.trim();

    if (!accountId || !token) {
      return {
        success: false,
        platform: 'INSTAGRAM',
        durationMs: Date.now() - startTime,
        error: 'بيانات اعتماد إنستغرام غير مكتملة (Account ID أو Access Token مفقود).',
      };
    }

    const caption = [
      request.caption?.trim(),
      request.hashtags?.length ? request.hashtags.join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    // Instagram Content Publishing API strictly requires a public image URL
    let publicImageUrl: string | null = null;
    if (request.imageUrl) {
      if (request.imageUrl.startsWith('http://') || request.imageUrl.startsWith('https://')) {
        publicImageUrl = request.imageUrl;
      } else {
        const publicBase =
          process.env.PUBLIC_IMAGE_BASE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.APP_URL;

        if (publicBase && !publicBase.includes('localhost')) {
          const cleanBase = publicBase.replace(/\/$/, '');
          const cleanPath = request.imageUrl.startsWith('/') ? request.imageUrl : `/${request.imageUrl}`;
          publicImageUrl = `${cleanBase}${cleanPath}`;
        }
      }
    }

    if (!publicImageUrl) {
      return {
        success: false,
        platform: 'INSTAGRAM',
        durationMs: Date.now() - startTime,
        error:
          'يتطلب إنستغرام (Meta API) رابط صورة علني HTTPS متاح على شبكة الإنترنت. عند التشغيل المحلي، يرجى تزويد PUBLIC_IMAGE_BASE_URL في .env (مثل رابط ngrok أو CDN أو استضافة علنية) أو استخدام صورة برابط مباشر.',
      };
    }

    try {
      // Step 1: Create IG Container
      const containerParams = new URLSearchParams();
      containerParams.append('image_url', publicImageUrl);
      containerParams.append('caption', caption);
      containerParams.append('access_token', token);

      const containerRes = await fetch(`${this.GRAPH_API_BASE}/${encodeURIComponent(accountId)}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: containerParams.toString(),
      });
      const containerData = await containerRes.json();

      if (!containerRes.ok || containerData.error) {
        const errObj = (containerData.error as { message?: string; code?: number }) || {};
        return {
          success: false,
          platform: 'INSTAGRAM',
          durationMs: Date.now() - startTime,
          error: `فشل إنشاء حاوية إنستغرام: ${errObj.message || `HTTP ${containerRes.status}`}`,
          rawResponse: containerData,
        };
      }

      const creationId = containerData.id as string;
      if (!creationId) {
        return {
          success: false,
          platform: 'INSTAGRAM',
          durationMs: Date.now() - startTime,
          error: 'لم تُعد واجهة إنستغرام معرف الحاوية (Creation ID).',
          rawResponse: containerData,
        };
      }

      // Step 2: Publish Media Container
      const publishParams = new URLSearchParams();
      publishParams.append('creation_id', creationId);
      publishParams.append('access_token', token);

      const publishRes = await fetch(
        `${this.GRAPH_API_BASE}/${encodeURIComponent(accountId)}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: publishParams.toString(),
        }
      );
      const publishData = await publishRes.json();

      const durationMs = Date.now() - startTime;

      if (!publishRes.ok || publishData.error) {
        const errObj = (publishData.error as { message?: string; code?: number }) || {};
        return {
          success: false,
          platform: 'INSTAGRAM',
          durationMs,
          error: `فشل نشر حاوية إنستغرام: ${errObj.message || `HTTP ${publishRes.status}`}`,
          rawResponse: publishData,
        };
      }

      const mediaId = publishData.id as string;
      const postUrl = `https://www.instagram.com/`;

      return {
        success: true,
        platform: 'INSTAGRAM',
        platformPostId: mediaId,
        postUrl,
        durationMs,
        rawResponse: publishData,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        platform: 'INSTAGRAM',
        durationMs: Date.now() - startTime,
        error: `استثناء أثناء النشر على إنستغرام: ${msg}`,
      };
    }
  }
}
