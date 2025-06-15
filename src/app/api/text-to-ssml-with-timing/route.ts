import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface WordTiming {
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuatedWord?: string;
}

interface SentenceTiming {
    text: string;
    start: number;
    end: number;
    words: WordTiming[];
}

export async function POST(request: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const { transcript, wordTimings, sentenceTimings } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript text is required' },
                { status: 400 }
            );
        }

        if (!wordTimings || !Array.isArray(wordTimings)) {
            return NextResponse.json(
                { error: 'Word timings are required and must be an array' },
                { status: 400 }
            );
        }

        console.log('Generating timing-aware SSML...');
        console.log(`Transcript: ${transcript.substring(0, 200)}${transcript.length > 200 ? '...' : ''}`);
        console.log(`Word timings: ${wordTimings.length} words`);

        // Calculate speaking rates and pauses for each section
        const analysisData = analyzeTimingData(wordTimings, sentenceTimings || []);

        const systemPrompt = `You are an expert SSML generator specializing in creating natural speech markup from audio transcriptions with precise timing data.

Convert the following transcript into SSML markup, using the provided timing information to create natural speech patterns with appropriate pacing, pauses, and prosody.

INSTRUCTIONS:
1. Create SSML markup that preserves the natural timing and pacing from the original audio
2. Use <break> tags for pauses longer than 0.3 seconds
3. Use <prosody rate="..."> to adjust speaking rate for sections that are notably faster or slower than average
4. Use <emphasis> for words with high confidence that might have been stressed in the original
5. Use <prosody pitch="..."> subtly to indicate natural intonation patterns
6. Wrap everything in <speak> and <lang xml:lang="en-us"> tags as required
7. Be generous with prosody annotations to match the original speech patterns
8. Consider the confidence scores - lower confidence words might need special handling
9. Do not add \`\`\` or \`\`\` at the beginning or end of the output.
10. Do not add any other text or comments to the output.
11. Strictly follow the format of the SSML elements.
12. Do not add any xml tags to <speak> or </speak>
13. After the <speak> tag, add <lang xml:lang="en-us"> and </lang> tags. THIS IS MANDATORY AND SHOULD WRAP THE ENTIRE OUTPUT.
14. Be generous with emotions and intonation tags.
Generate ONLY the SSML markup, no explanations or additional text:`;

        const userPrompt = `TRANSCRIPT (this is json input, ONLY RESPOND WITH SSML MARKUP TEXT. NOTHING ELSE):
${transcript}

TIMING ANALYSIS:
- Average speaking rate: ${analysisData.averageSpeakingRate.toFixed(2)} words per second
- Detected pauses: ${analysisData.significantPauses.length} significant pauses
- Speech segments: ${analysisData.speechSegments.length} segments

WORD-LEVEL TIMING DATA:
${wordTimings.map((word: WordTiming, index: number) => {
            const nextWord = wordTimings[index + 1];
            const pause = nextWord ? nextWord.start - word.end : 0;
            return `"${word.punctuatedWord || word.word}" (${word.start.toFixed(2)}s-${word.end.toFixed(2)}s, confidence: ${word.confidence.toFixed(2)}, pause after: ${pause.toFixed(2)}s)`;
        }).join('\n')}`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 4000,
        });

        const ssml = response.choices[0]?.message?.content;

        if (!ssml) {
            throw new Error('No SSML generated from OpenAI');
        }

        console.log('Timing-aware SSML generated successfully');
        console.log(`SSML length: ${ssml.length} characters`);

        return NextResponse.json({
            success: true,
            ssml: ssml.trim(),
        });

    } catch (error) {
        console.error('Error generating timing-aware SSML:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate timing-aware SSML',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

function analyzeTimingData(wordTimings: WordTiming[], sentenceTimings: SentenceTiming[]) {
    if (wordTimings.length === 0) {
        return {
            averageSpeakingRate: 0,
            significantPauses: [],
            speechSegments: [],
            fastSections: [],
            slowSections: []
        };
    }

    // Calculate average speaking rate (words per second)
    const totalDuration = wordTimings[wordTimings.length - 1].end - wordTimings[0].start;
    const averageSpeakingRate = wordTimings.length / totalDuration;

    // Find significant pauses (>0.3 seconds between words)
    const significantPauses = [];
    for (let i = 0; i < wordTimings.length - 1; i++) {
        const pause = wordTimings[i + 1].start - wordTimings[i].end;
        if (pause > 0.3) {
            significantPauses.push({
                afterWord: wordTimings[i].punctuatedWord || wordTimings[i].word,
                duration: pause,
                position: i
            });
        }
    }

    // Identify speech segments (separated by significant pauses)
    const speechSegments = [];
    let segmentStart = 0;

    for (const pause of significantPauses) {
        if (pause.position > segmentStart) {
            const segment = wordTimings.slice(segmentStart, pause.position + 1);
            const segmentDuration = segment[segment.length - 1].end - segment[0].start;
            const segmentRate = segment.length / segmentDuration;

            speechSegments.push({
                startIndex: segmentStart,
                endIndex: pause.position,
                wordsCount: segment.length,
                duration: segmentDuration,
                speakingRate: segmentRate,
                text: segment.map(w => w.punctuatedWord || w.word).join(' ')
            });
        }
        segmentStart = pause.position + 1;
    }

    // Add final segment if there are remaining words
    if (segmentStart < wordTimings.length) {
        const segment = wordTimings.slice(segmentStart);
        const segmentDuration = segment[segment.length - 1].end - segment[0].start;
        const segmentRate = segment.length / segmentDuration;

        speechSegments.push({
            startIndex: segmentStart,
            endIndex: wordTimings.length - 1,
            wordsCount: segment.length,
            duration: segmentDuration,
            speakingRate: segmentRate,
            text: segment.map(w => w.punctuatedWord || w.word).join(' ')
        });
    }

    // Identify fast and slow sections (relative to average)
    const fastSections = speechSegments.filter(s => s.speakingRate > averageSpeakingRate * 1.2);
    const slowSections = speechSegments.filter(s => s.speakingRate < averageSpeakingRate * 0.8);

    return {
        averageSpeakingRate,
        significantPauses,
        speechSegments,
        fastSections,
        slowSections
    };
} 