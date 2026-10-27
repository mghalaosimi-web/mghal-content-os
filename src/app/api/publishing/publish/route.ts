import { NextResponse } from 'next/server';
import { PublisherService } from '@/modules/publishing';
import { LocalJsonStorage } from '@/modules/content/local-store';
import type { PlatformType } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contentItemId, platform } = body;

    if (!contentItemId) {
      return NextResponse.json(
        { success: false, error: 'معرف المنشور (contentItemId) مطلوب.' },
        { status: 400 }
      );
    }

    if (!platform || !['FACEBOOK', 'INSTAGRAM', 'TIKTOK'].includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'المنصة غير صالحة. المنصات المدعومة: FACEBOOK, INSTAGRAM, TIKTOK فقط.' },
        { status: 400 }
      );
    }

    // Resolve item details
    const item = LocalJsonStorage.getContentById(contentItemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: `المنشور برقم ${contentItemId} غير موجود.` },
        { status: 404 }
      );
    }

    const variant = item.platformVariants.find((v) => v.platform === platform);
    const caption = body.caption || variant?.caption || item.title;
    const hashtags = body.hashtags || variant?.hashtags || [];

    // Find image if available
    let imageUrl = body.imageUrl;
    if (!imageUrl) {
      const mediaAssets = LocalJsonStorage.getMediaAssets(contentItemId);
      const imageAsset = mediaAssets.find((a) => a.mediaType === 'IMAGE');
      if (imageAsset) {
        imageUrl = imageAsset.mediaUrl || imageAsset.storageKey;
      }
    }

    const publishResult = await PublisherService.publishLive({
      contentItemId,
      platform: platform as PlatformType,
      caption,
      hashtags,
      imageUrl,
    });

    if (!publishResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: publishResult.error,
          result: publishResult,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result: publishResult,
      message: `تم نشر المنشور بنجاح على منصة ${platform}!`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
