# Text-to-Speech Pipeline

A comprehensive text-to-speech system that converts text to SSML, translates it to different languages, and generates high-quality voice output.

## 🚀 Features

- **Audio Processing**: Upload audio files and extract text with precise timing information using Deepgram
- **Timing-Aware SSML**: Generate SSML with natural pacing and prosody based on original audio timing
- **Text to SSML Conversion**: Uses Inflection AI to intelligently annotate text with SSML markup for better speech synthesis
- **Language Translation**: Translates SSML-annotated text while preserving markup using OpenAI GPT-4o
- **Voice Generation**: Generates high-quality speech using Resemble AI's voice synthesis
- **Web Interface**: Beautiful, responsive web interface for testing and using the system
- **API Endpoints**: RESTful API endpoints for integration with other applications

## 🏗️ Architecture

The system supports two main processing pipelines:

### Audio Processing Pipeline
1. **Audio → Text + Timing** (Deepgram): Extract transcript with precise word-level timing information
2. **Timing-Aware SSML Generation** (OpenAI GPT-4o): Create SSML with natural pacing based on original speech patterns
3. **SSML Translation** (OpenAI GPT-4o): Translate while preserving timing structure and markup
4. **Voice Generation** (Resemble AI): Synthesize speech that maintains original timing and emotion

### Text Processing Pipeline (Legacy)
1. **Text → SSML** (Inflection AI): Convert plain text into SSML markup with appropriate prosody
2. **SSML Translation** (OpenAI GPT-4o): Translate SSML content while preserving markup
3. **Voice Generation** (Resemble AI): Synthesize speech from SSML markup

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for the required services

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Deepgram API Key (for speech-to-text)
# Get from: https://console.deepgram.com/
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# OpenAI API Key (for SSML generation and translation)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Resemble AI API Keys (for voice synthesis)
# Get from: https://app.resemble.ai/
RESEMBLE_TOKEN=your_resemble_token_here
RESEMBLE_ENDPOINT=your_resemble_endpoint_here
RESEMBLE_PROJECT_ID=your_resemble_project_id_here
RESEMBLE_VOICE_ID=your_resemble_voice_id_here

# Optional: For production deployment
VERCEL_URL=your_vercel_url_here
PORT=3000
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tune-tts
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 API Usage

### Audio Processing Pipeline

**POST** `/api/process-audio`

Process audio files through the complete pipeline.

**Request Body (multipart/form-data):**
```
audio: [File] (required) - Audio file (WAV, MP3, MP4, OGG, WebM)
targetLanguage: [String] (optional) - Target language for translation
voiceId: [String] (optional) - Custom Resemble AI voice ID
```

**Response:**
```json
{
  "success": true,
  "originalFilename": "audio.wav",
  "transcription": {
    "transcript": "Hello world! This is a test.",
    "wordCount": 6,
    "duration": 2.5,
    "confidence": 0.98
  },
  "ssml": "<speak><lang xml:lang=\"en-us\">Hello world! <break time=\"0.5s\"/> This is a test.</lang></speak>",
  "translatedSSML": null,
  "voiceResult": {
    "audioUrl": "data:audio/wav;base64,..."
  },
  "timingAnalysis": {
    "averageSpeakingRate": 2.4,
    "significantPauses": 1,
    "speechSegments": 2
  },
  "steps": [...]
}
```

### Text Processing Pipeline (Legacy)

**POST** `/api/process-text`

Process text through the complete pipeline.

**Request Body:**
```json
{
  "text": "Hello world! This is a test.",
  "targetLanguage": "Spanish", // Optional
  "voiceId": "your-voice-id"   // Optional
}
```

**Response:**
```json
{
  "success": true,
  "originalText": "Hello world! This is a test.",
  "ssml": "<speak>Hello world! <break time=\"0.5s\"/> This is a test.</speak>",
  "translatedSSML": "<speak>¡Hola mundo! <break time=\"0.5s\"/> Esta es una prueba.</speak>",
  "targetLanguage": "Spanish",
  "voiceResult": {
    "audioUrl": "https://...",
    "clipId": "...",
    "status": "completed"
  },
  "steps": [
    "Text converted to SSML using Inflection AI",
    "SSML translated to Spanish using OpenAI GPT-4",
    "Voice generated using Resemble AI"
  ]
}
```

### Individual Service Endpoints

#### 1. Audio Transcription
**POST** `/api/transcribe-audio`

Upload an audio file and get transcription with timing information.

