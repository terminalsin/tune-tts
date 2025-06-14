'use client';

import { useState } from 'react';

interface ApiResponse {
    data?: any;
    error?: string;
    status?: number;
}

interface AudioResponse {
    audioUrl?: string;
    error?: string;
    status?: number;
}

export default function DebugPage() {
    // State for each API endpoint
    const [textToSsmlState, setTextToSsmlState] = useState({
        text: 'Hello world, this is a test message for speech synthesis.',
        loading: false,
        result: null as ApiResponse | null,
    });

    const [translateSsmlState, setTranslateSsmlState] = useState({
        ssml: '<speak>Hello world, this is a test message for speech synthesis.</speak>',
        targetLanguage: 'Spanish',
        loading: false,
        result: null as ApiResponse | null,
    });

    const [generateVoiceState, setGenerateVoiceState] = useState({
        ssml: '<speak>Hello world, this is a test message for speech synthesis.</speak>',
        loading: false,
        result: null as AudioResponse | null,
    });

    const [checkClipState, setCheckClipState] = useState({
        clipId: '',
        loading: false,
        result: null as ApiResponse | null,
    });

    const [processTextState, setProcessTextState] = useState({
        text: 'Hello world, this is a test message for speech synthesis.',
        targetLanguage: '',
        voiceId: '',
        loading: false,
        result: null as ApiResponse | null,
    });

    // API call functions
    const testTextToSsml = async () => {
        setTextToSsmlState(prev => ({ ...prev, loading: true, result: null }));

        try {
            const response = await fetch('/api/text-to-ssml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSsmlState.text }),
            });

            const data = await response.json();
            setTextToSsmlState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));
        } catch (error) {
            setTextToSsmlState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testTranslateSsml = async () => {
        setTranslateSsmlState(prev => ({ ...prev, loading: true, result: null }));

        try {
            const response = await fetch('/api/translate-ssml', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ssml: translateSsmlState.ssml,
                    targetLanguage: translateSsmlState.targetLanguage
                }),
            });

            const data = await response.json();
            setTranslateSsmlState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));
        } catch (error) {
            setTranslateSsmlState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testGenerateVoice = async () => {
        setGenerateVoiceState(prev => ({ ...prev, loading: true, result: null }));

        try {
            const response = await fetch('/api/generate-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ssml: generateVoiceState.ssml,
                }),
            });

            if (response.ok && response.headers.get('content-type')?.includes('audio/wav')) {
                // Handle streaming audio response
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                setGenerateVoiceState(prev => ({
                    ...prev,
                    loading: false,
                    result: { audioUrl, status: response.status }
                }));
            } else {
                // Handle error response (should be JSON)
                const data = await response.json();
                setGenerateVoiceState(prev => ({
                    ...prev,
                    loading: false,
                    result: { error: data.error || 'Unknown error', status: response.status }
                }));
            }
        } catch (error) {
            setGenerateVoiceState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testCheckClip = async () => {
        setCheckClipState(prev => ({ ...prev, loading: true, result: null }));

        try {
            const response = await fetch(`/api/check-clip-status?clipId=${encodeURIComponent(checkClipState.clipId)}`);

            const data = await response.json();
            setCheckClipState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));
        } catch (error) {
            setCheckClipState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testProcessText = async () => {
        setProcessTextState(prev => ({ ...prev, loading: true, result: null }));

        try {
            const response = await fetch('/api/process-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: processTextState.text,
                    targetLanguage: processTextState.targetLanguage || undefined,
                    voiceId: processTextState.voiceId || undefined
                }),
            });

            const data = await response.json();
            setProcessTextState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));
        } catch (error) {
            setProcessTextState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const renderResult = (result: ApiResponse | null) => {
        if (!result) return null;

        return (
            <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Response</h4>
                    {result.status && (
                        <span className={`px-2 py-1 rounded text-sm font-medium ${result.status >= 200 && result.status < 300
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {result.status}
                        </span>
                    )}
                </div>

                {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-700 font-medium">Error:</p>
                        <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                ) : (
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(result.data, null, 2)}
                    </pre>
                )}
            </div>
        );
    };

    const renderAudioResult = (result: AudioResponse | null) => {
        if (!result) return null;

        return (
            <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Response</h4>
                    {result.status && (
                        <span className={`px-2 py-1 rounded text-sm font-medium ${result.status >= 200 && result.status < 300
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {result.status}
                        </span>
                    )}
                </div>

                {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-700 font-medium">Error:</p>
                        <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                ) : result.audioUrl ? (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-700 font-medium mb-3">Audio Generated Successfully!</p>
                        <div className="space-y-3">
                            <audio controls className="w-full">
                                <source src={result.audioUrl} type="audio/wav" />
                                Your browser does not support the audio element.
                            </audio>
                            <div className="flex space-x-2">
                                <a
                                    href={result.audioUrl}
                                    download="generated-voice.wav"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Download Audio
                                </a>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">API Debug Console</h1>
                    <p className="text-gray-600">Test each API endpoint individually</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Text to SSML */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-blue-600">1. Text to SSML</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/text-to-ssml</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                                <textarea
                                    value={textToSsmlState.text}
                                    onChange={(e) => setTextToSsmlState(prev => ({ ...prev, text: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={testTextToSsml}
                                disabled={textToSsmlState.loading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {textToSsmlState.loading ? 'Testing...' : 'Test Text to SSML'}
                            </button>
                        </div>

                        {renderResult(textToSsmlState.result)}
                    </div>

                    {/* Translate SSML */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-green-600">2. Translate SSML</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/translate-ssml</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SSML</label>
                                <textarea
                                    value={translateSsmlState.ssml}
                                    onChange={(e) => setTranslateSsmlState(prev => ({ ...prev, ssml: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                                <input
                                    type="text"
                                    value={translateSsmlState.targetLanguage}
                                    onChange={(e) => setTranslateSsmlState(prev => ({ ...prev, targetLanguage: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., Spanish"
                                />
                            </div>

                            <button
                                onClick={testTranslateSsml}
                                disabled={translateSsmlState.loading}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {translateSsmlState.loading ? 'Testing...' : 'Test Translate SSML'}
                            </button>
                        </div>

                        {renderResult(translateSsmlState.result)}
                    </div>

                    {/* Generate Voice */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-purple-600">3. Generate Voice (Streaming)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/generate-voice</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SSML</label>
                                <textarea
                                    value={generateVoiceState.ssml}
                                    onChange={(e) => setGenerateVoiceState(prev => ({ ...prev, ssml: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={testGenerateVoice}
                                disabled={generateVoiceState.loading}
                                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                            >
                                {generateVoiceState.loading ? 'Generating Audio...' : 'Test Generate Voice'}
                            </button>
                        </div>

                        {renderAudioResult(generateVoiceState.result)}
                    </div>

                    {/* Check Clip Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-orange-600">4. Check Clip Status</h2>
                        <p className="text-sm text-gray-600 mb-4">GET /api/check-clip-status</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Clip ID</label>
                                <input
                                    type="text"
                                    value={checkClipState.clipId}
                                    onChange={(e) => setCheckClipState(prev => ({ ...prev, clipId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter clip ID"
                                />
                            </div>

                            <button
                                onClick={testCheckClip}
                                disabled={checkClipState.loading || !checkClipState.clipId}
                                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                                {checkClipState.loading ? 'Testing...' : 'Test Check Clip Status'}
                            </button>
                        </div>

                        {renderResult(checkClipState.result)}
                    </div>

                    {/* Process Text (Full Pipeline) */}
                    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">5. Process Text (Full Pipeline)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/process-text</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                                <textarea
                                    value={processTextState.text}
                                    onChange={(e) => setProcessTextState(prev => ({ ...prev, text: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language (Optional)</label>
                                <input
                                    type="text"
                                    value={processTextState.targetLanguage}
                                    onChange={(e) => setProcessTextState(prev => ({ ...prev, targetLanguage: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="e.g., Spanish"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Voice ID (Optional)</label>
                                <input
                                    type="text"
                                    value={processTextState.voiceId}
                                    onChange={(e) => setProcessTextState(prev => ({ ...prev, voiceId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Resemble AI Voice ID"
                                />
                            </div>
                        </div>

                        <button
                            onClick={testProcessText}
                            disabled={processTextState.loading}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {processTextState.loading ? 'Testing...' : 'Test Full Pipeline'}
                        </button>

                        {renderResult(processTextState.result)}
                    </div>
                </div>

                {/* Environment Variables Check */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">Environment Variables</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                        Make sure you have the following environment variables configured:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-2">OpenAI (for translation)</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">OPENAI_API_KEY</code></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-2">Resemble AI (for voice generation)</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">RESEMBLE_ENDPOINT</code></li>
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">RESEMBLE_TOKEN</code></li>
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">RESEMBLE_PROJECT_ID</code></li>
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">RESEMBLE_VOICE_ID</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 