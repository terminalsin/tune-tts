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
        // Parse the form data to get the video and audio files
        const formData = await request.formData();
        const videoFile = formData.get('video') as File;
        const audioFile = formData.get('audio') as File;

        if (!videoFile) {
            return NextResponse.json(
                { error: 'Video file is required' },
                { status: 400 }
            );
        }

        if (!audioFile) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        // Validate file types
        const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
        const allowedAudioTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/webm'];

        if (!allowedVideoTypes.includes(videoFile.type)) {
            return NextResponse.json(
                { error: 'Unsupported video format. Please use MP4, MOV, or AVI' },
                { status: 400 }
            );
        }

        if (!allowedAudioTypes.includes(audioFile.type)) {
            return NextResponse.json(
                { error: 'Unsupported audio format. Please use WAV, MP3, MP4, OGG, or WebM' },
                { status: 400 }
            );
        }

        // Create temporary directory for processing
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Save uploaded files to temporary files
        const videoBuffer = await videoFile.arrayBuffer();
        const tempVideoPath = path.join(tempDir, `input_video_${Date.now()}.mp4`);
        await fs.writeFile(tempVideoPath, Buffer.from(videoBuffer));
        tempFiles.push(tempVideoPath);

        const audioBuffer = await audioFile.arrayBuffer();
        const tempAudioPath = path.join(tempDir, `input_audio_${Date.now()}.wav`);
        await fs.writeFile(tempAudioPath, Buffer.from(audioBuffer));
        tempFiles.push(tempAudioPath);

        console.log('Getting video duration...');

        // Get original video duration
        const originalDuration = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(tempVideoPath, (err: any, metadata: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata.format.duration || 0);
                }
            });
        });

        // Get audio duration
        const audioDuration = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(tempAudioPath, (err: any, metadata: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata.format.duration || 0);
                }
            });
        });

        console.log(`Original video duration: ${originalDuration} seconds`);
        console.log(`Audio duration: ${audioDuration} seconds`);

        // Combine video with new audio, handling duration mismatches  
        console.log('Combining video with audio...');

        const outputVideoPath = path.join(tempDir, `output_video_${Date.now()}.mp4`);
        tempFiles.push(outputVideoPath);

        await new Promise<void>((resolve, reject) => {
            const command = ffmpeg(tempVideoPath)
                .input(tempAudioPath)
                .on('start', (commandLine: string) => {
                    console.log('FFmpeg combine command:', commandLine);
                })
                .on('end', () => {
                    console.log('Video and audio combination completed');
                    resolve();
                })
                .on('error', (err: Error) => {
                    console.error('FFmpeg combine error:', err);
                    reject(new Error(`Video combination failed: ${err.message}`));
                });

            // Handle duration mismatch
            if (audioDuration > originalDuration) {
                // Audio is longer than video - extend the last frame of the video
                console.log('Audio is longer than video. Extending last frame...');
                command
                    .outputOptions([
                        '-map', '0:v',    // Use video from first input (original video)
                        '-map', '1:a',    // Use audio from second input (new audio)
                        '-c:v', 'libx264',
                        '-c:a', 'aac',
                        '-shortest',      // This will actually make it longer by extending the last frame
                        '-vf', `tpad=stop_mode=clone:stop_duration=${audioDuration - originalDuration}`,
                        '-avoid_negative_ts', 'make_zero'
                    ]);
            } else {
                // Video is longer than or equal to audio
                console.log('Video duration is adequate. Combining normally...');
                command
                    .outputOptions([
                        '-map', '0:v',    // Use video from first input
                        '-map', '1:a',    // Use audio from second input
                        '-c:v', 'copy',   // Copy video without re-encoding
                        '-c:a', 'aac',    // Encode audio as AAC
                        '-shortest'       // End when shortest stream ends
                    ]);
            }

            command.output(outputVideoPath).run();
        });

        // Read the final video
        console.log('Preparing final video output...');
        const finalVideoBuffer = await fs.readFile(outputVideoPath);

        // Clean up temporary files
        await Promise.all(tempFiles.map(async (file) => {
            try {
                await fs.unlink(file);
            } catch (err) {
                console.warn(`Failed to delete temp file ${file}:`, err);
            }
        }));

        // Return the processed video
        const headers = new Headers();
        headers.set("Content-Type", "video/mp4");
        headers.set("Content-Length", finalVideoBuffer.length.toString());
        headers.set("Content-Disposition", `attachment; filename="injected_${videoFile.name}"`);
        headers.set("Cache-Control", "no-cache");

        // Add metadata as custom headers
        headers.set("X-Original-Video-Duration", originalDuration.toString());
        headers.set("X-Audio-Duration", audioDuration.toString());
        headers.set("X-Duration-Extended", (audioDuration > originalDuration).toString());
        headers.set("X-Processing-Success", "true");
        headers.set("X-Processing-Steps", JSON.stringify([
            'Video and audio files uploaded',
            'Duration analysis completed',
            audioDuration > originalDuration
                ? 'Video extended by cloning last frame to match audio duration'
                : 'Video duration was adequate for audio',
            'Audio successfully injected into video'
        ]));

        return new Response(finalVideoBuffer, { headers });

    } catch (error) {
        console.error('Error in audio injection:', error);

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
                error: 'Audio injection failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}

// Configure the runtime to handle longer processing times
export const maxDuration = 120; // 2 minutes for audio injection
export const runtime = 'nodejs'; 