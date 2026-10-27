import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AutonomousScheduler } from '@/modules/agent/scheduler-engine';
import { GeminiCommander } from '@/modules/agent/gemini-commander';
import { ContentStorage } from '@/modules/content/storage';
import type { AutomationRule } from '@/modules/agent/types';

export async function GET() {
  try {
    const rule = AutonomousScheduler.getActiveRule();
    const scheduledJobs = ContentStorage.getScheduledJobs();
    const aiStatus = GeminiCommander.getAIStatus();
    const activeModel = GeminiCommander.getActiveModel();

    return NextResponse.json({
      success: true,
      aiStatus,
      activeModel,
      data: {
        rule,
        scheduledJobs,
        totalJobsCount: scheduledJobs.length,
      },
    });
  } catch (error: unknown) {
    const message = (error as Error).message || 'فشل استرجاع بيانات الجدولة الذاتية';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

const scheduleActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('RUN_TICK_NOW'),
    force: z.boolean().optional().default(true),
  }),
  z.object({
    action: z.literal('UPDATE_RULE'),
    rule: z.object({
      name: z.string().optional(),
      cronOrTimes: z.array(z.string()).optional(),
      timezone: z.string().optional(),
      topicsPool: z.array(z.string()).optional(),
      targetPlatforms: z.array(z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK'])).optional(),
      approvalPolicy: z.enum(['REQUIRE_APPROVAL', 'AUTO_PUBLISH']).optional(),
      isEnabled: z.boolean().optional(),
    }),
  }),
  z.object({
    action: z.literal('TOGGLE_ENABLED'),
    isEnabled: z.boolean(),
  }),
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = scheduleActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'فشل التحقق من مدخلات الجدولة',
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const payload = validation.data;

    if (payload.action === 'RUN_TICK_NOW') {
      const result = await AutonomousScheduler.runAutonomousTick(payload.force);
      return NextResponse.json({
        success: true,
        message: 'تم تنفيذ دورة النشر الذاتية بنجاح',
        data: result,
      });
    }

    if (payload.action === 'UPDATE_RULE') {
      const updated = AutonomousScheduler.saveRule(payload.rule as Partial<AutomationRule>);
      return NextResponse.json({
        success: true,
        message: 'تم حفظ وتحديث اتفاقية الجدولة بنجاح',
        data: updated,
      });
    }

    if (payload.action === 'TOGGLE_ENABLED') {
      const updated = AutonomousScheduler.saveRule({ isEnabled: payload.isEnabled });
      return NextResponse.json({
        success: true,
        message: payload.isEnabled ? 'تم تفعيل الأتمتة الذاتية' : 'تم إيقاف الأتمتة الذاتية مؤقتاً',
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error: unknown) {
    const message = (error as Error).message || 'حدث خطأ أثناء معالجة الجدولة الذاتية';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
