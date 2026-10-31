import { NextRequest, NextResponse } from 'next/server';
import { assembleVideo } from '@/modules/media/video-studio';
import { z } from 'zod';
import { join } from 'path';
import { tmpdir } from 'os';

const assembleVideoSchema = z.object({
  inputVideoId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  inputAudioId: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  subtitleId: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  outputFileName: z.string().regex(/^[a-zA-Z0-9_-]+\.mp4$/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = assembleVideoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { inputVideoId, inputAudioId, subtitleId, outputFileName } = parsed.data;

    // Use /tmp directory to be compatible with serverless environments (e.g. Vercel)
    const mediaDir = join(tmpdir(), 'mghal-media');

    const inputVideo = join(mediaDir, `${inputVideoId}.mp4`);
    const outputPath = join(mediaDir, outputFileName);
    const inputAudio = inputAudioId ? join(mediaDir, `${inputAudioId}.mp3`) : undefined;
    const subtitlePath = subtitleId ? join(mediaDir, `${subtitleId}.srt`) : undefined;

    await assembleVideo({
      inputVideo,
      inputAudio,
      subtitlePath,
      outputPath,
    });

    return NextResponse.json({ success: true, message: 'Video assembled successfully', outputPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
