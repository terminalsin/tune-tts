import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { promises as fs } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export async function POST(request: NextRequest) {
    const tempFiles: string[] = [];

    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'YouTube URL is required' },
                { status: 400 }
            );
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL provided' },
                { status: 400 }
            );
        }

        console.log('Starting YouTube video download:', url);

        // Get video info
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;

        console.log('Video info:', {
            title: videoDetails.title,
            lengthSeconds: videoDetails.lengthSeconds,
            viewCount: videoDetails.viewCount,
            author: videoDetails.author.name
        });

        // Check video duration (limit to 10 minutes for safety)
        const durationInSeconds = parseInt(videoDetails.lengthSeconds);
        if (durationInSeconds > 600) {
            return NextResponse.json(
                { error: 'Video too long. Please use videos shorter than 10 minutes.' },
                { status: 400 }
            );
        }

        // Create temporary directory
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Create temporary file path
        const sanitizedTitle = videoDetails.title.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50);
        const tempVideoPath = path.join(tempDir, `youtube_${Date.now()}_${sanitizedTitle}.mp4`);
        tempFiles.push(tempVideoPath);

        // Download video with best quality MP4 format
        const format = ytdl.chooseFormat(info.formats, {
            quality: 'highestvideo',
            filter: (format: any) => format.container === 'mp4' && format.hasVideo && format.hasAudio
        });

        if (!format) {
            // Fallback to any MP4 format with video and audio
            const fallbackFormat = ytdl.chooseFormat(info.formats, {
                filter: (format: any) => format.container === 'mp4' && format.hasVideo
            });

            if (!fallbackFormat) {
                return NextResponse.json(
                    { error: 'No suitable MP4 format found for this video' },
                    { status: 400 }
                );
            }
        }

        console.log('Selected format:', {
            quality: format?.quality || 'fallback',
            container: format?.container,
            hasVideo: format?.hasVideo,
            hasAudio: format?.hasAudio
        });

        // Download the video
        const videoStream = ytdl(url, {
            format: format,
            highWaterMark: 1 << 25 // 32MB buffer
        });

        const writeStream = require('fs').createWriteStream(tempVideoPath);

        await pipeline(videoStream, writeStream);

        console.log('YouTube video downloaded successfully');

        // Read the downloaded video file
        const videoBuffer = await fs.readFile(tempVideoPath);

        // Clean up temporary files
        await Promise.all(tempFiles.map(async (file) => {
            try {
                await fs.unlink(file);
            } catch (err) {
                console.warn(`Failed to delete temp file ${file}:`, err);
            }
        }));

        // Return the video file
        const headers = new Headers();
        headers.set("Content-Type", "video/mp4");
        headers.set("Content-Length", videoBuffer.length.toString());
        headers.set("Content-Disposition", `attachment; filename="${sanitizedTitle}.mp4"`);
        headers.set("Cache-Control", "no-cache");

        // Add metadata as custom headers
        headers.set("X-Video-Title", videoDetails.title);
        headers.set("X-Video-Duration", videoDetails.lengthSeconds);
        headers.set("X-Video-Author", videoDetails.author.name);
        headers.set("X-Video-Views", videoDetails.viewCount);
        headers.set("X-Video-ID", videoDetails.videoId);
        headers.set("X-Download-Success", "true");

        return new Response(videoBuffer, { headers });

    } catch (error) {
        console.error('Error downloading YouTube video:', error);

        // Clean up temporary files in case of error
        await Promise.all(tempFiles.map(async (file) => {
            try {
                await fs.unlink(file);
            } catch (err) {
                // Ignore cleanup errors
            }
        }));

        // Handle specific ytdl errors
        if (error instanceof Error) {
            if (error.message.includes('Video unavailable')) {
                return NextResponse.json(
                    { error: 'Video is unavailable or private' },
                    { status: 400 }
                );
            } else if (error.message.includes('age-restricted')) {
                return NextResponse.json(
                    { error: 'Video is age-restricted and cannot be downloaded' },
                    { status: 400 }
                );
            } else if (error.message.includes('private')) {
                return NextResponse.json(
                    { error: 'Video is private and cannot be accessed' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            {
                error: 'Failed to download YouTube video',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}

// Configure the runtime to handle longer processing times
export const maxDuration = 180; // 3 minutes for YouTube download
export const runtime = 'nodejs'; 