// Example of how to use the Text-to-Speech Pipeline API

const API_BASE_URL = 'http://localhost:3000'; // Change to your deployed URL

/**
 * Example 1: Complete pipeline with translation
 */
async function example1_CompleteProcess() {
    console.log('🚀 Example 1: Complete text processing pipeline');

    try {
        const response = await fetch(`${API_BASE_URL}/api/process-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: "Hello! Welcome to our amazing text-to-speech service. This is a demonstration of how we can convert your text into natural-sounding speech.",
                targetLanguage: "Spanish",
                // voiceId: "your-voice-id-here" // Optional
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Success!');
            console.log('📝 Original text:', result.originalText);
            console.log('🔖 Generated SSML:', result.ssml);
            console.log('🌍 Translated SSML:', result.translatedSSML);
            console.log('🎵 Audio URL:', result.voiceResult.audioUrl);
        } else {
            console.error('❌ Error:', result.error);
        }
    } catch (error) {
        console.error('🚨 Network error:', error);
    }
}

/**
 * Example 2: English-only processing (no translation)
 */
async function example2_EnglishOnly() {
    console.log('🚀 Example 2: English-only processing');

    try {
        const response = await fetch(`${API_BASE_URL}/api/process-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: "This is a test of the emergency broadcast system. Please remain calm and listen carefully to the following instructions.",
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Success!');
            console.log('🎵 Audio URL:', result.voiceResult.audioUrl);
        } else {
            console.error('❌ Error:', result.error);
        }
    } catch (error) {
        console.error('🚨 Network error:', error);
    }
}

/**
 * Example 3: Step-by-step processing
 */
async function example3_StepByStep() {
    console.log('🚀 Example 3: Step-by-step processing');

    const text = "The weather today is absolutely beautiful! Perfect for a walk in the park.";

    try {
        // Step 1: Convert text to SSML
        console.log('Step 1: Converting to SSML...');
        const ssmlResponse = await fetch(`${API_BASE_URL}/api/text-to-ssml`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        const { ssml } = await ssmlResponse.json();
        console.log('📝 SSML:', ssml);

        // Step 2: Translate SSML
        console.log('Step 2: Translating to French...');
        const translateResponse = await fetch(`${API_BASE_URL}/api/translate-ssml`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ssml, targetLanguage: 'French' }),
        });
        const { translatedSSML } = await translateResponse.json();
        console.log('🌍 Translated SSML:', translatedSSML);

        // Step 3: Generate voice
        console.log('Step 3: Generating voice...');
        const voiceResponse = await fetch(`${API_BASE_URL}/api/generate-voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ssml: translatedSSML }),
        });
        const voiceResult = await voiceResponse.json();

        if (voiceResult.audioUrl) {
            console.log('🎵 Voice generated successfully:', voiceResult.audioUrl);
        } else if (voiceResult.status === 'processing') {
            console.log('⏳ Voice generation in progress, clip ID:', voiceResult.clipId);

            // You can check status later using:
            // GET /api/check-clip-status?clipId=${voiceResult.clipId}
        }

    } catch (error) {
        console.error('🚨 Error in step-by-step processing:', error);
    }
}

/**
 * Example 4: Check clip status for processing clips
 */
async function example4_CheckClipStatus(clipId) {
    console.log('🚀 Example 4: Checking clip status');

    try {
        const response = await fetch(`${API_BASE_URL}/api/check-clip-status?clipId=${clipId}`);
        const result = await response.json();

        console.log('📊 Clip status:', result.status);
        if (result.audioUrl) {
            console.log('🎵 Audio ready:', result.audioUrl);
        }

        return result;
    } catch (error) {
        console.error('🚨 Error checking clip status:', error);
    }
}

/**
 * Example 5: Polling for clip completion
 */
async function example5_PollForCompletion(clipId, maxAttempts = 30, interval = 2000) {
    console.log('🚀 Example 5: Polling for clip completion');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔄 Attempt ${attempt}/${maxAttempts}`);

        const status = await example4_CheckClipStatus(clipId);

        if (status && status.status === 'completed') {
            console.log('✅ Clip completed!', status.audioUrl);
            return status;
        }

        if (attempt < maxAttempts) {
            console.log(`⏰ Waiting ${interval}ms before next check...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    console.log('⏰ Polling timeout reached');
    return null;
}

// Uncomment the examples you want to run:

// example1_CompleteProcess();
// example2_EnglishOnly();
// example3_StepByStep();

// For checking a specific clip:
// example4_CheckClipStatus('your-clip-id-here');

// For polling until completion:
// example5_PollForCompletion('your-clip-id-here');

module.exports = {
    example1_CompleteProcess,
    example2_EnglishOnly,
    example3_StepByStep,
    example4_CheckClipStatus,
    example5_PollForCompletion,
}; 