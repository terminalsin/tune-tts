# Text-to-Speech Pipeline

A comprehensive text-to-speech system that converts text to SSML, translates it to different languages, and generates high-quality voice output.

## 🚀 Features

- **Text to SSML Conversion**: Uses Inflection AI to intelligently annotate text with SSML markup for better speech synthesis
- **Language Translation**: Translates SSML-annotated text while preserving markup using OpenAI GPT-4
- **Voice Generation**: Generates high-quality speech using Resemble AI's voice synthesis
- **Web Interface**: Beautiful, responsive web interface for testing and using the system
- **API Endpoints**: RESTful API endpoints for integration with other applications

## 🏗️ Architecture

The system consists of three main processing steps:

1. **Text → SSML** (Inflection AI): Converts plain text into SSML markup with appropriate prosody, emphasis, and other speech annotations
2. **SSML Translation** (OpenAI GPT-4): Translates the SSML content while preserving all markup tags and attributes
3. **Voice Generation** (Resemble AI): Synthesizes speech from the final SSML markup

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for the required services

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Resemble AI API Keys  
# Get from: https://app.resemble.ai/
RESEMBLE_API_KEY=your_resemble_api_key_here
RESEMBLE_PROJECT_ID=your_resemble_project_id_here
RESEMBLE_DEFAULT_VOICE_ID=your_default_voice_id_here

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

### Main Pipeline Endpoint

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

#### 1. Text to SSML
**POST** `/api/text-to-ssml`

```json
{
  "text": "Your text here"
}
```

#### 2. Translate SSML  
**POST** `/api/translate-ssml`

```json
{
  "ssml": "<speak>Your SSML here</speak>",
  "targetLanguage": "Spanish"
}
```

#### 3. Generate Voice
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
