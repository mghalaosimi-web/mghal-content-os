import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assembleVideo } from '@/modules/media/video-studio';
import * as child_process from 'child_process';
import { EventEmitter } from 'events';

// Mock child_process
vi.mock('child_process', () => {
  return {
    spawn: vi.fn()
  };
});

describe('Video Studio (FFmpeg Wrapper)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should spawn ffmpeg with correct arguments for video only', async () => {
    // Setup mock process
    const mockProcess = new EventEmitter() as any;
    mockProcess.stderr = new EventEmitter();
    (child_process.spawn as any).mockReturnValue(mockProcess);

    const promise = assembleVideo({
      inputVideo: 'input.mp4',
      outputPath: 'output.mp4',
    });

    // Simulate successful close
    mockProcess.emit('close', 0);

    await promise;

    expect(child_process.spawn).toHaveBeenCalledWith('ffmpeg', [
      '-loglevel', 'error',
      '-y',
      '-i', 'input.mp4',
      '-c:v', 'copy',
      'output.mp4',
    ]);
  });

  it('should spawn ffmpeg with correct arguments for video and audio', async () => {
    const mockProcess = new EventEmitter() as any;
    mockProcess.stderr = new EventEmitter();
    (child_process.spawn as any).mockReturnValue(mockProcess);

    const promise = assembleVideo({
      inputVideo: 'input.mp4',
      inputAudio: 'audio.mp3',
      outputPath: 'output.mp4',
    });

    mockProcess.emit('close', 0);

    await promise;

    expect(child_process.spawn).toHaveBeenCalledWith('ffmpeg', [
      '-loglevel', 'error',
      '-y',
      '-i', 'input.mp4',
      '-i', 'audio.mp3',
      '-c:a', 'aac',
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-shortest',
      '-c:v', 'copy',
      'output.mp4',
    ]);
  });

  it('should spawn ffmpeg with correct arguments when subtitlePath is provided', async () => {
    const mockProcess = new EventEmitter() as any;
    mockProcess.stderr = new EventEmitter();
    (child_process.spawn as any).mockReturnValue(mockProcess);

    const promise = assembleVideo({
      inputVideo: 'input.mp4',
      subtitlePath: 'subs.srt',
      outputPath: 'output.mp4',
    });

    mockProcess.emit('close', 0);

    await promise;

    expect(child_process.spawn).toHaveBeenCalledWith('ffmpeg', [
      '-loglevel', 'error',
      '-y',
      '-i', 'input.mp4',
      '-vf', 'subtitles=subs.srt',
      'output.mp4',
    ]);
  });

  it('should reject when ffmpeg process exits with non-zero code', async () => {
    const mockProcess = new EventEmitter() as any;
    mockProcess.stderr = new EventEmitter();
    (child_process.spawn as any).mockReturnValue(mockProcess);

    const promise = assembleVideo({
      inputVideo: 'input.mp4',
      outputPath: 'output.mp4',
    });

    // Simulate error output and non-zero close
    mockProcess.stderr.emit('data', 'some ffmpeg error');
    mockProcess.emit('close', 1);

    await expect(promise).rejects.toThrow('ffmpeg exited with code 1: some ffmpeg error');
  });

  it('should reject when ffmpeg process fails to spawn', async () => {
    const mockProcess = new EventEmitter() as any;
    mockProcess.stderr = new EventEmitter();
    (child_process.spawn as any).mockReturnValue(mockProcess);

    const promise = assembleVideo({
      inputVideo: 'input.mp4',
      outputPath: 'output.mp4',
    });

    mockProcess.emit('error', new Error('ENOENT'));

    await expect(promise).rejects.toThrow('Failed to spawn ffmpeg: ENOENT');
  });
});
