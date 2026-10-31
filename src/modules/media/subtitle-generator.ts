import fs from 'fs/promises';

export interface SubtitleItem {
  id: number;
  startTime: string; // Format: HH:MM:SS,ms (e.g., 00:00:01,000)
  endTime: string;   // Format: HH:MM:SS,ms
  text: string;
}

export async function generateSrtFile(items: SubtitleItem[], outputPath: string): Promise<void> {
  if (!items || items.length === 0) {
    throw new Error('Subtitle items cannot be empty');
  }

  const srtContent = items.map(item => {
    return `${item.id}\n${item.startTime} --> ${item.endTime}\n${item.text}\n`;
  }).join('\n');

  await fs.writeFile(outputPath, srtContent, 'utf-8');
}
