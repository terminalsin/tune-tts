import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text, targetLanguage, voiceId } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text input is required' },
                { status: 400 }
            );
        }

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : `http://localhost:${process.env.PORT || 3000}`;

        // Step 1: Convert text to SSML using Inflection AI
        console.log('Step 1: Converting text to SSML...');
        const ssmlResponse = await fetch(`${baseUrl}/api/text-to-ssml`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!ssmlResponse.ok) {
            const error = await ssmlResponse.json();
            throw new Error(`SSML generation failed: ${error.error}`);
        }

        const { ssml } = await ssmlResponse.json();
        console.log('SSML generated:', ssml);

        let finalSSML = ssml;

        // Step 2: Translate SSML if target language is specified
        if (targetLanguage && targetLanguage.toLowerCase() !== 'english' && targetLanguage.toLowerCase() !== 'en') {
            console.log(`Step 2: Translating SSML to ${targetLanguage}...`);
            const translateResponse = await fetch(`${baseUrl}/api/translate-ssml`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ssml, targetLanguage }),
            });

            if (!translateResponse.ok) {
                const error = await translateResponse.json();
                throw new Error(`Translation failed: ${error.error}`);
            }

            const { translatedSSML } = await translateResponse.json();
            finalSSML = translatedSSML;
            console.log('SSML translated:', finalSSML);
        }

        // Step 3: Generate voice using Resemble AI
        console.log('Step 3: Generating voice...');
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

        const voiceResult = await voiceResponse.json();

        return NextResponse.json({
            success: true,
            originalText: text,
            ssml: ssml,
            translatedSSML: finalSSML !== ssml ? finalSSML : null,
            targetLanguage,
            voiceResult,
            steps: [
                'Text converted to SSML using Inflection AI',
                targetLanguage && targetLanguage.toLowerCase() !== 'english' && targetLanguage.toLowerCase() !== 'en'
                    ? `SSML translated to ${targetLanguage} using OpenAI GPT-4`
                    : 'Translation skipped (English or no target language specified)',
                'Voice generated using Resemble AI'
            ]
        });

    } catch (error) {
        console.error('Error in process-text pipeline:', error);
        return NextResponse.json(
            {
                error: 'Pipeline failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                success: false
            },
            { status: 500 }
        );
    }
} 