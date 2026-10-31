import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/media/video/route';
import { NextRequest } from 'next/server';
import { assembleVideo } from '@/modules/media/video-studio';
import { join } from 'path';

vi.mock('@/modules/media/video-studio', () => ({
  assembleVideo: vi.fn(),
}));

describe('Video API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/media/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('should return 400 if validation fails', async () => {
    const req = createRequest({ inputVideoId: 'inv@lid' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('should return 200 on successful video assembly', async () => {
    (assembleVideo as any).mockResolvedValue(undefined);

    const req = createRequest({
      inputVideoId: 'video123',
      subtitleId: 'subs456',
      outputFileName: 'final-cut.mp4',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const mediaDir = join(process.cwd(), 'public', 'generated', 'media');
    expect(assembleVideo).toHaveBeenCalledWith({
      inputVideo: join(mediaDir, 'video123.mp4'),
      inputAudio: undefined,
      subtitlePath: join(mediaDir, 'subs456.srt'),
      outputPath: join(mediaDir, 'final-cut.mp4'),
    });
  });

  it('should return 500 if assembleVideo throws an error', async () => {
    (assembleVideo as any).mockRejectedValue(new Error('FFmpeg failed'));

    const req = createRequest({
      inputVideoId: 'video123',
      outputFileName: 'final-cut.mp4',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('FFmpeg failed');
  });
});
