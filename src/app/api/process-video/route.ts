import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse the form data to get the video file and options
        const formData = await request.formData();
        const videoFile = formData.get('video') as File;
        const targetLanguage = formData.get('targetLanguage') as string;
        const voiceId = formData.get('voiceId') as string;

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

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : `http://localhost:${process.env.PORT || 3000}`;

        // Step 1: Extract audio from video using the new extract-audio route
        console.log('Step 1: Extracting audio from video...');

        const extractFormData = new FormData();
        extractFormData.append('video', videoFile);

        const extractResponse = await fetch(`${baseUrl}/api/extract-audio`, {
            method: 'POST',
            body: extractFormData,
        });

        if (!extractResponse.ok) {
            const error = await extractResponse.json();
            throw new Error(`Audio extraction failed: ${error.error}`);
        }

        // Get extracted audio and metadata
        const extractedAudioBlob = await extractResponse.blob();
        const originalDuration = parseFloat(extractResponse.headers.get('X-Original-Duration') || '0');
        const originalFilename = extractResponse.headers.get('X-Original-Filename') || videoFile.name;

        console.log(`Audio extracted. Original video duration: ${originalDuration} seconds`);

        // Step 2: Process the extracted audio through existing pipeline
        console.log('Step 2: Processing extracted audio...');

        const audioFormData = new FormData();
        audioFormData.append('audio', extractedAudioBlob, 'extracted.wav');
        if (targetLanguage) audioFormData.append('targetLanguage', targetLanguage);
        if (voiceId) audioFormData.append('voiceId', voiceId);

        const audioProcessingResponse = await fetch(`${baseUrl}/api/process-audio`, {
            method: 'POST',
            body: audioFormData,
        });

        if (!audioProcessingResponse.ok) {
            const error = await audioProcessingResponse.json();
            throw new Error(`Audio processing failed: ${error.error}`);
        }

        const audioResult = await audioProcessingResponse.json();
        console.log('Audio processing completed');

        // Step 3: Convert generated audio from base64 to blob
        console.log('Step 3: Preparing generated audio...');

        if (!audioResult.voiceResult?.audioUrl) {
            throw new Error('No audio generated from voice processing');
        }

        // Extract base64 audio data and convert to blob
        const base64Audio = audioResult.voiceResult.audioUrl.replace('data:audio/wav;base64,', '');
        const generatedAudioBuffer = Buffer.from(base64Audio, 'base64');
        const generatedAudioBlob = new Blob([generatedAudioBuffer], { type: 'audio/wav' });

        // Step 4: Inject the generated audio into the original video
        console.log('Step 4: Injecting generated audio into video...');

        const injectFormData = new FormData();
        injectFormData.append('video', videoFile);
        injectFormData.append('audio', generatedAudioBlob, 'generated.wav');

        const injectResponse = await fetch(`${baseUrl}/api/inject-audio`, {
            method: 'POST',
            body: injectFormData,
        });

        if (!injectResponse.ok) {
            const error = await injectResponse.json();
            throw new Error(`Audio injection failed: ${error.error}`);
        }

        // Get the final video and its metadata
        const finalVideoBuffer = await injectResponse.arrayBuffer();
        const generatedAudioDuration = parseFloat(injectResponse.headers.get('X-Audio-Duration') || '0');
        const durationExtended = injectResponse.headers.get('X-Duration-Extended') === 'true';
        const injectionSteps = JSON.parse(injectResponse.headers.get('X-Processing-Steps') || '[]');

        console.log('Video processing pipeline completed');

        // Return the processed video
        const headers = new Headers();
        headers.set("Content-Type", "video/mp4");
        headers.set("Content-Length", finalVideoBuffer.byteLength.toString());
        headers.set("Content-Disposition", `attachment; filename="processed_${originalFilename}"`);
        headers.set("Cache-Control", "no-cache");

        // Add comprehensive metadata as custom headers
        headers.set("X-Processing-Steps", JSON.stringify([
            'Audio extracted from video',
            ...audioResult.steps,
            ...injectionSteps
        ]));
        headers.set("X-Original-Duration", originalDuration.toString());
        headers.set("X-Generated-Audio-Duration", generatedAudioDuration.toString());
        headers.set("X-Duration-Extended", durationExtended.toString());
        headers.set("X-Processing-Success", "true");

        return new Response(finalVideoBuffer, { headers });

    } catch (error) {
        console.error('Error in video processing pipeline:', error);

        return NextResponse.json(
            {
                error: 'Video processing pipeline failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
}

// Configure the runtime to handle longer processing times
export const maxDuration = 300; // 5 minutes
export const runtime = 'nodejs'; 