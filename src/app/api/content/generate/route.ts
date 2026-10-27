import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ContentTypeEnum } from '@/lib/validation/content.schema';
import { AIContentGenerator } from '@/modules/content/ai-generator';

const generateRequestSchema = z.object({
  topic: z.string().trim().min(3, 'Topic must be at least 3 characters').max(300),
  contentType: ContentTypeEnum.default('MOTIVATIONAL'),
  tone: z.string().trim().max(100).optional(),
  targetAudience: z.string().trim().max(150).optional(),
  keywords: z.array(z.string().trim()).max(10).optional(),
  saveToDatabase: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = generateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: validation.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { topic, contentType, tone, targetAudience, keywords, saveToDatabase } = validation.data;

    const result = await AIContentGenerator.generate({
      topic,
      contentType,
      tone,
      targetAudience,
      keywords,
      saveToDatabase,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const message = (error as Error).message || 'Internal server error during content generation';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
