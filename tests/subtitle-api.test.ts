import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/media/subtitles/route';
import { NextRequest } from 'next/server';
import { generateSrtFile } from '@/modules/media/subtitle-generator';
import { join } from 'path';

vi.mock('@/modules/media/subtitle-generator', () => ({
  generateSrtFile: vi.fn(),
}));

describe('Subtitle API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/media/subtitles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('should return 400 if validation fails (empty items)', async () => {
    const req = createRequest({ subtitleId: 'sub123', items: [] });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('should return 400 if validation fails (invalid subtitleId)', async () => {
    const req = createRequest({ subtitleId: 'sub@123', items: [{ id: 1, startTime: '00:00:00,000', endTime: '00:00:01,000', text: 'Hello' }] });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('should return 200 on successful subtitle generation', async () => {
    (generateSrtFile as any).mockResolvedValue(undefined);

    const items = [
      { id: 1, startTime: '00:00:01,000', endTime: '00:00:03,000', text: 'مرحبا' }
    ];

    const req = createRequest({
      subtitleId: 'subs123',
      items,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const expectedPath = join(process.cwd(), 'public', 'generated', 'media', 'subs123.srt');
    expect(generateSrtFile).toHaveBeenCalledWith(items, expectedPath);
  });

  it('should return 500 if generateSrtFile throws an error', async () => {
    (generateSrtFile as any).mockRejectedValue(new Error('File system error'));

    const items = [
      { id: 1, startTime: '00:00:01,000', endTime: '00:00:03,000', text: 'مرحبا' }
    ];

    const req = createRequest({
      subtitleId: 'subs123',
      items,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('File system error');
  });
});
