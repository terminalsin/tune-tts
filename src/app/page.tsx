'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage: targetLanguage || undefined,
          voiceId: voiceId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.details || data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Text-to-Speech Pipeline
          </h1>
          <p className="text-lg text-gray-600">
            Convert text to SSML → Translate → Generate Voice
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by Inflection AI • OpenAI GPT-4 • Resemble AI
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Input Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter the text you want to convert to speech..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language (Optional)
                </label>
                <input
                  id="language"
                  type="text"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spanish, French, German..."
                />
              </div>

              <div>
                <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
                  Voice ID (Optional)
                </label>
                <input
                  id="voice"
                  type="text"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Resemble AI Voice ID"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Generate Speech'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-800 font-medium mb-4">Success!</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Processing Steps:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {result.steps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Generated SSML:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto text-gray-800">
                  {result.ssml}
                </pre>
              </div>

              {result.translatedSSML && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Translated SSML:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto text-gray-800">
                    {result.translatedSSML}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Voice Generation Result:</h4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {result.voiceResult.audioUrl ? (
                    <div>
                      <p className="text-green-600 mb-2">✓ Voice generated successfully!</p>
                      <audio controls className="w-full">
                        <source src={result.voiceResult.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : result.voiceResult.status === 'processing' ? (
                    <p className="text-yellow-600">⏳ Voice generation in progress...</p>
                  ) : (
                    <p className="text-gray-600">Voice generation status: {result.voiceResult.status}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Setup Instructions</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>To use this application, you need to set up the following environment variables:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-200 px-2 py-1 rounded">OPENAI_API_KEY</code> - Your OpenAI API key</li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">RESEMBLE_API_KEY</code> - Your Resemble AI API key</li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">RESEMBLE_PROJECT_ID</code> - Your Resemble AI project ID</li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">RESEMBLE_DEFAULT_VOICE_ID</code> - Default voice ID for Resemble AI</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
