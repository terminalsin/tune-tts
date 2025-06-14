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

  const popularLanguages = [
    'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Japanese', 'Korean', 'Mandarin', 'Hindi', 'Arabic'
  ];

  const sampleTexts = [
    "Welcome to our platform! We're excited to have you here.",
    "This revolutionary technology will change how we communicate across languages.",
    "In a world where borders are dissolving, language should never be a barrier."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Tune
                </h1>
                <p className="text-sm text-gray-500">AI Dubbing Platform</p>
              </div>
            </div>
            <a
              href="/debug"
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              🔧 Debug Console
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            🚀 Powered by Advanced AI Technology
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dub Your Content<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Into Any Language
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your content with AI-powered dubbing. From script to speech in seconds,
            with natural intonation and emotion preservation across languages.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Inflection AI SSML
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              OpenAI Translation
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Resemble AI Voice
            </span>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Input Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create Your Dub</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-3">
                    Script Content
                  </label>
                  <div className="relative">
                    <textarea
                      id="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                      rows={6}
                      placeholder="Enter your script or dialogue here..."
                      required
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {text.length}/10,000
                    </div>
                  </div>

                  {/* Sample Text Suggestions */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Try these samples:</p>
                    <div className="flex flex-wrap gap-2">
                      {sampleTexts.map((sample, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setText(sample)}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                        >
                          Sample {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-3">
                      Target Language
                    </label>
                    <div className="relative">
                      <input
                        id="language"
                        type="text"
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., Spanish, French..."
                        list="languages"
                      />
                      <datalist id="languages">
                        {popularLanguages.map((lang) => (
                          <option key={lang} value={lang} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-3">
                      Voice ID <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      id="voice"
                      type="text"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Custom voice ID"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>🎭</span>
                      Generate Dub
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Popular Languages */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Popular Languages</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setTargetLanguage(lang)}
                    className="text-left px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm">⚠️</span>
                  </div>
                  <h3 className="text-red-800 font-semibold">Processing Error</h3>
                </div>
                <p className="text-red-700 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">✨</span>
                  </div>
                  <div>
                    <h3 className="text-green-800 font-semibold text-lg">Dub Generated Successfully!</h3>
                    <p className="text-green-600 text-sm">Your content has been transformed</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Processing Pipeline */}
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Processing Pipeline
                    </h4>
                    <div className="space-y-2">
                      {result.steps.map((step: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <span className="text-gray-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audio Player */}
                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Generated Audio
                    </h4>
                    {result.voiceResult.audioUrl ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
                          <audio controls className="w-full mb-3">
                            <source src={result.voiceResult.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>🎵 High-quality AI voice</span>
                            <span>📥 Ready to download</span>
                          </div>
                        </div>
                        <a
                          href={result.voiceResult.audioUrl}
                          download="tune-dub.wav"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                        >
                          <span>⬇️</span>
                          Download Audio
                        </a>
                      </div>
                    ) : result.voiceResult.status === 'processing' ? (
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-yellow-700">Audio generation in progress...</span>
                      </div>
                    ) : (
                      <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">
                        Status: {result.voiceResult.status}
                      </p>
                    )}
                  </div>

                  {/* Technical Details */}
                  <details className="bg-white rounded-xl p-4">
                    <summary className="font-medium text-gray-900 cursor-pointer mb-3">
                      Technical Details
                    </summary>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Generated SSML:</h5>
                        <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto text-gray-600 border">
                          {result.ssml}
                        </pre>
                      </div>
                      {result.translatedSSML && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Translated SSML:</h5>
                          <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto text-gray-600 border">
                            {result.translatedSSML}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Getting Started */}
            {!result && !error && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Script Analysis</h4>
                      <p className="text-gray-600 text-sm">AI analyzes your text and converts it to SSML with natural intonation markers</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Language Translation</h4>
                      <p className="text-gray-600 text-sm">Content is translated while preserving emotional context and speaking patterns</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Voice Generation</h4>
                      <p className="text-gray-600 text-sm">High-quality voice synthesis creates natural-sounding speech in your target language</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Setup</h3>
            <p className="text-gray-600 mb-4">To use Tune, configure these environment variables:</p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🤖 AI Services</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-white px-2 py-1 rounded border">OPENAI_API_KEY</code></li>
                  <li><code className="bg-white px-2 py-1 rounded border">RESEMBLE_TOKEN</code></li>
                  <li><code className="bg-white px-2 py-1 rounded border">RESEMBLE_ENDPOINT</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🎵 Voice Configuration</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-white px-2 py-1 rounded border">RESEMBLE_PROJECT_ID</code></li>
                  <li><code className="bg-white px-2 py-1 rounded border">RESEMBLE_VOICE_ID</code></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
