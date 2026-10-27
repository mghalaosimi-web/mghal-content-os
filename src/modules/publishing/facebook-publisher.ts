import fs from 'node:fs';
import path from 'node:path';
import type { PlatformCredential, PublishRequest, PublishResult } from './types';

export class FacebookPublisher {
  private static readonly GRAPH_API_VERSION = 'v21.0';
  private static readonly GRAPH_API_BASE = `https://graph.facebook.com/${this.GRAPH_API_VERSION}`;

  /**
   * Verify Facebook Page connection and access token permissions
   */
  static async verifyConnection(
    pageId: string,
    pageAccessToken: string
  ): Promise<{ success: boolean; accountName?: string; accountId?: string; error?: string }> {
    if (!pageId?.trim() || !pageAccessToken?.trim()) {
      return {
        success: false,
        error: 'معرف الصفحة (Page ID) أو رمز الوصول (Page Access Token) مفقود.',
      };
    }

    try {
      const url = `${this.GRAPH_API_BASE}/${encodeURIComponent(pageId.trim())}?fields=id,name,link,fan_count&access_token=${encodeURIComponent(pageAccessToken.trim())}`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();

      if (!res.ok || data.error) {
        const errorMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
        return {
          success: false,
          error: `فشل التحقق من صفحة فيسبوك: ${errorMsg}`,
        };
      }

      return {
        success: true,
        accountName: data.name || `Facebook Page (${pageId})`,
        accountId: data.id || pageId,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `خطأ اتصال بشبكة فيسبوك: ${msg}`,
      };
    }
  }

  /**
   * Publish real photo or text post to Facebook Page
   */
  static async publish(
    request: PublishRequest,
    credential: PlatformCredential
  ): Promise<PublishResult> {
    const startTime = Date.now();
    const pageId = credential.accountId?.trim();
    const token = credential.accessToken?.trim();

    if (!pageId || !token) {
      return {
        success: false,
        platform: 'FACEBOOK',
        durationMs: Date.now() - startTime,
        error: 'بيانات اعتماد فيسبوك غير مكتملة (Page ID أو Access Token مفقود).',
      };
    }

    const message = [
      request.caption?.trim(),
      request.hashtags?.length ? request.hashtags.join(' ') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      // Check if image is provided and exists locally or remotely
      let localImageBuffer: Buffer | null = null;
      let remoteImageUrl: string | null = null;

      if (request.imageUrl) {
        if (request.imageUrl.startsWith('http://') || request.imageUrl.startsWith('https://')) {
          remoteImageUrl = request.imageUrl;
        } else {
          // Check local file statically scoped inside public folder
          const cleanRelative = request.imageUrl.replace(/^\/?(public\/)?/, '');
          const localFilePath = path.join(process.cwd(), 'public', cleanRelative);
          if (fs.existsSync(localFilePath)) {
            localImageBuffer = fs.readFileSync(localFilePath);
          }
        }
      }

      let res: Response;
      let data: Record<string, unknown> = {};

      if (localImageBuffer) {
        // Upload photo directly via multipart/form-data
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(localImageBuffer)], { type: 'image/png' });
        formData.append('source', blob, 'mghal_post.png');
        formData.append('caption', message);
        formData.append('access_token', token);

        res = await fetch(`${this.GRAPH_API_BASE}/${encodeURIComponent(pageId)}/photos`, {
          method: 'POST',
          body: formData,
        });
        data = await res.json();
      } else if (remoteImageUrl) {
        // Upload photo via public image URL
        const form = new URLSearchParams();
        form.append('url', remoteImageUrl);
        form.append('caption', message);
        form.append('access_token', token);

        res = await fetch(`${this.GRAPH_API_BASE}/${encodeURIComponent(pageId)}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        data = await res.json();
      } else {
        // Feed post (text only)
        const form = new URLSearchParams();
        form.append('message', message);
        form.append('access_token', token);

        res = await fetch(`${this.GRAPH_API_BASE}/${encodeURIComponent(pageId)}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        data = await res.json();
      }

      const durationMs = Date.now() - startTime;

      if (!res.ok || data.error) {
        const errObj = (data.error as { message?: string; code?: number }) || {};
        const errorDetail = errObj.message || `HTTP ${res.status}`;
        return {
          success: false,
          platform: 'FACEBOOK',
          durationMs,
          error: `خطأ من Meta Graph API: ${errorDetail}`,
          rawResponse: data,
        };
      }

      const postId = (data.post_id || data.id) as string;
      const postUrl = postId ? `https://facebook.com/${postId}` : undefined;

      return {
        success: true,
        platform: 'FACEBOOK',
        platformPostId: postId,
        postUrl,
        durationMs,
        rawResponse: data,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        platform: 'FACEBOOK',
        durationMs: Date.now() - startTime,
        error: `استثناء أثناء النشر على فيسبوك: ${msg}`,
      };
    }
  }
}
