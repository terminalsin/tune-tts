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

    const [transcribeAudioState, setTranscribeAudioState] = useState({
        audioFile: null as File | null,
        loading: false,
        result: null as ApiResponse | null,
    });

    const [timingAwareSSMLState, setTimingAwareSSMLState] = useState({
        transcript: 'Hello world, this is a test message for speech synthesis.',
        wordTimings: [],
        sentenceTimings: [],
        loading: false,
        result: null as ApiResponse | null,
    });

    const [processAudioState, setProcessAudioState] = useState({
        audioFile: null as File | null,
        targetLanguage: '',
        voiceId: '',
        loading: false,
        result: null as ApiResponse | null,
    });

    const [processVideoState, setProcessVideoState] = useState({
        videoFile: null as File | null,
        targetLanguage: '',
        voiceId: '',
        loading: false,
        result: null as { videoUrl?: string; error?: string; status?: number; metadata?: any } | null,
    });

    const [extractAudioState, setExtractAudioState] = useState({
        videoFile: null as File | null,
        loading: false,
        result: null as { audioUrl?: string; error?: string; status?: number; metadata?: any } | null,
    });

    const [injectAudioState, setInjectAudioState] = useState({
        videoFile: null as File | null,
        audioFile: null as File | null,
        loading: false,
        result: null as { videoUrl?: string; error?: string; status?: number; metadata?: any } | null,
    });

    const [downloadYouTubeState, setDownloadYouTubeState] = useState({
        url: '',
        loading: false,
        result: null as { videoUrl?: string; error?: string; status?: number; metadata?: any } | null,
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

    const testTranscribeAudio = async () => {
        setTranscribeAudioState(prev => ({ ...prev, loading: true, result: null }));

        try {
            if (!transcribeAudioState.audioFile) {
                throw new Error('No audio file selected');
            }

            const formData = new FormData();
            formData.append('audio', transcribeAudioState.audioFile);

            const response = await fetch('/api/transcribe-audio', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setTranscribeAudioState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));

            // Auto-populate timing-aware SSML test with results
            if (data.success) {
                setTimingAwareSSMLState(prev => ({
                    ...prev,
                    transcript: data.transcript,
                    wordTimings: data.wordTimings,
                    sentenceTimings: data.sentenceTimings
                }));
            }
        } catch (error) {
            setTranscribeAudioState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testTimingAwareSSML = async () => {
        setTimingAwareSSMLState(prev => ({ ...prev, loading: true, result: null }));

        try {
            const response = await fetch('/api/text-to-ssml-with-timing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: timingAwareSSMLState.transcript,
                    wordTimings: timingAwareSSMLState.wordTimings,
                    sentenceTimings: timingAwareSSMLState.sentenceTimings
                }),
            });

            const data = await response.json();
            setTimingAwareSSMLState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));
        } catch (error) {
            setTimingAwareSSMLState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testProcessAudio = async () => {
        setProcessAudioState(prev => ({ ...prev, loading: true, result: null }));

        try {
            if (!processAudioState.audioFile) {
                throw new Error('No audio file selected');
            }

            const formData = new FormData();
            formData.append('audio', processAudioState.audioFile);
            if (processAudioState.targetLanguage) formData.append('targetLanguage', processAudioState.targetLanguage);
            if (processAudioState.voiceId) formData.append('voiceId', processAudioState.voiceId);

            const response = await fetch('/api/process-audio', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setProcessAudioState(prev => ({
                ...prev,
                loading: false,
                result: { data, status: response.status, error: response.ok ? undefined : data.error }
            }));
        } catch (error) {
            setProcessAudioState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testProcessVideo = async () => {
        setProcessVideoState(prev => ({ ...prev, loading: true, result: null }));

        try {
            if (!processVideoState.videoFile) {
                throw new Error('No video file selected');
            }

            const formData = new FormData();
            formData.append('video', processVideoState.videoFile);
            if (processVideoState.targetLanguage) formData.append('targetLanguage', processVideoState.targetLanguage);
            if (processVideoState.voiceId) formData.append('voiceId', processVideoState.voiceId);

            const response = await fetch('/api/process-video', {
                method: 'POST',
                body: formData,
            });

            if (response.ok && response.headers.get('content-type')?.includes('video/mp4')) {
                // Handle video response
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);

                // Extract metadata from headers
                const metadata = {
                    processingSteps: JSON.parse(response.headers.get('X-Processing-Steps') || '[]'),
                    originalDuration: response.headers.get('X-Original-Duration'),
                    generatedAudioDuration: response.headers.get('X-Generated-Audio-Duration'),
                    processingSuccess: response.headers.get('X-Processing-Success'),
                    fileName: response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'processed-video.mp4'
                };

                setProcessVideoState(prev => ({
                    ...prev,
                    loading: false,
                    result: { videoUrl, status: response.status, metadata }
                }));
            } else {
                // Handle error response (should be JSON)
                const data = await response.json();
                setProcessVideoState(prev => ({
                    ...prev,
                    loading: false,
                    result: { error: data.error || 'Unknown error', status: response.status }
                }));
            }
        } catch (error) {
            setProcessVideoState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testExtractAudio = async () => {
        setExtractAudioState(prev => ({ ...prev, loading: true, result: null }));

        try {
            if (!extractAudioState.videoFile) {
                throw new Error('No video file selected');
            }

            const formData = new FormData();
            formData.append('video', extractAudioState.videoFile);

            const response = await fetch('/api/extract-audio', {
                method: 'POST',
                body: formData,
            });

            if (response.ok && response.headers.get('content-type')?.includes('audio/wav')) {
                // Handle audio response
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                // Extract metadata from headers
                const metadata = {
                    originalDuration: response.headers.get('X-Original-Duration'),
                    originalFilename: response.headers.get('X-Original-Filename'),
                    originalSize: response.headers.get('X-Original-Size'),
                    extractionSuccess: response.headers.get('X-Extraction-Success'),
                    fileName: response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'extracted-audio.wav'
                };

                setExtractAudioState(prev => ({
                    ...prev,
                    loading: false,
                    result: { audioUrl, status: response.status, metadata }
                }));
            } else {
                // Handle error response (should be JSON)
                const data = await response.json();
                setExtractAudioState(prev => ({
                    ...prev,
                    loading: false,
                    result: { error: data.error || 'Unknown error', status: response.status }
                }));
            }
        } catch (error) {
            setExtractAudioState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testInjectAudio = async () => {
        setInjectAudioState(prev => ({ ...prev, loading: true, result: null }));

        try {
            if (!injectAudioState.videoFile) {
                throw new Error('No video file selected');
            }

            if (!injectAudioState.audioFile) {
                throw new Error('No audio file selected');
            }

            const formData = new FormData();
            formData.append('video', injectAudioState.videoFile);
            formData.append('audio', injectAudioState.audioFile);

            const response = await fetch('/api/inject-audio', {
                method: 'POST',
                body: formData,
            });

            if (response.ok && response.headers.get('content-type')?.includes('video/mp4')) {
                // Handle video response
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);

                // Extract metadata from headers
                const metadata = {
                    processingSteps: JSON.parse(response.headers.get('X-Processing-Steps') || '[]'),
                    originalVideoDuration: response.headers.get('X-Original-Video-Duration'),
                    audioDuration: response.headers.get('X-Audio-Duration'),
                    durationExtended: response.headers.get('X-Duration-Extended'),
                    processingSuccess: response.headers.get('X-Processing-Success'),
                    fileName: response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'injected-video.mp4'
                };

                setInjectAudioState(prev => ({
                    ...prev,
                    loading: false,
                    result: { videoUrl, status: response.status, metadata }
                }));
            } else {
                // Handle error response (should be JSON)
                const data = await response.json();
                setInjectAudioState(prev => ({
                    ...prev,
                    loading: false,
                    result: { error: data.error || 'Unknown error', status: response.status }
                }));
            }
        } catch (error) {
            setInjectAudioState(prev => ({
                ...prev,
                loading: false,
                result: { error: error instanceof Error ? error.message : 'Unknown error' }
            }));
        }
    };

    const testDownloadYouTube = async () => {
        setDownloadYouTubeState(prev => ({ ...prev, loading: true, result: null }));

        try {
            if (!downloadYouTubeState.url) {
                throw new Error('YouTube URL is required');
            }

            const response = await fetch('/api/download-youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: downloadYouTubeState.url }),
            });

            if (response.ok && response.headers.get('content-type')?.includes('video/mp4')) {
                // Handle video response
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);

                // Extract metadata from headers
                const metadata = {
                    videoTitle: response.headers.get('X-Video-Title'),
                    videoDuration: response.headers.get('X-Video-Duration'),
                    videoAuthor: response.headers.get('X-Video-Author'),
                    videoViews: response.headers.get('X-Video-Views'),
                    videoId: response.headers.get('X-Video-ID'),
                    downloadSuccess: response.headers.get('X-Download-Success'),
                    fileName: response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'youtube-video.mp4'
                };

                setDownloadYouTubeState(prev => ({
                    ...prev,
                    loading: false,
                    result: { videoUrl, status: response.status, metadata }
                }));
            } else {
                // Handle error response (should be JSON)
                const data = await response.json();
                setDownloadYouTubeState(prev => ({
                    ...prev,
                    loading: false,
                    result: { error: data.error || 'Unknown error', status: response.status }
                }));
            }
        } catch (error) {
            setDownloadYouTubeState(prev => ({
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

    const renderVideoResult = (result: { videoUrl?: string; error?: string; status?: number; metadata?: any } | null) => {
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
                ) : result.videoUrl ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-blue-700 font-medium mb-3">Video Processed Successfully! 🎬</p>

                        {/* Processing metadata */}
                        {result.metadata && (
                            <div className="mb-4 p-3 bg-blue-100 rounded">
                                <h5 className="font-medium text-blue-800 mb-2">Processing Info:</h5>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p><strong>Original Duration:</strong> {result.metadata.originalDuration}s</p>
                                    <p><strong>Generated Audio Duration:</strong> {result.metadata.generatedAudioDuration}s</p>
                                    <p><strong>Output File:</strong> {result.metadata.fileName}</p>
                                </div>

                                {result.metadata.processingSteps && (
                                    <div className="mt-3">
                                        <h6 className="font-medium text-blue-800 mb-1">Processing Steps:</h6>
                                        <ul className="text-xs text-blue-600 space-y-1">
                                            {result.metadata.processingSteps.map((step: string, index: number) => (
                                                <li key={index}>• {step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video player */}
                        <div className="space-y-3">
                            <video controls className="w-full max-w-lg mx-auto rounded-lg shadow-sm">
                                <source src={result.videoUrl} type="video/mp4" />
                                Your browser does not support the video element.
                            </video>

                            <div className="flex justify-center">
                                <a
                                    href={result.videoUrl}
                                    download={result.metadata?.fileName || "processed-video.mp4"}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    📥 Download Processed Video
                                </a>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    const renderExtractAudioResult = (result: { audioUrl?: string; error?: string; status?: number; metadata?: any } | null) => {
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
                        <p className="text-green-700 font-medium mb-3">Audio Extracted Successfully! 🎵</p>

                        {/* Extraction metadata */}
                        {result.metadata && (
                            <div className="mb-4 p-3 bg-green-100 rounded">
                                <h5 className="font-medium text-green-800 mb-2">Extraction Info:</h5>
                                <div className="text-sm text-green-700 space-y-1">
                                    <p><strong>Original Video:</strong> {result.metadata.originalFilename}</p>
                                    <p><strong>Duration:</strong> {result.metadata.originalDuration}s</p>
                                    <p><strong>Original Size:</strong> {(parseInt(result.metadata.originalSize) / 1024 / 1024).toFixed(2)} MB</p>
                                    <p><strong>Output File:</strong> {result.metadata.fileName}</p>
                                </div>
                            </div>
                        )}

                        {/* Audio player */}
                        <div className="space-y-3">
                            <audio controls className="w-full">
                                <source src={result.audioUrl} type="audio/wav" />
                                Your browser does not support the audio element.
                            </audio>

                            <div className="flex justify-center">
                                <a
                                    href={result.audioUrl}
                                    download={result.metadata?.fileName || "extracted-audio.wav"}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    📥 Download Extracted Audio
                                </a>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    const renderInjectAudioResult = (result: { videoUrl?: string; error?: string; status?: number; metadata?: any } | null) => {
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
                ) : result.videoUrl ? (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <p className="text-purple-700 font-medium mb-3">Audio Injected Successfully! 🎬🎵</p>

                        {/* Injection metadata */}
                        {result.metadata && (
                            <div className="mb-4 p-3 bg-purple-100 rounded">
                                <h5 className="font-medium text-purple-800 mb-2">Injection Info:</h5>
                                <div className="text-sm text-purple-700 space-y-1">
                                    <p><strong>Original Video Duration:</strong> {result.metadata.originalVideoDuration}s</p>
                                    <p><strong>Audio Duration:</strong> {result.metadata.audioDuration}s</p>
                                    <p><strong>Duration Extended:</strong> {result.metadata.durationExtended === 'true' ? 'Yes' : 'No'}</p>
                                    <p><strong>Output File:</strong> {result.metadata.fileName}</p>
                                </div>

                                {result.metadata.processingSteps && (
                                    <div className="mt-3">
                                        <h6 className="font-medium text-purple-800 mb-1">Processing Steps:</h6>
                                        <ul className="text-xs text-purple-600 space-y-1">
                                            {result.metadata.processingSteps.map((step: string, index: number) => (
                                                <li key={index}>• {step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video player */}
                        <div className="space-y-3">
                            <video controls className="w-full max-w-lg mx-auto rounded-lg shadow-sm">
                                <source src={result.videoUrl} type="video/mp4" />
                                Your browser does not support the video element.
                            </video>

                            <div className="flex justify-center">
                                <a
                                    href={result.videoUrl}
                                    download={result.metadata?.fileName || "injected-video.mp4"}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    📥 Download Injected Video
                                </a>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    const renderYouTubeDownloadResult = (result: { videoUrl?: string; error?: string; status?: number; metadata?: any } | null) => {
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
                ) : result.videoUrl ? (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-700 font-medium mb-3">YouTube Video Downloaded Successfully! 📺</p>

                        {/* YouTube metadata */}
                        {result.metadata && (
                            <div className="mb-4 p-3 bg-red-100 rounded">
                                <h5 className="font-medium text-red-800 mb-2">Video Info:</h5>
                                <div className="text-sm text-red-700 space-y-1">
                                    <p><strong>Title:</strong> {result.metadata.videoTitle}</p>
                                    <p><strong>Author:</strong> {result.metadata.videoAuthor}</p>
                                    <p><strong>Duration:</strong> {result.metadata.videoDuration}s ({Math.floor(parseInt(result.metadata.videoDuration) / 60)}:{(parseInt(result.metadata.videoDuration) % 60).toString().padStart(2, '0')})</p>
                                    <p><strong>Views:</strong> {parseInt(result.metadata.videoViews).toLocaleString()}</p>
                                    <p><strong>Video ID:</strong> {result.metadata.videoId}</p>
                                    <p><strong>Output File:</strong> {result.metadata.fileName}</p>
                                </div>
                            </div>
                        )}

                        {/* Video player */}
                        <div className="space-y-3">
                            <video controls className="w-full max-w-lg mx-auto rounded-lg shadow-sm">
                                <source src={result.videoUrl} type="video/mp4" />
                                Your browser does not support the video element.
                            </video>

                            <div className="flex justify-center">
                                <a
                                    href={result.videoUrl}
                                    download={result.metadata?.fileName || "youtube-video.mp4"}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    📥 Download YouTube Video
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

                    {/* Transcribe Audio */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-indigo-600">5. Transcribe Audio</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/transcribe-audio</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setTranscribeAudioState(prev => ({ ...prev, audioFile: e.target.files?.[0] || null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                {transcribeAudioState.audioFile && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Selected: {transcribeAudioState.audioFile.name} ({(transcribeAudioState.audioFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={testTranscribeAudio}
                                disabled={transcribeAudioState.loading || !transcribeAudioState.audioFile}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {transcribeAudioState.loading ? 'Transcribing...' : 'Test Audio Transcription'}
                            </button>
                        </div>

                        {renderResult(transcribeAudioState.result)}
                    </div>

                    {/* Timing-Aware SSML */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-pink-600">6. Timing-Aware SSML</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/text-to-ssml-with-timing</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transcript</label>
                                <textarea
                                    value={timingAwareSSMLState.transcript}
                                    onChange={(e) => setTimingAwareSSMLState(prev => ({ ...prev, transcript: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Word Timings</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    {timingAwareSSMLState.wordTimings.length} words with timing data
                                    {timingAwareSSMLState.wordTimings.length === 0 && ' (use transcribe audio first)'}
                                </p>
                            </div>

                            <button
                                onClick={testTimingAwareSSML}
                                disabled={timingAwareSSMLState.loading}
                                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50"
                            >
                                {timingAwareSSMLState.loading ? 'Generating...' : 'Test Timing-Aware SSML'}
                            </button>
                        </div>

                        {renderResult(timingAwareSSMLState.result)}
                    </div>

                    {/* Process Audio (Full Pipeline) */}
                    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">7. Process Audio (Full Pipeline)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/process-audio</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setProcessAudioState(prev => ({ ...prev, audioFile: e.target.files?.[0] || null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                {processAudioState.audioFile && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {processAudioState.audioFile.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language (Optional)</label>
                                <input
                                    type="text"
                                    value={processAudioState.targetLanguage}
                                    onChange={(e) => setProcessAudioState(prev => ({ ...prev, targetLanguage: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="e.g., Spanish"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Voice ID (Optional)</label>
                                <input
                                    type="text"
                                    value={processAudioState.voiceId}
                                    onChange={(e) => setProcessAudioState(prev => ({ ...prev, voiceId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Resemble AI Voice ID"
                                />
                            </div>
                        </div>

                        <button
                            onClick={testProcessAudio}
                            disabled={processAudioState.loading || !processAudioState.audioFile}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {processAudioState.loading ? 'Processing...' : 'Test Full Audio Pipeline'}
                        </button>

                        {renderResult(processAudioState.result)}
                    </div>

                    {/* Process Video (NEW) */}
                    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-blue-600">8. Process Video (NEW! 🎬)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/process-video</p>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                            <p className="text-sm text-blue-700">
                                <strong>🎯 What this does:</strong> Extracts audio from your video, converts it to natural speech using AI,
                                and combines it back with the original video. Supports translation and smart duration handling!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                                <input
                                    type="file"
                                    accept="video/mp4,video/quicktime,video/x-msvideo"
                                    onChange={(e) => setProcessVideoState(prev => ({ ...prev, videoFile: e.target.files?.[0] || null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {processVideoState.videoFile && (
                                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                                        <p><strong>File:</strong> {processVideoState.videoFile.name}</p>
                                        <p><strong>Size:</strong> {(processVideoState.videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <p><strong>Type:</strong> {processVideoState.videoFile.type}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language (Optional)</label>
                                <input
                                    type="text"
                                    value={processVideoState.targetLanguage}
                                    onChange={(e) => setProcessVideoState(prev => ({ ...prev, targetLanguage: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Spanish, French, German"
                                />
                                <p className="mt-1 text-xs text-gray-500">Leave empty for English-only processing</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Voice ID (Optional)</label>
                                <input
                                    type="text"
                                    value={processVideoState.voiceId}
                                    onChange={(e) => setProcessVideoState(prev => ({ ...prev, voiceId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Resemble AI Voice ID"
                                />
                                <p className="mt-1 text-xs text-gray-500">Uses default voice if not specified</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                            <p className="text-xs text-yellow-700">
                                <strong>⚠️ Note:</strong> Video processing can take 2-5x the video duration.
                                Large files may require longer processing time. The endpoint will automatically extend the video
                                if the generated audio is longer than the original video.
                            </p>
                        </div>

                        <button
                            onClick={testProcessVideo}
                            disabled={processVideoState.loading || !processVideoState.videoFile}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                        >
                            {processVideoState.loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Video...
                                </span>
                            ) : 'Process Video 🎬'}
                        </button>

                        {renderVideoResult(processVideoState.result)}
                    </div>

                    {/* Download YouTube Video */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">9. Download YouTube Video (NEW! 📺)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/download-youtube</p>
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                            <p className="text-sm text-red-700">
                                <strong>🎯 What this does:</strong> Downloads any public YouTube video as an MP4 file.
                                Perfect for getting videos to process through the TTS pipeline!
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                                <input
                                    type="url"
                                    value={downloadYouTubeState.url}
                                    onChange={(e) => setDownloadYouTubeState(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                                {downloadYouTubeState.url && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        URL: {downloadYouTubeState.url.substring(0, 60)}{downloadYouTubeState.url.length > 60 ? '...' : ''}
                                    </p>
                                )}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-xs text-yellow-700">
                                    <strong>⚠️ Limits:</strong> Videos are limited to 10 minutes maximum for processing efficiency.
                                    Only public videos are supported (no private, age-restricted, or unavailable videos).
                                </p>
                            </div>

                            <button
                                onClick={testDownloadYouTube}
                                disabled={downloadYouTubeState.loading || !downloadYouTubeState.url}
                                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                                {downloadYouTubeState.loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Downloading Video...
                                    </span>
                                ) : 'Download YouTube Video 📺'}
                            </button>
                        </div>

                        {renderYouTubeDownloadResult(downloadYouTubeState.result)}
                    </div>

                    {/* Extract Audio */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-green-600">10. Extract Audio (NEW! 🎵)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/extract-audio</p>
                        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                            <p className="text-sm text-green-700">
                                <strong>🎯 What this does:</strong> Extracts high-quality audio from video files using FFmpeg.
                                Perfect for getting clean audio tracks from videos.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                                <input
                                    type="file"
                                    accept="video/mp4,video/quicktime,video/x-msvideo"
                                    onChange={(e) => setExtractAudioState(prev => ({ ...prev, videoFile: e.target.files?.[0] || null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {extractAudioState.videoFile && (
                                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                                        <p><strong>File:</strong> {extractAudioState.videoFile.name}</p>
                                        <p><strong>Size:</strong> {(extractAudioState.videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <p><strong>Type:</strong> {extractAudioState.videoFile.type}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={testExtractAudio}
                                disabled={extractAudioState.loading || !extractAudioState.videoFile}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                            >
                                {extractAudioState.loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Extracting Audio...
                                    </span>
                                ) : 'Extract Audio 🎵'}
                            </button>
                        </div>

                        {renderExtractAudioResult(extractAudioState.result)}
                    </div>

                    {/* Inject Audio */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-purple-600">11. Inject Audio (NEW! 🎬🎵)</h2>
                        <p className="text-sm text-gray-600 mb-4">POST /api/inject-audio</p>
                        <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                            <p className="text-sm text-purple-700">
                                <strong>🎯 What this does:</strong> Combines a video file with a new audio track.
                                Automatically handles duration mismatches by extending the video if needed.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                                    <input
                                        type="file"
                                        accept="video/mp4,video/quicktime,video/x-msvideo"
                                        onChange={(e) => setInjectAudioState(prev => ({ ...prev, videoFile: e.target.files?.[0] || null }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {injectAudioState.videoFile && (
                                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                                            <p><strong>File:</strong> {injectAudioState.videoFile.name}</p>
                                            <p><strong>Size:</strong> {(injectAudioState.videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setInjectAudioState(prev => ({ ...prev, audioFile: e.target.files?.[0] || null }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {injectAudioState.audioFile && (
                                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                                            <p><strong>File:</strong> {injectAudioState.audioFile.name}</p>
                                            <p><strong>Size:</strong> {(injectAudioState.audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-xs text-yellow-700">
                                    <strong>💡 Tip:</strong> Use the Extract Audio feature above to get audio from a video,
                                    then process it through the audio pipeline, and finally inject it back using this feature!
                                </p>
                            </div>

                            <button
                                onClick={testInjectAudio}
                                disabled={injectAudioState.loading || !injectAudioState.videoFile || !injectAudioState.audioFile}
                                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                            >
                                {injectAudioState.loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Injecting Audio...
                                    </span>
                                ) : 'Inject Audio 🎬🎵'}
                            </button>
                        </div>

                        {renderInjectAudioResult(injectAudioState.result)}
                    </div>

                    {/* Process Text (Full Pipeline) */}
                    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-gray-600">12. Process Text (Legacy Pipeline)</h2>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-2">Deepgram (for speech-to-text)</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">DEEPGRAM_API_KEY</code></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-2">OpenAI (for SSML & translation)</h4>
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
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-2">Dependencies (auto-installed)</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">ytdl-core</code> - YouTube downloads</li>
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">ffmpeg-static</code> - Video processing</li>
                                <li>• <code className="bg-yellow-100 px-2 py-1 rounded">fluent-ffmpeg</code> - FFmpeg wrapper</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 