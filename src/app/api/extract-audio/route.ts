import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promises as fs } from 'fs';
import path from 'path';

// Set the path to the FFmpeg binary
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath('/Users/terminalsin/Documents/NamecheapExperimental/tune-tts/node_modules/ffmpeg-static/ffmpeg');
}

export async function POST(request: NextRequest) {
    const tempFiles: string[] = [];

    try {
        // Parse the form data to get the video file
        const formData = await request.formData();
        const videoFile = formData.get('video') as File;

        if (!videoFile) {
            return NextResponse.json(
                { error: 'Video file is required' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
        if (!allowedTypes.includes(videoFile.type)) {
            return NextResponse.json(
                { error: 'Unsupported video format. Please use MP4, MOV, or AVI' },
                { status: 400 }
            );
        }

        // Create temporary directory for processing
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Save uploaded video to temporary file
        const videoBuffer = await videoFile.arrayBuffer();
        const tempVideoPath = path.join(tempDir, `input_${Date.now()}.mp4`);
        await fs.writeFile(tempVideoPath, Buffer.from(videoBuffer));
        tempFiles.push(tempVideoPath);

        console.log('Extracting audio from video...');

        // Extract audio from video
        const tempAudioPath = path.join(tempDir, `extracted_audio_${Date.now()}.wav`);
        tempFiles.push(tempAudioPath);

        const { originalDuration, videoInfo } = await new Promise<{ originalDuration: number; videoInfo: any }>((resolve, reject) => {
            let videoMetadata: any = null;

            ffmpeg(tempVideoPath)
                .on('start', (commandLine: string) => {
                    console.log('FFmpeg command:', commandLine);
                })
                .on('codecData', (data: any) => {
                    videoMetadata = data;
                    console.log('Video metadata:', data);
                })
                .on('end', () => {
                    console.log('Audio extraction completed');
                    const duration = parseFloat(videoMetadata?.duration || '0');
                    resolve({ originalDuration: duration, videoInfo: videoMetadata });
                })
                .on('error', (err: Error) => {
                    console.error('FFmpeg error:', err);
                    reject(new Error(`Audio extraction failed: ${err.message}`));
                })
                .output(tempAudioPath)
                .audioCodec('pcm_s16le')
                .audioFrequency(22050)
                .audioChannels(1)
                .noVideo()
                .run();
        });

        console.log(`Audio extracted. Original video duration: ${originalDuration} seconds`);

        // Read the extracted audio file
        const audioBuffer = await fs.readFile(tempAudioPath);

        // Clean up temporary files
        await Promise.all(tempFiles.map(async (file) => {
            try {
                await fs.unlink(file);
            } catch (err) {
                console.warn(`Failed to delete temp file ${file}:`, err);
            }
        }));

        // Return the extracted audio with metadata
        const headers = new Headers();
        headers.set("Content-Type", "audio/wav");
        headers.set("Content-Length", audioBuffer.length.toString());
        headers.set("Content-Disposition", `attachment; filename="extracted_audio_${videoFile.name.replace(/\.[^/.]+$/, '')}.wav"`);
        headers.set("Cache-Control", "no-cache");

        // Add metadata as custom headers
        headers.set("X-Original-Duration", originalDuration.toString());
        headers.set("X-Original-Filename", videoFile.name);
        headers.set("X-Original-Size", videoFile.size.toString());
        headers.set("X-Video-Info", JSON.stringify(videoInfo));
        headers.set("X-Extraction-Success", "true");

        return new Response(audioBuffer, { headers });

    } catch (error) {
        console.error('Error in audio extraction:', error);

        // Clean up temporary files in case of error
        await Promise.all(tempFiles.map(async (file) => {
            try {
                await fs.unlink(file);
            } catch (err) {
                // Ignore cleanup errors
            }
        }));

        return NextResponse.json(
            {
                error: 'Audio extraction failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}

// Configure the runtime to handle longer processing times
export const maxDuration = 60; // 1 minute for audio extraction
export const runtime = 'nodejs'; 