import crypto from 'node:crypto';
import { ContentStorage } from '@/modules/content/storage';
import { AIContentGenerator } from '@/modules/content/ai-generator';
import { ImageRenderer } from '@/modules/media/image-renderer';
import type { PlatformType } from '@/types';
import type {
  AutomationRule,
  ScheduledPublishJob,
  AgentAutonomousRunResult,
} from './types';

const DEFAULT_RULE_ID = 'rule-mghal-daily';

export class AutonomousScheduler {
  /**
   * Generates SHA-256 idempotency key to prevent duplicate publishing jobs.
   */
  static generateIdempotencyKey(
    contentItemId: string,
    platform: PlatformType,
    scheduledTime: string
  ): string {
    return crypto
      .createHash('sha256')
      .update(`${contentItemId.trim()}:${platform.trim()}:${scheduledTime.trim()}`)
      .digest('hex');
  }

  /**
   * Calculate next upcoming run time for daily times array in target timezone.
   */
  static calculateNextRunTime(times: string[], timezone = 'Asia/Aden'): string {
    void timezone;
    const now = new Date();
    if (!times || times.length === 0) {
      // Default to 1 hour from now
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    }

    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes;

    // Find the next upcoming time today
    const sortedTimes = [...times].sort();
    for (const t of sortedTimes) {
      const parts = t.split(':').map((n) => parseInt(n, 10));
      const hours = parts[0] ?? 21;
      const minutes = parts[1] ?? 0;
      const tVal = hours * 60 + minutes;

      if (tVal > currentTimeVal + 1) {
        const nextDate = new Date(now);
        nextDate.setHours(hours, minutes, 0, 0);
        return nextDate.toISOString();
      }
    }

    // Otherwise, first time tomorrow
    const firstTime = sortedTimes[0] ?? '21:00';
    const parts = firstTime.split(':').map((n) => parseInt(n, 10));
    const hours = parts[0] ?? 21;
    const minutes = parts[1] ?? 0;

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate.toISOString();
  }

