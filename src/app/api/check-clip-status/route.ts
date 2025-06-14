import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clipId = searchParams.get('clipId');

        if (!clipId) {
            return NextResponse.json({ error: 'Clip ID is required' }, { status: 400 });
        }

        const resembleApiKey = process.env.RESEMBLE_API_KEY;

        if (!resembleApiKey) {
            return NextResponse.json(
                { error: 'Resemble AI API key not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(`https://app.resemble.ai/api/v2/clips/${clipId}`, {
            headers: {
                'Authorization': `Token token="${resembleApiKey}"`,
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Resemble AI API error:', errorData);
            return NextResponse.json(
                { error: `Failed to fetch clip status: ${response.status}` },
                { status: response.status }
            );
        }

        const result = await response.json();

        if (result.item) {
            return NextResponse.json({
                clipId: clipId,
                status: result.item.audio_src ? 'completed' : 'processing',
                audioUrl: result.item.audio_src || null,
                created_at: result.item.created_at,
                updated_at: result.item.updated_at,
            });
        }

        return NextResponse.json({
            error: 'Clip not found or invalid response format'
        }, { status: 404 });

    } catch (error) {
        console.error('Error checking clip status:', error);
        return NextResponse.json(
            { error: 'Failed to check clip status' },
            { status: 500 }
        );
    }
} 