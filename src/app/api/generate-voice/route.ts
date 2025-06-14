import { NextRequest, NextResponse } from 'next/server';
import { Resemble } from "@resemble/node";

const RESEMBLE_ENDPOINT = process.env.RESEMBLE_ENDPOINT;
const RESEMBLE_TOKEN = process.env.RESEMBLE_TOKEN;
const RESEMBLE_PROJECT_ID = process.env.RESEMBLE_PROJECT_ID;
const RESEMBLE_VOICE_ID = process.env.RESEMBLE_VOICE_ID;

if (
    !RESEMBLE_ENDPOINT ||
    !RESEMBLE_TOKEN ||
    !RESEMBLE_PROJECT_ID ||
    !RESEMBLE_VOICE_ID
) {
    throw new Error("Missing environment variables");
}

const MIN_CHUNK_SIZE = 4096 * 12; // Adjust as needed
Resemble.setApiKey(RESEMBLE_TOKEN);
Resemble.setSynthesisUrl(RESEMBLE_ENDPOINT);

async function generateCompleteAudio(text: string): Promise<Uint8Array> {
    let startResemble = performance.now();
    let isFirstChunk = true;
    const audioChunks: Uint8Array[] = [];

    try {
        console.log('Initiating Resemble streaming with params:', {
            data: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            sample_rate: 22050,
            precision: "PCM_16",
            project_uuid: RESEMBLE_PROJECT_ID,
            voice_uuid: RESEMBLE_VOICE_ID,
            bufferSize: MIN_CHUNK_SIZE
        });

        for await (const out of Resemble.v2.clips.stream(
            {
                data: text,
                sample_rate: 22050,
                precision: "PCM_16",
                project_uuid: RESEMBLE_PROJECT_ID!,
                voice_uuid: RESEMBLE_VOICE_ID!,
            },
            {
                bufferSize: MIN_CHUNK_SIZE,
                ignoreWavHeader: false,
            }
        )) {
            const { data: chunk } = out as { data: Uint8Array };

            if (chunk) {
                if (isFirstChunk) {
                    const endResemble = performance.now();
                    const timeToFirstSound = endResemble - startResemble;
                    console.log(
                        `Time to first sound for Resemble: ${timeToFirstSound.toFixed(2)}ms`
                    );
                    isFirstChunk = false;
                }
                audioChunks.push(chunk);
                console.log(`Received chunk: ${chunk.length} bytes`);
            }
        }

        if (audioChunks.length === 0) {
            throw new Error('No audio chunks received from Resemble API');
        }

        // Combine all chunks into a single Uint8Array
        const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const completeAudio = new Uint8Array(totalLength);
        let offset = 0;

        for (const chunk of audioChunks) {
            completeAudio.set(chunk, offset);
            offset += chunk.length;
        }

        console.log(`Successfully combined ${audioChunks.length} chunks into ${totalLength} bytes`);
        return completeAudio;

    } catch (error) {
        console.error('Error in generateCompleteAudio:', error);

        // Check for specific error types
        if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error('Resemble API authentication failed. Check your RESEMBLE_TOKEN.');
            } else if (error.message.includes('404')) {
                throw new Error('Resemble resource not found. Check your RESEMBLE_PROJECT_ID and RESEMBLE_VOICE_ID.');
            } else if (error.message.includes('429')) {
                throw new Error('Resemble API rate limit exceeded. Please try again later.');
            } else if (error.message.includes('500')) {
                throw new Error('Resemble API server error. Please try again later.');
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
                throw new Error('Network error connecting to Resemble API. Check your RESEMBLE_ENDPOINT.');
            }

            // Re-throw the original error if not a specific case
            throw error;
        }

        throw new Error('Unknown error occurred during audio generation');
    }
}

export async function POST(request: NextRequest) {
    try {
        // Validate request body
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('Failed to parse request body:', parseError);
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        const { ssml } = body;

        if (!ssml) {
            return NextResponse.json(
                { error: 'SSML text is required' },
                { status: 400 }
            );
        }

        if (typeof ssml !== 'string') {
            return NextResponse.json(
                { error: 'SSML must be a string' },
                { status: 400 }
            );
        }

        if (ssml.length > 10000) {
            return NextResponse.json(
                { error: 'SSML text too long (max 10,000 characters)' },
                { status: 400 }
            );
        }

        console.log('Starting audio generation for SSML:', ssml.substring(0, 200) + (ssml.length > 200 ? '...' : ''));

        // Generate complete audio before responding
        const completeAudio = await generateCompleteAudio(ssml);

        console.log(`Audio generation complete. Total size: ${completeAudio.length} bytes`);

        // Validate audio data
        if (completeAudio.length === 0) {
            return NextResponse.json(
                { error: 'Generated audio is empty' },
                { status: 500 }
            );
        }

        const headers = new Headers();
        headers.set("Content-Type", "audio/wav");
        headers.set("Content-Length", completeAudio.length.toString());
        headers.set("Cache-Control", "no-cache");

        return new Response(completeAudio, { headers });

    } catch (error) {
        console.error('Error in generate-voice endpoint:', error);

        // Return detailed error information
        if (error instanceof Error) {
            return NextResponse.json(
                {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    endpoint: '/api/generate-voice'
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: 'An unexpected error occurred',
                timestamp: new Date().toISOString(),
                endpoint: '/api/generate-voice'
            },
            { status: 500 }
        );
    }
} 