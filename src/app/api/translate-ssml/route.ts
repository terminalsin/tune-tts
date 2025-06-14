import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { ssml, targetLanguage } = await request.json();

        if (!ssml || !targetLanguage) {
            return NextResponse.json(
                { error: 'SSML text and target language are required' },
                { status: 400 }
            );
        }

        const prompt = `Translate the following SSML markup to ${targetLanguage}. IMPORTANT: 
    - Preserve ALL SSML tags exactly as they are
    - Only translate the actual text content within the tags
    - Do not modify any SSML attributes or tag structure
    - Return only the translated SSML markup

Original SSML:
${ssml}

Translated SSML:`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert translator who specializes in preserving SSML markup while translating text content. You must maintain all SSML tags and attributes exactly as they are, only translating the text content within the tags.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
        });

        const translatedSSML = response.choices[0]?.message?.content;

        if (!translatedSSML) {
            throw new Error('No translation received from OpenAI');
        }

        return NextResponse.json({ translatedSSML });
    } catch (error) {
        console.error('Error translating SSML:', error);
        return NextResponse.json(
            { error: 'Failed to translate SSML' },
            { status: 500 }
        );
    }
} 