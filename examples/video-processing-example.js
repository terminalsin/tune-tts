// Example of how to use the Video Processing Pipeline API

const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3000'; // Change to your deployed URL

/**
 * Example 1: Basic video processing (English audio replacement)
 */
async function example1_BasicVideoProcessing(videoFilePath) {
    console.log('🚀 Example 1: Basic video processing');

    try {
        // Check if video file exists
        if (!fs.existsSync(videoFilePath)) {
            console.error('❌ Video file not found:', videoFilePath);
            return;
        }

        // Create form data
        const formData = new FormData();
        const videoBuffer = fs.readFileSync(videoFilePath);
        const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });

        formData.append('video', videoBlob, path.basename(videoFilePath));

        const response = await fetch(`${API_BASE_URL}/api/process-video`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            // Get processing metadata from headers
            const steps = JSON.parse(response.headers.get('X-Processing-Steps') || '[]');
            const originalDuration = response.headers.get('X-Original-Duration');
            const generatedAudioDuration = response.headers.get('X-Generated-Audio-Duration');

            console.log('✅ Video processing successful!');
            console.log('📊 Processing steps:', steps);
            console.log('⏱️ Original video duration:', originalDuration + 's');
            console.log('🎵 Generated audio duration:', generatedAudioDuration + 's');

            // Save the processed video
            const processedVideoBuffer = await response.arrayBuffer();
            const outputPath = path.join(path.dirname(videoFilePath),
                `processed_${Date.now()}_${path.basename(videoFilePath)}`);

            fs.writeFileSync(outputPath, Buffer.from(processedVideoBuffer));
            console.log('💾 Processed video saved to:', outputPath);

            return { success: true, outputPath, steps };
        } else {
            const error = await response.json();
            console.error('❌ Error:', error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('🚨 Network or processing error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Example 2: Video processing with translation
 */
async function example2_VideoProcessingWithTranslation(videoFilePath, targetLanguage) {
    console.log(`🚀 Example 2: Video processing with translation to ${targetLanguage}`);

    try {
        if (!fs.existsSync(videoFilePath)) {
            console.error('❌ Video file not found:', videoFilePath);
            return;
        }

        const formData = new FormData();
        const videoBuffer = fs.readFileSync(videoFilePath);
        const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });

        formData.append('video', videoBlob, path.basename(videoFilePath));
        formData.append('targetLanguage', targetLanguage);

        console.log('🔄 Processing video with translation...');
        const response = await fetch(`${API_BASE_URL}/api/process-video`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const steps = JSON.parse(response.headers.get('X-Processing-Steps') || '[]');
            const originalDuration = response.headers.get('X-Original-Duration');
            const generatedAudioDuration = response.headers.get('X-Generated-Audio-Duration');

            console.log('✅ Video processing with translation successful!');
            console.log('📊 Processing steps:', steps);
            console.log('⏱️ Original duration:', originalDuration + 's');
            console.log('🎵 Generated audio duration:', generatedAudioDuration + 's');

            // Save the processed video
            const processedVideoBuffer = await response.arrayBuffer();
            const outputPath = path.join(path.dirname(videoFilePath),
                `translated_${targetLanguage}_${Date.now()}_${path.basename(videoFilePath)}`);

            fs.writeFileSync(outputPath, Buffer.from(processedVideoBuffer));
            console.log('💾 Translated video saved to:', outputPath);

            return { success: true, outputPath, steps, targetLanguage };
        } else {
            const error = await response.json();
            console.error('❌ Error:', error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('🚨 Network or processing error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Example 3: Batch video processing
 */
async function example3_BatchVideoProcessing(videoFilePaths, targetLanguage = null) {
    console.log('🚀 Example 3: Batch video processing');

    const results = [];

    for (let i = 0; i < videoFilePaths.length; i++) {
        const videoPath = videoFilePaths[i];
        console.log(`\n📹 Processing video ${i + 1}/${videoFilePaths.length}: ${path.basename(videoPath)}`);

        let result;
        if (targetLanguage) {
            result = await example2_VideoProcessingWithTranslation(videoPath, targetLanguage);
        } else {
            result = await example1_BasicVideoProcessing(videoPath);
        }

        results.push({
            inputPath: videoPath,
            ...result
        });

        // Add a small delay between requests to avoid overwhelming the server
        if (i < videoFilePaths.length - 1) {
            console.log('⏰ Waiting 2 seconds before next video...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('\n📊 Batch processing summary:');
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${path.basename(result.inputPath)}: ${result.success ? '✅ Success' : '❌ Failed'}`);
        if (result.success) {
            console.log(`   Output: ${result.outputPath}`);
        } else {
            console.log(`   Error: ${result.error}`);
        }
    });

    return results;
}

/**
 * Example 4: Video processing with custom voice ID
 */
async function example4_VideoProcessingWithCustomVoice(videoFilePath, voiceId) {
    console.log('🚀 Example 4: Video processing with custom voice');

    try {
        if (!fs.existsSync(videoFilePath)) {
            console.error('❌ Video file not found:', videoFilePath);
            return;
        }

        const formData = new FormData();
        const videoBuffer = fs.readFileSync(videoFilePath);
        const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });

        formData.append('video', videoBlob, path.basename(videoFilePath));
        formData.append('voiceId', voiceId);

        console.log(`🎙️ Processing video with custom voice: ${voiceId}`);
        const response = await fetch(`${API_BASE_URL}/api/process-video`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const steps = JSON.parse(response.headers.get('X-Processing-Steps') || '[]');
            console.log('✅ Video processing with custom voice successful!');
            console.log('📊 Processing steps:', steps);

            const processedVideoBuffer = await response.arrayBuffer();
            const outputPath = path.join(path.dirname(videoFilePath),
                `custom_voice_${Date.now()}_${path.basename(videoFilePath)}`);

            fs.writeFileSync(outputPath, Buffer.from(processedVideoBuffer));
            console.log('💾 Video with custom voice saved to:', outputPath);

            return { success: true, outputPath, steps, voiceId };
        } else {
            const error = await response.json();
            console.error('❌ Error:', error);
            return { success: false, error };
        }
    } catch (error) {
        console.error('🚨 Network or processing error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Utility function to create a test video file (using a simple video generation)
 */
async function createTestVideo(outputPath, durationSeconds = 10) {
    console.log('🎬 Creating test video...');

    // This would require ffmpeg to be installed on the system
    // For demo purposes, we'll just create a placeholder
    console.log('⚠️ To create a test video, you need to either:');
    console.log('1. Provide your own MP4 file');
    console.log('2. Use ffmpeg to generate a test video:');
    console.log(`   ffmpeg -f lavfi -i testsrc=duration=${durationSeconds}:size=640x480:rate=30 -f lavfi -i sine=frequency=1000:duration=${durationSeconds} -c:v libx264 -c:a aac -shortest ${outputPath}`);
}

// Example usage:

// For testing with a real video file:
// example1_BasicVideoProcessing('./test-video.mp4');

// For translation:
// example2_VideoProcessingWithTranslation('./test-video.mp4', 'Spanish');

// For batch processing:
// example3_BatchVideoProcessing(['./video1.mp4', './video2.mp4'], 'French');

// For custom voice:
// example4_VideoProcessingWithCustomVoice('./test-video.mp4', 'your-voice-id');

// Create a test video helper:
// createTestVideo('./test-video.mp4', 15);

module.exports = {
    example1_BasicVideoProcessing,
    example2_VideoProcessingWithTranslation,
    example3_BatchVideoProcessing,
    example4_VideoProcessingWithCustomVoice,
    createTestVideo,
}; 