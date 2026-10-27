import type { PlatformCredential, PublishRequest, PublishResult } from './types';

export class TikTokPublisher {
  private static readonly API_BASE = 'https://open.tiktokapis.com/v2';

  /**
   * Verify TikTok connection and access token
   */
  static async verifyConnection(
    accessToken: string
  ): Promise<{ success: boolean; accountName?: string; accountId?: string; error?: string }> {
    if (!accessToken?.trim()) {
      return {
        success: false,
        error: 'رمز وصول تيك توك (TikTok Access Token) مفقود.',
      };
    }

    try {
      const url = `${this.API_BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.trim()}`,
        },
      });
      const data = await res.json();

      if (!res.ok || data.error?.code !== 'ok' && data.error?.code !== 0 && data.error) {
        const errorMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
        return {
          success: false,
          error: `فشل التحقق من حساب تيك توك: ${errorMsg}`,
        };
      }

      const user = data.data?.user || {};
      const displayName = user.display_name || user.open_id || 'TikTok Creator';

      return {
        success: true,
        accountName: displayName,
        accountId: user.open_id || user.union_id || 'tiktok-creator',
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `خطأ اتصال بواجهة تيك توك: ${msg}`,
      };
    }
  }

  /**
   * Publish photo or video post to TikTok via Content Posting API
   */
  static async publish(
    request: PublishRequest,
    credential: PlatformCredential
  ): Promise<PublishResult> {
    const startTime = Date.now();
    const token = credential.accessToken?.trim();

    if (!token) {
      return {
        success: false,
        platform: 'TIKTOK',
        durationMs: Date.now() - startTime,
        error: 'بيانات اعتماد تيك توك غير مكتملة (Access Token مفقود).',
      };
    }

    const caption = [
      request.caption?.trim(),
      request.hashtags?.length ? request.hashtags.join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

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

    try {
      // Use TikTok Content Posting API
      const endpoint = `${this.API_BASE}/post/publish/content/init/`;
      
      const payload: Record<string, unknown> = {
        post_info: {
          title: caption.slice(0, 2200), // TikTok title limit
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
      };

      if (publicImageUrl) {
        payload.post_mode = 'DIRECT_POST';
        payload.media_type = 'PHOTO';
        payload.source_info = {
          source: 'PULL_FROM_URL',
          photo_cover_index: 1,
          photo_images: [publicImageUrl],
        };
      } else {
        return {
          success: false,
          platform: 'TIKTOK',
          durationMs: Date.now() - startTime,
          error:
            'يتطلب تيك توك رابط وسائط علني (PHOTO أو VIDEO متاح على الإنترنت). يرجى توفير PUBLIC_IMAGE_BASE_URL في .env للنشر المباشر.',
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const durationMs = Date.now() - startTime;

      if (!res.ok || (data.error && data.error.code !== 'ok' && data.error.code !== 0)) {
        const errorDetail = data.error?.message || `HTTP ${res.status}`;
        return {
          success: false,
          platform: 'TIKTOK',
          durationMs,
          error: `خطأ من واجهة تيك توك: ${errorDetail} (كود: ${data.error?.code || res.status})`,
          rawResponse: data,
        };
      }

      const publishId = data.data?.publish_id || data.data?.share_id || 'tt-published';

      return {
        success: true,
        platform: 'TIKTOK',
        platformPostId: publishId,
        postUrl: 'https://www.tiktok.com/',
        durationMs,
        rawResponse: data,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        platform: 'TIKTOK',
        durationMs: Date.now() - startTime,
        error: `استثناء أثناء النشر على تيك توك: ${msg}`,
      };
    }
  }
}
