# Video Processing Pipeline

This feature allows you to take MP4 videos, extract the audio, convert it to natural-sounding speech using AI, and replace the original audio with the generated speech. The pipeline supports translation and maintains proper timing synchronization.

## 🎬 How It Works

The video processing pipeline consists of the following steps:

1. **Audio Extraction**: Extract audio from the input MP4 video using FFmpeg
2. **Transcription**: Convert audio to text using Deepgram with precise timing information
3. **SSML Generation**: Create timing-aware SSML markup that preserves natural speech patterns
4. **Translation** (optional): Translate SSML to target language while maintaining timing structure
5. **Voice Generation**: Generate high-quality speech using Resemble AI
6. **Video Combination**: Combine the generated audio with the original video
7. **Duration Handling**: Extend video by cloning the last frame if the generated audio is longer

## 🚀 API Usage

### Endpoint: `/api/process-video`

**Method:** POST  
**Content-Type:** multipart/form-data

**Parameters:**
- `video` (File, required): MP4 video file to process
- `targetLanguage` (String, optional): Target language for translation (e.g., "Spanish", "French")
- `voiceId` (String, optional): Custom voice ID for Resemble AI

**Response:**
- **Success**: Returns processed MP4 video as binary data
- **Headers include processing metadata:**
  - `X-Processing-Steps`: JSON array of processing steps completed
  - `X-Original-Duration`: Original video duration in seconds
  - `X-Generated-Audio-Duration`: Generated audio duration in seconds
  - `X-Processing-Success`: "true" if successful

**Error Response:**
```json
{
  "error": "Error description",
  "details": "Detailed error message",
  "success": false
}
```

## 📋 Requirements

### Environment Variables
```bash
# Required for transcription
DEEPGRAM_API_KEY=your_deepgram_api_key

# Required for SSML translation (if using translation)
OPENAI_API_KEY=your_openai_api_key

# Required for voice generation
RESEMBLE_ENDPOINT=your_resemble_endpoint
RESEMBLE_TOKEN=your_resemble_token
RESEMBLE_PROJECT_ID=your_resemble_project_id
RESEMBLE_VOICE_ID=your_resemble_voice_id
```

### System Dependencies
- Node.js with Next.js
- FFmpeg (automatically included via ffmpeg-static package)

## 🔧 Installation

1. Install the required dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env.local`

3. Start the development server:
```bash
npm run dev
```

## 💻 Usage Examples

### Basic Video Processing
```javascript
const formData = new FormData();
formData.append('video', videoFile);

const response = await fetch('/api/process-video', {
    method: 'POST',
    body: formData,
});

const processedVideo = await response.arrayBuffer();
```

### Video Processing with Translation
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('targetLanguage', 'Spanish');

const response = await fetch('/api/process-video', {
    method: 'POST',
    body: formData,
});
```

### Using Custom Voice
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('voiceId', 'your-custom-voice-id');

const response = await fetch('/api/process-video', {
    method: 'POST',
    body: formData,
});
```

## 📁 Example Scripts

Check out `examples/video-processing-example.js` for comprehensive examples including:

- **Basic Processing**: Replace audio with AI-generated speech
- **Translation**: Translate and replace audio in different languages
- **Batch Processing**: Process multiple videos automatically
- **Custom Voice**: Use specific voice models

Run examples:
```bash
node examples/video-processing-example.js
```

## ⚠️ Important Notes

### Duration Handling
- If generated audio is **longer** than the original video, the last frame will be extended/cloned to match the audio duration
- If generated audio is **shorter** than the original video, the video will be trimmed to match the audio duration
- Original video timing information is preserved in response headers

### File Format Support
- **Input**: MP4, MOV, AVI video files
- **Output**: MP4 video with AAC audio

### Processing Time
- Processing time depends on video length and complexity
- Typical processing time: 2-5x the original video duration
- Maximum processing time: 5 minutes (configurable)

### File Size Limits
- Recommended: Videos under 100MB
- Maximum: Depends on your server configuration
- Longer videos may require increased timeout limits

## 🔧 Troubleshooting

### Common Issues

**1. "Audio extraction failed"**
- Ensure video file is not corrupted
- Check that video contains audio track
- Verify video format is supported

**2. "Audio processing failed"**
- Check Deepgram API key is valid
- Ensure audio quality is sufficient for transcription
- Verify network connectivity

**3. "Voice generation failed"**
- Verify Resemble AI credentials
- Check API rate limits
- Ensure SSML is properly formatted

**4. "Video combination failed"**
- Check available disk space
- Verify FFmpeg installation
- Ensure temporary directory is writable

### Performance Optimization

**For Production:**
- Use a dedicated server with sufficient CPU/memory
- Implement request queuing for batch processing
- Set up proper error handling and retry logic
- Monitor disk space for temporary files

**For Development:**
- Use smaller test videos (< 30 seconds)
- Enable verbose logging for debugging
- Check console output for detailed error messages

## 🎯 Use Cases

### Content Localization
- Translate video content to multiple languages
- Maintain original video timing and visual elements
- Generate consistent voice across different languages

### Accessibility
- Replace unclear audio with clear AI-generated speech
- Standardize audio quality across video content
- Create consistent narrator voice

### Content Creation
- Replace placeholder audio with final narration
- Generate multiple voice variations of the same content
- Create voice-over for silent videos

### Educational Content
- Convert text-based content to spoken explanations
- Create multi-language educational materials
- Generate consistent teacher voice across lessons

## 🔄 Integration with Existing Pipeline

The video processing endpoint leverages the existing audio processing pipeline:

```
Video Input → Audio Extraction → [Existing Audio Pipeline] → Video Output
                                      ↓
                      Transcription → SSML → Translation → Voice Generation
```

This ensures consistency with the existing text-to-speech functionality while adding video processing capabilities.

## 📊 API Response Details

### Success Response Headers
```
Content-Type: video/mp4
Content-Length: [file_size]
Content-Disposition: attachment; filename="processed_[original_name]"
X-Processing-Steps: ["step1", "step2", ...]
X-Original-Duration: "15.5"
X-Generated-Audio-Duration: "16.2"
X-Processing-Success: "true"
```

### Processing Steps Examples
```json
[
  "Audio extracted from video using FFmpeg",
  "Audio transcribed using Deepgram with timing information",
  "SSML generated with natural timing and prosody based on original audio",
  "SSML translated to Spanish using OpenAI GPT-4o while preserving timing structure",
  "High-quality voice generated using Resemble AI",
  "Generated audio combined with original video",
  "Video extended by cloning last frame to match audio duration"
]
```

---

For more examples and advanced usage, see the files in the `examples/` directory. 