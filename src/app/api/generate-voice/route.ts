import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { ssml, voiceId } = await request.json();

        if (!ssml) {
            return NextResponse.json(
                { error: 'SSML text is required' },
                { status: 400 }
            );
        }

        const resembleApiKey = process.env.RESEMBLE_API_KEY;
        const resembleProjectId = process.env.RESEMBLE_PROJECT_ID;

        if (!resembleApiKey || !resembleProjectId) {
            return NextResponse.json(
                { error: 'Resemble AI API credentials not configured' },
                { status: 500 }
            );
        }

        // Resemble AI API call to generate voice
        const response = await fetch('https://app.resemble.ai/api/v2/clips', {
            method: 'POST',
            headers: {
                'Authorization': `Token token="${resembleApiKey}"`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    body: ssml,
                    voice_uuid: voiceId || process.env.RESEMBLE_DEFAULT_VOICE_ID,
                    is_public: false,
                    is_archived: false,
                    project_uuid: resembleProjectId,
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Resemble AI API error:', errorData);
            throw new Error(`Resemble AI API error: ${response.status}`);
        }

        const result = await response.json();

        // Poll for completion if needed
        if (result.item && result.item.uuid) {
            const clipId = result.item.uuid;

            // Poll for the clip to be ready
            let clipReady = false;
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 30 seconds

            while (!clipReady && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

                const statusResponse = await fetch(`https://app.resemble.ai/api/v2/clips/${clipId}`, {
                    headers: {
                        'Authorization': `Token token="${resembleApiKey}"`,
                    },
                });

                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    if (statusData.item && statusData.item.audio_src) {
                        return NextResponse.json({
                            audioUrl: statusData.item.audio_src,
                            clipId: clipId,
                            status: 'completed'
                        });
                    }
                }

                attempts++;
            }

            // If we reach here, the clip is still processing
            return NextResponse.json({
                clipId: clipId,
                status: 'processing',
                message: 'Voice generation in progress. Please check back later.'
            });
        }

        return NextResponse.json({
            error: 'Unexpected response from Resemble AI'
        }, { status: 500 });

    } catch (error) {
        console.error('Error generating voice:', error);
        return NextResponse.json(
            { error: 'Failed to generate voice' },
            { status: 500 }
        );
    }
} 