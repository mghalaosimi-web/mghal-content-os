import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ImageRenderer, type AspectRatio, type StudioTheme } from '@/modules/media/image-renderer';
import { ContentStorage } from '@/modules/content/storage';

const imageGenerateSchema = z.object({
  contentItemId: z.string().trim().optional(),
  title: z.string().trim().min(3, 'العنوان الرئيسي يجب ألا يقل عن 3 أحرف').max(300),
  subtitle: z.string().trim().max(300).optional(),
  aspectRatio: z.enum(['1:1', '4:5', '9:16']).default('1:1'),
  theme: z.enum(['emerald-dark', 'royal-gold', 'midnight-teal', 'minimal-slate']).default('emerald-dark'),
  brandWatermark: z.string().trim().max(50).default('M.GH.AL'),
  categoryTag: z.string().trim().max(50).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentItemId = searchParams.get('contentItemId') || undefined;

    const assets = await ContentStorage.getMediaAssets(contentItemId);
    return NextResponse.json({
      success: true,
      data: assets,
    });
  } catch (error: unknown) {
    const message = (error as Error).message || 'Failed to retrieve media assets';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const validation = imageGenerateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'فشل التحقق من مدخلات الصورة',
          issues: validation.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { contentItemId, title, subtitle, aspectRatio, theme, brandWatermark, categoryTag } =
      validation.data;

    // Render image file to disk programmatically using sharp
    const renderResult = await ImageRenderer.renderAndSave({
      id: contentItemId,
      title,
      subtitle,
      aspectRatio: aspectRatio as AspectRatio,
      theme: theme as StudioTheme,
      brandWatermark,
      categoryTag,
    });

    // Explicit verification of physical dimensions via sharp metadata
    const verifiedMeta = await (await import('sharp')).default(renderResult.buffer).metadata();
    if (!verifiedMeta.width || !verifiedMeta.height) {
      throw new Error('فشل التحقق من أبعاد الصورة الفيزيائية عبر sharp');
    }

    // Create a target content item if not specified, so media asset has a parent reference
    let targetContentId = contentItemId;
    if (!targetContentId) {
      const autoItem = await ContentStorage.add({
        title,
        topic: subtitle || title,
        brief: `بطاقة محتوى بصرية تم توليدها برمجياً (${aspectRatio} - ${theme})`,
        contentType: 'MOTIVATIONAL',
        status: 'PENDING_APPROVAL',
        language: 'ar',
        platformVariants: [
          {
            id: '',
            contentItemId: '',
            platform: 'FACEBOOK',
            caption: `${title}\n\n${subtitle || ''}`,
            hashtags: ['#MghalStudio', '#محتوى_عربي'],
            status: 'READY_FOR_REVIEW',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            contentItemId: '',
            platform: 'INSTAGRAM',
            caption: `${title}\n\n${subtitle || ''}`,
            hashtags: ['#MghalStudio', '#محتوى_عربي', '#تصميم_رقمي'],
            status: 'READY_FOR_REVIEW',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            contentItemId: '',
            platform: 'TIKTOK',
            caption: `${title}\n\n${subtitle || ''}`,
            hashtags: ['#MghalStudio', '#fyp'],
            status: 'READY_FOR_REVIEW',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      targetContentId = autoItem.id;
    }

    // Persist MediaAsset record
    const mediaAsset = await ContentStorage.addMediaAsset({
      contentItemId: targetContentId,
      mediaType: 'IMAGE',
      storageKey: renderResult.storageKey,
      mediaUrl: renderResult.publicUrl,
      mimeType: 'image/png',
      metadata: {
        width: renderResult.width,
        height: renderResult.height,
        sizeBytes: renderResult.sizeBytes,
        format: renderResult.format,
        aspectRatio: renderResult.aspectRatio,
        theme: renderResult.theme,
        filename: renderResult.filename,
        title,
        subtitle,
        brandWatermark,
      },
    });

    // Record Audit Log event
    const durationMs = Date.now() - startTime;
    await ContentStorage.recordAudit({
      action: 'IMAGE_ASSET_GENERATED',
      entityType: 'MediaAsset',
      entityId: mediaAsset.id,
      status: 'SUCCESS',
      durationMs,
      metadata: {
        publicUrl: renderResult.publicUrl,
        aspectRatio,
        theme,
        width: renderResult.width,
        height: renderResult.height,
        sizeBytes: renderResult.sizeBytes,
        contentItemId: targetContentId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        assetId: mediaAsset.id,
        contentItemId: targetContentId,
        publicUrl: renderResult.publicUrl,
        storageKey: renderResult.storageKey,
        filename: renderResult.filename,
        width: renderResult.width,
        height: renderResult.height,
        sizeBytes: renderResult.sizeBytes,
        format: renderResult.format,
        aspectRatio: renderResult.aspectRatio,
        theme: renderResult.theme,
        durationMs,
      },
    });
  } catch (error: unknown) {
    const message = (error as Error).message || 'حدث خطأ أثناء معالجة وتوليد الصورة';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
