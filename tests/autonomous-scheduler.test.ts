import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import { AutonomousScheduler } from '@/modules/agent/scheduler-engine';
import { GeminiCommander } from '@/modules/agent/gemini-commander';
import { ContentStorage } from '@/modules/content/storage';
import type { PlatformType } from '@/types';

describe('Gemini Autonomous Commander & Self-Scheduler Tests', () => {
  beforeEach(() => {
    // Ensure storage is initialized
    AutonomousScheduler.getActiveRule();
  });

  it('should save and update the automation schedule agreement properly', () => {
    const updated = AutonomousScheduler.saveRule({
      name: 'اتفاقية النشر المسائية المعتمدة',
      cronOrTimes: ['21:00'],
      timezone: 'Asia/Aden',
      targetPlatforms: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
      approvalPolicy: 'REQUIRE_APPROVAL',
      topicsPool: ['الصبر والاستمرارية', 'قاعدة الـ 20 دقيقة'],
      isEnabled: true,
    });

    expect(updated).toBeDefined();
    expect(updated.cronOrTimes).toEqual(['21:00']);
    expect(updated.timezone).toBe('Asia/Aden');
    expect(updated.targetPlatforms).toEqual(['FACEBOOK', 'INSTAGRAM', 'TIKTOK']);
    expect(updated.approvalPolicy).toBe('REQUIRE_APPROVAL');
    expect(updated.nextRunAt).toBeDefined();

    // Verify persistence in LocalJsonStorage
    const stored = AutonomousScheduler.getActiveRule();
    expect(stored.name).toBe('اتفاقية النشر المسائية المعتمدة');
    expect(stored.cronOrTimes).toContain('21:00');
  });

  it('should strictly exclude WHATSAPP from target platforms if accidentally passed', () => {
    const updated = AutonomousScheduler.saveRule({
      targetPlatforms: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP' as unknown as PlatformType],
    });

    expect(updated.targetPlatforms).not.toContain('WHATSAPP');
    expect(updated.targetPlatforms).toEqual(['FACEBOOK', 'INSTAGRAM', 'TIKTOK']);
  });

  it('should generate deterministic idempotency keys and prevent duplicate scheduling', () => {
    const contentItemId = 'item-test-idem-123';
    const platform = 'INSTAGRAM';
    const scheduledTime = '2026-10-28T21:00:00.000Z';

    const key1 = AutonomousScheduler.generateIdempotencyKey(contentItemId, platform, scheduledTime);
    const key2 = AutonomousScheduler.generateIdempotencyKey(contentItemId, platform, scheduledTime);
    const keyDifferent = AutonomousScheduler.generateIdempotencyKey(contentItemId, 'FACEBOOK', scheduledTime);

    expect(key1).toBe(key2);
    expect(key1.length).toBe(64); // SHA-256 hex string length
    expect(key1).not.toBe(keyDifferent);

    // Add first scheduled job
    const job1 = ContentStorage.addScheduledJob({
      id: 'job-1',
      contentItemId,
      platform,
      scheduledTime,
      status: 'SCHEDULED',
      idempotencyKey: key1,
      executedAt: null,
      ruleId: 'rule-test',
      createdAt: new Date().toISOString(),
    });

    expect(job1.idempotencyKey).toBe(key1);

    const initialJobsCount = ContentStorage.getScheduledJobs().length;

    // Attempt to add duplicate job with exact same idempotency key
    const jobDuplicate = ContentStorage.addScheduledJob({
      id: 'job-2-duplicate',
      contentItemId,
      platform,
      scheduledTime,
      status: 'SCHEDULED',
      idempotencyKey: key1,
      executedAt: null,
      ruleId: 'rule-test',
      createdAt: new Date().toISOString(),
    });

    // Must return the existing job and NOT insert a duplicate
    expect(jobDuplicate.id).toBe('job-1');
    const afterJobsCount = ContentStorage.getScheduledJobs().length;
    expect(afterJobsCount).toBe(initialJobsCount);
  });

  it('should execute runAutonomousTick(), generating content, real image on disk, and jobs', async () => {
    const result = await AutonomousScheduler.runAutonomousTick(true);

    expect(result).toBeDefined();
    expect(result.contentItem.id).toBeDefined();
    expect(result.contentItem.title.length).toBeGreaterThan(3);
    expect(result.contentItem.topic.length).toBeGreaterThan(2);

    // Verify physical image file creation on disk
    expect(result.mediaAsset.publicUrl).toMatch(/^\/generated\/images\/.+\.png$/);
    const publicPath = result.mediaAsset.publicUrl.replace('/generated/images/', '');
    const diskPath = `${process.cwd()}/public/generated/images/${publicPath}`;
    expect(fs.existsSync(diskPath)).toBe(true);

    const stat = fs.statSync(diskPath);
    expect(stat.size).toBeGreaterThan(1000);
    expect(result.mediaAsset.width).toBe(1080);
    expect(result.mediaAsset.height).toBe(1080);

    // Verify scheduled jobs created for the target platforms
    expect(result.scheduledJobs.length).toBeGreaterThanOrEqual(3);
    expect(result.idempotencyKeys.length).toBeGreaterThanOrEqual(3);

    // Verify audit log entry
    const auditLogs = await ContentStorage.getAuditLogs(5);
    const cycleLog = auditLogs.find((l) => l.action === 'AUTONOMOUS_CYCLE_EXECUTED');
    expect(cycleLog).toBeDefined();
    expect(cycleLog?.status).toBe('SUCCESS');
  });

  it('should allow Gemini Commander to process Arabic natural language agreement and execute tools', async () => {
    const prompt =
      'اتفقنا أن تنشئ كل يوم الساعة 9 مساءً منشورًا تحفيزيًا مع صورته وتجدوله على فيسبوك وإنستغرام وتيك توك، وأنشئ لي الآن أول منشور عن الصبر والاستمرارية';

    const response = await GeminiCommander.processOwnerMessage(prompt);

    expect(response.success).toBe(true);
    expect(response.reply).toBeDefined();
    expect(response.executedActions.length).toBeGreaterThanOrEqual(2);

    // Tool 1: update_autonomous_schedule
    const scheduleAction = response.executedActions.find((a) => a.action === 'update_autonomous_schedule');
    expect(scheduleAction).toBeDefined();
    expect(scheduleAction?.success).toBe(true);
    expect((scheduleAction?.params.times as string[])).toContain('21:00');

    // Tool 2: create_complete_post
    const postAction = response.executedActions.find((a) => a.action === 'create_complete_post');
    expect(postAction).toBeDefined();
    expect(postAction?.success).toBe(true);
    expect(postAction?.result.contentItemId).toBeDefined();
    expect(postAction?.result.imageUrl).toMatch(/^\/generated\/images\/.+\.png$/);

    // Verify created post exists in storage
    const createdId = postAction?.result.contentItemId as string;
    const storedPost = await ContentStorage.getById(createdId);
    expect(storedPost).not.toBeNull();
    expect(storedPost?.status).toBe('SCHEDULED');
  });
});