```
Content-Type: multipart/form-data
audio: [File] - Audio file to transcribe
```

#### 2. Timing-Aware SSML Generation
**POST** `/api/text-to-ssml-with-timing`

Generate SSML using transcript and timing data from audio transcription.

```json
{
  "transcript": "Hello world, this is a test.",
  "wordTimings": [
    {
      "word": "Hello",
      "start": 0.0,
      "end": 0.5,
      "confidence": 0.99,
      "punctuatedWord": "Hello"
    }
  ],
  "sentenceTimings": [...]
}
```

#### 3. Text to SSML (Legacy)
**POST** `/api/text-to-ssml`

```json
{
  "text": "Your text here"
}
```

#### 4. Translate SSML  
**POST** `/api/translate-ssml`

```json
{
  "ssml": "<speak>Your SSML here</speak>",
  "targetLanguage": "Spanish"
}
```

#### 5. Generate Voice
**POST** `/api/generate-voice`

```json
{
  "ssml": "<speak>Your SSML here</speak>",
  "voiceId": "optional-voice-id"
}
```

## 📝 SSML Support

The system supports a comprehensive set of SSML tags for enhanced speech synthesis:

- `<speak>` - Root element (required)
- `<prosody>` - Control pitch, rate, and volume
- `<emphasis>` - Apply emphasis to text
- `<break>` - Insert pauses
- `<say-as>` - Specify content type (e.g., spell out characters)
- `<sub>` - Substitute pronunciation
- `<lang>` - Change language for specific sections
- `<audio>` - Insert audio files
- And more...

