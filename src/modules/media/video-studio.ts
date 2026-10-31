import { spawn } from 'child_process';

export interface AssembleVideoOptions {
  inputVideo: string;
  inputAudio?: string;
  subtitlePath?: string;
  outputPath: string;
}

export async function assembleVideo(options: AssembleVideoOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const { inputVideo, inputAudio, subtitlePath, outputPath } = options;

    const args = ['-loglevel', 'error', '-y', '-i', inputVideo];

    if (inputAudio) {
      args.push('-i', inputAudio);
      // Map video and audio to output, use shortest duration
      args.push('-c:a', 'aac', '-map', '0:v:0', '-map', '1:a:0', '-shortest');
    }

    if (subtitlePath) {
      // subtitle filter requires re-encoding the video stream
      args.push('-vf', `subtitles=${subtitlePath}`);
      // If we are filtering, we cannot copy the video codec. We must omit '-c:v copy'
      // or explicitly set it to an encoder like libx264, but omitting it lets FFmpeg choose.
    } else {
      args.push('-c:v', 'copy');
    }

    if (!inputAudio && !subtitlePath) {
       // If neither audio nor subtitles are provided, just copy
       // (this handles the edge case correctly since we added -c:v copy above)
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
