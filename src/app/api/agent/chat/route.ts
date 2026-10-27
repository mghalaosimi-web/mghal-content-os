import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiCommander } from '@/modules/agent/gemini-commander';

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'الرسالة لا يمكن أن تكون فارغة').max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'فشل التحقق من مدخلات المحادثة',
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { message } = validation.data;
    const response = await GeminiCommander.processOwnerMessage(message);

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = (error as Error).message || 'حدث خطأ غير متوقع أثناء معالجة أمر الوكيل';
    return NextResponse.json(
      {
        success: false,
        error: message,
        aiStatus: GeminiCommander.getAIStatus(),
      },
      { status: 500 }
    );
  }
}
