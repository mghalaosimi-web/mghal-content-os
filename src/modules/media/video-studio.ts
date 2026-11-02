import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export interface AssembleVideoOptions {
  inputVideo: string;
  inputAudio?: string;
  subtitlePath?: string;
  outputPath: string;
}

export async function assembleVideo(options: AssembleVideoOptions): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const { inputVideo, inputAudio, subtitlePath, outputPath } = options;

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const args = ['-loglevel', 'error', '-y', '-i', inputVideo];

      if (inputAudio) {
        args.push('-i', inputAudio);
        // Map video and audio to output, use shortest duration
        args.push('-c:a', 'aac', '-map', '0:v:0', '-map', '1:a:0', '-shortest');
      }

      if (subtitlePath) {
        // Escape path for ffmpeg subtitles filter (handles Windows backslashes and colons)
        let escapedSubtitlePath = subtitlePath.replace(/\\/g, '/');
        escapedSubtitlePath = escapedSubtitlePath.replace(/:/g, '\\:');
        // subtitle filter requires re-encoding the video stream
        args.push('-vf', `subtitles=${escapedSubtitlePath}`);
      } else {
        args.push('-c:v', 'copy');
      }

      args.push(outputPath);

      const ffmpegProcess = spawn('ffmpeg', args);

      let errorMessage = '';

      ffmpegProcess.stderr.on('data', (data) => {
        errorMessage += data.toString();
      });

      ffmpegProcess.on('error', (err) => {
        reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}: ${errorMessage}`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