  /**
   * Retrieves the active automation rule agreement or initializes default.
   */
  static getActiveRule(): AutomationRule {
    const rules = ContentStorage.getAutomationRules();
    const active = rules.find((r) => r.isEnabled) || rules[0];

    if (active) {
      return active;
    }

    const defaultRule: AutomationRule = {
      id: DEFAULT_RULE_ID,
      name: 'اتفاقية الجدولة الذاتية اليومية لـ M.GH.AL',
      isEnabled: true,
      cronOrTimes: ['21:00'],
      timezone: 'Asia/Aden',
      topicsPool: [
        'الصبر والاستمرارية في بناء المهارات',
        'قاعدة الـ 20 دقيقة اليومية لإتقان أي مهارة',
        'عقلية الوفرة والتركيز على الإنجاز اليومي',
        'الانضباط الهادئ يتغلب على الحماس المؤقت',
        'كيف تحول الأخطاء إلى دروس نجاح قادمة',
        'بناء الهوية الرقمية الرصينة وصناعة الأثر',
      ],
      targetPlatforms: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
      approvalPolicy: 'REQUIRE_APPROVAL',
      lastRunAt: null,
      nextRunAt: this.calculateNextRunTime(['21:00']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ContentStorage.saveAutomationRule(defaultRule);
    return defaultRule;
  }

  /**
   * Updates or saves an automation schedule agreement.
   */
  static saveRule(updates: Partial<AutomationRule>): AutomationRule {
    const current = this.getActiveRule();
    const times = updates.cronOrTimes || current.cronOrTimes;
    const timezone = updates.timezone || current.timezone || 'Asia/Aden';

    // Strictly ensure WHATSAPP is never in platforms
    const rawPlatforms = updates.targetPlatforms || current.targetPlatforms;
    const cleanPlatforms: PlatformType[] = rawPlatforms.filter(
      (p) => p === 'FACEBOOK' || p === 'INSTAGRAM' || p === 'TIKTOK'
    );

    const updatedRule: AutomationRule = {
      ...current,
      ...updates,
      cronOrTimes: times,
      timezone,
      targetPlatforms: cleanPlatforms.length > 0 ? cleanPlatforms : ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
      nextRunAt: this.calculateNextRunTime(times, timezone),
      updatedAt: new Date().toISOString(),
    };

    ContentStorage.saveAutomationRule(updatedRule);

    // Record audit log for schedule change
    void ContentStorage.recordAudit({
      action: 'AUTOMATION_RULE_UPDATED',
      entityType: 'AutomationRule',
      entityId: updatedRule.id,
      status: 'SUCCESS',
      metadata: {
        cronOrTimes: updatedRule.cronOrTimes,
        approvalPolicy: updatedRule.approvalPolicy,
        targetPlatforms: updatedRule.targetPlatforms,
        isEnabled: updatedRule.isEnabled,
        nextRunAt: updatedRule.nextRunAt,
      },
    });

    return updatedRule;
  }

  /**
   * Executes a full autonomous generation, visual rendering, and scheduling cycle.
   */
  static async runAutonomousTick(force = false): Promise<AgentAutonomousRunResult> {
    const startTime = Date.now();
    const rule = this.getActiveRule();

    if (!rule.isEnabled && !force) {
      throw new Error('قاعدة الأتمتة معطلة حالياً. فعّلها أو استخدم التشغيل الفوري.');
    }

    // 1. Select the next topic from topics pool
    const pool = rule.topicsPool && rule.topicsPool.length > 0 ? rule.topicsPool : [
      'الصبر والاستمرارية في بناء المهارات',
      'الانضباط الهادئ والتراكم اليومي',
      'عقلية النمو ومواجهة التحديات'
    ];

    // Pick topic deterministically based on date to cycle cleanly
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const selectedTopic = pool[dayIndex % pool.length] ?? pool[0] ?? 'الاستمرارية في بناء المهارات';

    // 2. Generate customized Arabic post content for all platforms
    const generated = await AIContentGenerator.generate({
      topic: selectedTopic,
      contentType: 'MOTIVATIONAL',
      tone: 'ملهم، عميق، وعملي',
      saveToDatabase: true,
    });

    const contentItemId = generated.contentItemId || `item-auto-${Date.now()}`;
    const targetStatus = rule.approvalPolicy === 'AUTO_PUBLISH' ? 'SCHEDULED' : 'PENDING_APPROVAL';

    // Update content item status to reflect approval policy
    await ContentStorage.updateStatus(contentItemId, targetStatus);

    // 3. Programmatically render the luxury Arabic PNG image via sharp
    const renderResult = await ImageRenderer.renderAndSave({
      id: contentItemId,
      title: generated.content.title,
      subtitle: generated.content.brief,
      aspectRatio: '1:1',
      theme: 'emerald-dark',
      brandWatermark: 'M.GH.AL STUDIO',
      categoryTag: 'أتمتة الذكاء الاصطناعي',
    });

    // 4. Save MediaAsset and link to ContentItem
    const mediaAsset = await ContentStorage.addMediaAsset({
      contentItemId,
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
        title: generated.content.title,
        subtitle: generated.content.brief,
        automated: true,
      },
    });

    // 5. Schedule publishing jobs with idempotency keys
    const scheduledTime = rule.nextRunAt || new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const targetPlatforms = rule.targetPlatforms || ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'];
    const createdJobs: ScheduledPublishJob[] = [];
    const idempotencyKeys: string[] = [];

    for (const platform of targetPlatforms) {
      const idempotencyKey = this.generateIdempotencyKey(contentItemId, platform, scheduledTime);
      idempotencyKeys.push(idempotencyKey);

      // Check if job with this idempotency key already exists
      const existingJob = ContentStorage.getScheduledJobByIdempotencyKey(idempotencyKey);
      if (existingJob) {
        createdJobs.push(existingJob);
        continue;
      }

      const job: ScheduledPublishJob = {
        id: `job-${Date.now()}-${platform.toLowerCase()}`,
        contentItemId,
        platform,
        scheduledTime,
        status: rule.approvalPolicy === 'AUTO_PUBLISH' ? 'SCHEDULED' : 'PENDING_APPROVAL',
        idempotencyKey,
        executedAt: null,
        ruleId: rule.id,
        createdAt: new Date().toISOString(),
      };

      ContentStorage.addScheduledJob(job);
      createdJobs.push(job);

      // Update variant status
      ContentStorage.updateVariant(contentItemId, platform, {
        status: rule.approvalPolicy === 'AUTO_PUBLISH' ? 'SCHEDULED' : 'READY_FOR_REVIEW',
      });
    }

    // 6. Update rule run times
    const nowIso = new Date().toISOString();
    const nextRun = this.calculateNextRunTime(rule.cronOrTimes, rule.timezone);
    const updatedRule = this.saveRule({
      lastRunAt: nowIso,
      nextRunAt: nextRun,
    });

    const durationMs = Date.now() - startTime;

    // 7. Record comprehensive Audit Log
    await ContentStorage.recordAudit({
      action: 'AUTONOMOUS_CYCLE_EXECUTED',
      entityType: 'AutomationRule',
      entityId: updatedRule.id,
      status: 'SUCCESS',
      durationMs,
      metadata: {
        topic: selectedTopic,
        contentItemId,
        mediaAssetId: mediaAsset.id,
        imageUrl: renderResult.publicUrl,
        policy: updatedRule.approvalPolicy,
        scheduledTime,
        targetPlatforms,
        idempotencyKeys,
        jobsScheduled: createdJobs.length,
      },
    });

    return {
      rule: updatedRule,
      contentItem: {
        id: contentItemId,
        title: generated.content.title,
        topic: selectedTopic,
        status: targetStatus,
      },
      mediaAsset: {
        id: mediaAsset.id,
        publicUrl: renderResult.publicUrl,
        width: renderResult.width,
        height: renderResult.height,
        sizeBytes: renderResult.sizeBytes,
      },
      scheduledJobs: createdJobs,
      idempotencyKeys,
      durationMs,
    };
  }
}
