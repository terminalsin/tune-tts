import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export async function POST(request: NextRequest) {
    try {
        if (!process.env.DEEPGRAM_API_KEY) {
            return NextResponse.json(
                { error: 'Deepgram API key not configured' },
                { status: 500 }
            );
        }

        // Get the audio file from the request
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/webm'];
        if (!allowedTypes.includes(audioFile.type)) {
            return NextResponse.json(
                { error: 'Unsupported audio format. Please use WAV, MP3, MP4, OGG, or WebM' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const audioBuffer = await audioFile.arrayBuffer();

        console.log('Starting audio transcription with Deepgram...');
        console.log(`File: ${audioFile.name}, Size: ${audioBuffer.byteLength} bytes, Type: ${audioFile.type}`);

        // Transcribe with Deepgram
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            Buffer.from(audioBuffer),
            {
                model: 'nova-2',
                language: 'en-US',
                smart_format: true,
                punctuate: true,
                diarize: true,
                utterances: true,
                paragraphs: true,
                summarize: false,
                detect_language: false,
                filler_words: false,
                multichannel: false,
            }
        );

        if (error) {
            console.error('Deepgram transcription error:', error);
            return NextResponse.json(
                { error: 'Failed to transcribe audio: ' + error.message },
                { status: 500 }
            );
        }

        if (!result || !result.results || !result.results.channels || result.results.channels.length === 0) {
            return NextResponse.json(
                { error: 'No transcription results received' },
                { status: 500 }
            );
        }

        const channel = result.results.channels[0];

        if (!channel.alternatives || channel.alternatives.length === 0) {
            return NextResponse.json(
                { error: 'No transcription alternatives found' },
                { status: 500 }
            );
        }

        const transcript = channel.alternatives[0];

        // Extract timing information from words
        const words = transcript.words || [];
        const sentences = transcript.paragraphs?.paragraphs || [];

        // Create detailed timing information
        const wordTimings = words.map(word => ({
            word: word.word,
            start: word.start,
            end: word.end,
            confidence: word.confidence,
            punctuatedWord: word.punctuated_word
        }));

        const sentenceTimings = sentences.flatMap(paragraph =>
            paragraph.sentences.map(sentence => ({
                text: sentence.text,
                start: sentence.start,
                end: sentence.end,
                words: [] // Note: sentence-level word timings may not be available in all responses
            }))
        );

        // Get full transcript text
        const fullTranscript = transcript.transcript;

        console.log('Transcription completed successfully');
        console.log(`Transcript: ${fullTranscript.substring(0, 200)}${fullTranscript.length > 200 ? '...' : ''}`);
        console.log(`Words: ${words.length}, Sentences: ${sentenceTimings.length}`);

        return NextResponse.json({
            success: true,
            transcript: fullTranscript,
            wordTimings,
            sentenceTimings,
            metadata: {
                duration: (result.results as any)?.metadata?.duration,
                channels: (result.results as any)?.metadata?.channels,
                modelInfo: (result.results as any)?.metadata?.model_info,
                originalFilename: audioFile.name,
                fileSize: audioBuffer.byteLength,
                mimeType: audioFile.type
            }
        });

    } catch (error) {
        console.error('Error in audio transcription:', error);
        return NextResponse.json(
            {
                error: 'Failed to transcribe audio',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 