import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import fs from 'node:fs';
import { ImageRenderer } from '@/modules/media/image-renderer';
import { ContentStorage } from '@/modules/content/storage';

describe('Arabic Image Studio (M004) - Programmatic RTL Rendering Tests', () => {
  it('should render a valid Square (1:1) PNG image with exact 1080x1080 dimensions', async () => {
    const result = await ImageRenderer.renderToBuffer({
      title: 'الانضباط اليومي الهادئ يصنع الفارق الحقيقي في النهاية',
      subtitle: 'الاستمرارية تتغلب دائماً على الحماس المؤقت.',
      aspectRatio: '1:1',
      theme: 'emerald-dark',
    });

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(1000);

    const meta = await sharp(result.buffer).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1080);
  });

  it('should render a valid Portrait (4:5) PNG image with exact 1080x1350 dimensions', async () => {
    const result = await ImageRenderer.renderToBuffer({
      title: 'لا تقارن بدايتك بمواسم حصاد الآخرين؛ لكل بذرة موعدها',
      subtitle: 'ركّز على مسارك الخاص واصنع أثرك بصبر وتأنٍ.',
      aspectRatio: '4:5',
      theme: 'royal-gold',
    });

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(1000);

    const meta = await sharp(result.buffer).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1350);
  });

  it('should render a valid Vertical (9:16) PNG image with exact 1080x1920 dimensions', async () => {
    const result = await ImageRenderer.renderToBuffer({
      title: 'كل قمة عظيمة بدأت بخطوة صغيرة لم يلحظها أحد',
      subtitle: 'خلفية ملهمة لفيديوهات تيك توك وإنستغرام ريلز.',
      aspectRatio: '9:16',
      theme: 'midnight-teal',
    });

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(1000);

    const meta = await sharp(result.buffer).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1920);
  });

  it('should render correctly with minimal-slate theme without subtitles', async () => {
    const result = await ImageRenderer.renderToBuffer({
      title: 'البساطة هي قمة الأناقة والتركيز',
      aspectRatio: '1:1',
      theme: 'minimal-slate',
    });

    expect(result.buffer).toBeInstanceOf(Buffer);
    const meta = await sharp(result.buffer).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1080);
  });

  it('should save image physically to disk and register in MediaAsset and AuditLog', async () => {
    const renderResult = await ImageRenderer.renderAndSave({
      title: 'بطاقة اختبارية مؤتمتة لحفظ القرص وقاعدة البيانات',
      subtitle: 'فحص تكامل الملفات والوسائط الرقمية.',
      aspectRatio: '1:1',
      theme: 'emerald-dark',
      brandWatermark: 'M.GH.AL TEST',
    });

    // 1. Verify file exists physically on disk
    expect(fs.existsSync(renderResult.filePath)).toBe(true);
    const stats = fs.statSync(renderResult.filePath);
    expect(stats.size).toBe(renderResult.sizeBytes);
    expect(stats.size).toBeGreaterThan(1000);

    // 2. Register media asset via ContentStorage
    const asset = await ContentStorage.addMediaAsset({
      contentItemId: 'item-demo-1',
      mediaType: 'IMAGE',
      storageKey: renderResult.storageKey,
      mediaUrl: renderResult.publicUrl,
      mimeType: 'image/png',
      metadata: {
        width: renderResult.width,
        height: renderResult.height,
        sizeBytes: renderResult.sizeBytes,
        aspectRatio: renderResult.aspectRatio,
        theme: renderResult.theme,
        filename: renderResult.filename,
      },
    });

    expect(asset.id).toBeDefined();
    expect(asset.mediaUrl).toBe(renderResult.publicUrl);
    expect(asset.contentItemId).toBe('item-demo-1');

    // 3. Retrieve media asset by ID
    const retrieved = await ContentStorage.getMediaAssetById(asset.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(asset.id);
    expect(retrieved?.storageKey).toBe(renderResult.storageKey);

    // 4. Retrieve by contentItemId
    const assetsForContent = await ContentStorage.getMediaAssets('item-demo-1');
    expect(assetsForContent.some((a) => a.id === asset.id)).toBe(true);

    // 5. Verify AuditLog entry
    const audit = await ContentStorage.recordAudit({
      action: 'IMAGE_ASSET_GENERATED',
      entityType: 'MediaAsset',
      entityId: asset.id,
      status: 'SUCCESS',
      durationMs: renderResult.durationMs,
      metadata: {
        publicUrl: renderResult.publicUrl,
        sizeBytes: renderResult.sizeBytes,
      },
    });

    expect(audit.id).toBeDefined();
    const recentLogs = await ContentStorage.getAuditLogs(10);
    expect(recentLogs.some((l) => l.id === audit.id)).toBe(true);
  });
});
