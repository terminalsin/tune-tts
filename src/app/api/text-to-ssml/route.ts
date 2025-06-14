import { inflection } from 'inflection-ai-sdk-provider';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        const prompt = `Convert the following text into SSML markup for speech synthesis. Use appropriate SSML tags like <prosody>, <emphasis>, <break>, <say-as>, etc. to enhance the speech quality and naturalness. Return only the SSML markup wrapped in a <speak> tag:

Text: ${text}

SSML:`;

        const { text: ssmlText } = await generateText({
            model: inflection('inflection_3_pi'),
            prompt,
        });

        return NextResponse.json({ ssml: ssmlText });
    } catch (error) {
        console.error('Error generating SSML:', error);
        return NextResponse.json(
            { error: 'Failed to generate SSML' },
            { status: 500 }
        );
    }
} 