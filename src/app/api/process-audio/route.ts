import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse the form data to get the audio file and options
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const targetLanguage = formData.get('targetLanguage') as string;
        const voiceId = formData.get('voiceId') as string;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : `http://localhost:${process.env.PORT || 3000}`;

        const steps = [];

        // Step 1: Transcribe audio using Deepgram
        console.log('Step 1: Transcribing audio with Deepgram...');
        steps.push('Audio transcribed using Deepgram with timing information');

        const transcriptionFormData = new FormData();
        transcriptionFormData.append('audio', audioFile);

        const transcriptionResponse = await fetch(`${baseUrl}/api/transcribe-audio`, {
            method: 'POST',
            body: transcriptionFormData,
        });

        if (!transcriptionResponse.ok) {
            const error = await transcriptionResponse.json();
            throw new Error(`Audio transcription failed: ${error.error}`);
        }

        const transcriptionResult = await transcriptionResponse.json();
        console.log('Audio transcribed:', transcriptionResult.transcript.substring(0, 200) + '...');

        // Step 2: Generate timing-aware SSML using the transcription and timing data
        console.log('Step 2: Generating timing-aware SSML...');
        steps.push('SSML generated with natural timing and prosody based on original audio');

        const ssmlResponse = await fetch(`${baseUrl}/api/text-to-ssml-with-timing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transcript: transcriptionResult.transcript,
                wordTimings: transcriptionResult.wordTimings,
                sentenceTimings: transcriptionResult.sentenceTimings
            }),
        });

        if (!ssmlResponse.ok) {
            const error = await ssmlResponse.json();
            throw new Error(`Timing-aware SSML generation failed: ${error.error}`);
        }

        const ssmlResult = await ssmlResponse.json();
        console.log('Timing-aware SSML generated:', ssmlResult.ssml.substring(0, 200) + '...');

        let finalSSML = ssmlResult.ssml;

        // Step 3: Translate SSML if target language is specified
        if (targetLanguage && targetLanguage.toLowerCase() !== 'english' && targetLanguage.toLowerCase() !== 'en') {
            console.log(`Step 3: Translating SSML to ${targetLanguage}...`);
            steps.push(`SSML translated to ${targetLanguage} using OpenAI GPT-4o while preserving timing structure`);

            const translateResponse = await fetch(`${baseUrl}/api/translate-ssml`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ssml: finalSSML, targetLanguage }),
            });

            if (!translateResponse.ok) {
                const error = await translateResponse.json();
                throw new Error(`Translation failed: ${error.error}`);
            }

            const { translatedSSML } = await translateResponse.json();
            finalSSML = translatedSSML;
            console.log('SSML translated:', finalSSML.substring(0, 200) + '...');
        } else {
            steps.push('Translation skipped (English or no target language specified)');
        }

        // Step 4: Generate voice using Resemble AI
        console.log('Step 4: Generating voice...');
        steps.push('High-quality voice generated using Resemble AI');

        const voiceResponse = await fetch(`${baseUrl}/api/generate-voice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ssml: finalSSML, voiceId }),
        });

        if (!voiceResponse.ok) {
            const error = await voiceResponse.json();
            throw new Error(`Voice generation failed: ${error.error}`);
        }

        // Handle the audio response (which should be binary audio data)
        let voiceResult;
        if (voiceResponse.headers.get('content-type')?.includes('audio/wav')) {
            // Create a blob URL for the audio
            const audioBlob = await voiceResponse.blob();
            const audioBuffer = await audioBlob.arrayBuffer();
            const base64Audio = Buffer.from(audioBuffer).toString('base64');
            const audioUrl = `data:audio/wav;base64,${base64Audio}`;

            voiceResult = {
                audioUrl,
                status: 'completed',
                format: 'wav'
            };
        } else {
            // Fallback to JSON response
            voiceResult = await voiceResponse.json();
        }

        return NextResponse.json({
            success: true,
            originalFilename: audioFile.name,
            transcription: {
                transcript: transcriptionResult.transcript,
                wordCount: transcriptionResult.wordTimings?.length || 0,
                duration: transcriptionResult.metadata?.duration,
                confidence: transcriptionResult.wordTimings?.length > 0
                    ? transcriptionResult.wordTimings.reduce((sum: number, word: any) => sum + word.confidence, 0) / transcriptionResult.wordTimings.length
                    : 0
            },
            ssml: ssmlResult.ssml,
            translatedSSML: finalSSML !== ssmlResult.ssml ? finalSSML : null,
            targetLanguage,
            voiceResult,
            timingAnalysis: ssmlResult.timingAnalysis,
            steps
        });

    } catch (error) {
        console.error('Error in audio processing pipeline:', error);
        return NextResponse.json(
            {
                error: 'Audio processing pipeline failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
} 