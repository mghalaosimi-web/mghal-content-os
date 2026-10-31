import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSrtFile, SubtitleItem } from '@/modules/media/subtitle-generator';
import fs from 'fs/promises';

vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
  }
}));

describe('Subtitle Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a correctly formatted SRT file', async () => {
    const items: SubtitleItem[] = [
      {
        id: 1,
        startTime: '00:00:01,000',
        endTime: '00:00:03,000',
        text: 'مرحبا بكم في هذا الفيديو'
      },
      {
        id: 2,
        startTime: '00:00:03,500',
        endTime: '00:00:05,000',
        text: 'نتمنى لكم مشاهدة ممتعة'
      }
    ];

    await generateSrtFile(items, 'output.srt');

    const expectedSrtContent =
`1
00:00:01,000 --> 00:00:03,000
مرحبا بكم في هذا الفيديو

2
00:00:03,500 --> 00:00:05,000
نتمنى لكم مشاهدة ممتعة
`;

    expect(fs.writeFile).toHaveBeenCalledWith('output.srt', expectedSrtContent, 'utf-8');
  });

  it('should throw an error if items array is empty', async () => {
    await expect(generateSrtFile([], 'output.srt')).rejects.toThrow('Subtitle items cannot be empty');
  });
});
