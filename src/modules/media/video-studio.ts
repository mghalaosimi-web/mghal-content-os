import { spawn } from 'child_process';

export interface AssembleVideoOptions {
  inputVideo: string;
  inputAudio?: string;
  outputPath: string;
}

export async function assembleVideo(options: AssembleVideoOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const { inputVideo, inputAudio, outputPath } = options;

    const args = ['-loglevel', 'error', '-y', '-i', inputVideo];

    if (inputAudio) {
      args.push('-i', inputAudio);
      // Map video and audio to output, use shortest duration
      args.push('-c:v', 'copy', '-c:a', 'aac', '-map', '0:v:0', '-map', '1:a:0', '-shortest');
    } else {
      args.push('-c', 'copy');
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
  });
}