For full SSML documentation, see the [Resemble AI SSML reference](https://docs.resemble.ai/reference/ssml).

## 🌐 Supported Languages

The translation service supports all languages supported by OpenAI GPT-4, including:

- Spanish
- French  
- German
- Italian
- Portuguese
- Chinese (Simplified/Traditional)
- Japanese
- Korean
- Russian
- Arabic
- And many more...

## 🎯 Use Cases

- **Multilingual Content Creation**: Convert text content to speech in multiple languages
- **Accessibility**: Generate audio versions of text content
- **Voice Assistants**: Create natural-sounding voice responses
- **E-learning**: Generate narration for educational content
- **Podcasts**: Create AI-generated podcast segments
- **Interactive Applications**: Add voice capabilities to apps and websites

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud Platform
- Azure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Inflection AI](https://inflection.ai/)
- [OpenAI](https://openai.com/)
- [Resemble AI](https://resemble.ai/)
- [AI SDK Documentation](https://ai-sdk.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## ⚠️ Important Notes

- Make sure to secure your API keys and never commit them to version control
- The Resemble AI voice generation may take some time to process
- Consider implementing rate limiting for production use
- Test with different languages and voice IDs to find the best combinations for your use case

# Resemble AI Voice Generation MCP Server

An MCP server that integrates with Resemble AI's voice generation capabilities, allowing Claude Desktop, Cursor AI, and other LLMs to generate and manage voice content through natural language.

## Features

- List available voice models from Resemble AI
- Generate voice audio from text using any available voice
- Return audio as files or base64-encoded data
- Comprehensive logging and error handling
- Multiple integration options for different platforms

## Requirements

- Python 3.10 or higher (for MCP implementation) or Python 3.9+ (for HTTP implementation)
- Resemble AI API key (sign up at [Resemble AI](https://www.resemble.ai/))
- Dependencies listed in requirements.txt

## Installation

1. Clone this repository
```bash
git clone <repository-url>
cd resemble-ai-mcp
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Set up your environment variables
```bash
cp .env.example .env
```

Edit the `.env` file and add your Resemble AI API key:
```
RESEMBLE_API_KEY=your_api_key_here
```

Optional: Customize audio output settings
```
OUTPUT_DIR=./output
AUDIO_FORMAT=mp3
```

## Usage

### Server Implementation Options

This project provides three implementation options:

1. **Direct API Implementation** (resemble_ai_server.py)
   - Uses direct HTTP requests to the Resemble AI API
   - Requires only standard Python libraries and requests

2. **SDK-based Implementation** (resemble_ai_sdk_server.py)
   - Uses the official Resemble AI Python SDK
   - More idiomatic, follows Resemble's recommended approach

3. **HTTP Server Implementation** (resemble_http_server.py)
   - Exposes a RESTful API for tool access
   - Doesn't require MCP framework, works with any HTTP client
   - Best option for Cursor AI integration

### Starting the Server

Choose one of the server implementations and run it:

```bash
# Direct API implementation
python resemble_ai_server.py

# OR SDK-based implementation
python resemble_ai_sdk_server.py

# OR HTTP server implementation (recommended for Cursor AI)
python resemble_http_server.py
```

### Integrating with Claude Desktop

1. Configure the MCP Server in Claude Desktop settings:
```json
{
  "mcpServers": {
    "resemble-ai": {
      "command": "python",
      "args": ["path/to/resemble_ai_server.py"], // or resemble_ai_sdk_server.py
      "env": {
        "RESEMBLE_API_KEY": "your_api_key_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

2. Example prompts for Claude Desktop:

**Listing available voices:**
```
Can you list all the available voice models from Resemble AI?
```

**Generating voice audio:**
```
Generate audio of the following text using a male, American English voice: "Hello world, this is a test of the Resemble AI voice generation system."
```

### Integrating with Cursor AI

Cursor AI can interact with the Resemble AI voice generation server through the HTTP interface. Here's how to set it up:

1. Start the HTTP server implementation:
```bash
python resemble_http_server.py
```

2. The HTTP server runs on port 8000 by default. You can use a different port by setting the `PORT` environment variable:
```bash
PORT=8080 python resemble_http_server.py
```

3. Interact with the server from Cursor AI using HTTP requests:

**Example: Listing available voices**
```python
import requests

response = requests.post(
    "http://localhost:8000/tools",
    json={"tool": "list_voices", "params": {}}
)
voices = response.json()["voices"]
```

**Example: Generating voice audio**
```python
import requests

# Generate audio as a file
response = requests.post(
    "http://localhost:8000/tools",
    json={
        "tool": "generate_tts",
        "params": {
            "text": "Hello, this is generated by Cursor AI.",
            "voice_id": "voice_id_from_list_voices",
            "return_type": "file",
            "output_filename": "cursor_generated"
        }
    }
)

# Or get base64 audio data
response = requests.post(
    "http://localhost:8000/tools",
    json={
        "tool": "generate_tts",
        "params": {
            "text": "Hello, this is generated by Cursor AI.",
            "voice_id": "voice_id_from_list_voices",
            "return_type": "base64"
        }
    }
)
base64_audio = response.json()["audio_data"]
```

4. Example prompts for Cursor AI:

**Listing available voices:**
```
Can you help me list all available voice models from the Resemble AI server running at http://localhost:8000/tools?
```

**Generating voice audio:**
```
Generate audio of the text "Hello, Cursor AI here" using the Resemble AI server at http://localhost:8000/tools. Save it to a file called "cursor_speech.mp3".
```

5. For production use with Cursor AI in web applications, you might want to:
   - Host the server on a publicly accessible endpoint
   - Add proper authentication
   - Use HTTPS for secure communication

## Tool Documentation

### list_voices

Lists all available voice models from Resemble AI.

**Parameters:** None

**Returns:**
- `voices`: List of available voice models with IDs, names, genders, languages, accents, and descriptions

### generate_tts

Generates voice audio from text.

**Parameters:**
- `text` (string, required): The text to convert to speech
- `voice_id` (string, required): The ID of the voice to use
- `return_type` (string, optional): How to return the audio: 'file' or 'base64' (default: 'file')
- `output_filename` (string, optional): Filename for the output without extension (default: auto-generated name)

**Returns:**
- `success` (boolean): Whether the operation was successful
- `message` (string): Status message
- `audio_data` (string, optional): Base64-encoded audio data (if return_type is 'base64')
- `file_path` (string, optional): Path to the saved audio file (if return_type is 'file')

## Testing

Run the test script to verify the tools are working correctly:

```bash
python test_server.py
```

This will test both the `list_voices` and `generate_tts` tools directly, without going through the MCP server.

For testing with Cursor AI, run the example script:

```bash
# Make sure the HTTP server is running first
python resemble_http_server.py

# Then in another terminal
python cursor_ai_example.py
```

## Troubleshooting

- **API Connection Issues**: Make sure you're using the correct API endpoint. The Resemble AI API endpoint is `https://app.resemble.ai/api/v2/`.
- **Authentication Errors**: Verify your API key is correct and not expired.
- **Missing Projects**: The API requires at least one project in your Resemble account. Create a project through the Resemble AI dashboard if needed.
- **Python Version Issues**: The MCP framework requires Python 3.10+, but the HTTP server implementation works with Python 3.9+.

## License

MIT
