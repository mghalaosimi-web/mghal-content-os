import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { join } from 'path';
import { generateSrtFile } from '@/modules/media/subtitle-generator';

const subtitleItemSchema = z.object({
  id: z.number().int().positive(),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2},\d{3}$/, 'Invalid start time format (HH:MM:SS,ms)'),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2},\d{3}$/, 'Invalid end time format (HH:MM:SS,ms)'),
  text: z.string().min(1),
});

const generateSubtitleSchema = z.object({
  subtitleId: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid subtitle ID'),
  items: z.array(subtitleItemSchema).min(1, 'Subtitle items cannot be empty'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = generateSubtitleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { subtitleId, items } = parsed.data;

    // Secure path generation ensuring isolation
    const mediaDir = join(process.cwd(), 'public', 'generated', 'media');
    const outputPath = join(mediaDir, `${subtitleId}.srt`);

    await generateSrtFile(items, outputPath);

    return NextResponse.json({ success: true, message: 'Subtitles generated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
