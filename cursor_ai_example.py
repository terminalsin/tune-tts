"""
Example script demonstrating how Cursor AI can use the Resemble AI Voice Generation Server.

This script shows how to interact with the Resemble AI server via HTTP requests.
It lists available voices and generates audio from text.

Usage:
1. Start the HTTP server: python resemble_http_server.py
2. Run this script: python cursor_ai_example.py
"""

import requests
import base64
import os
import json
from pathlib import Path

# Create output directory if it doesn't exist
output_dir = "./cursor_output"
Path(output_dir).mkdir(parents=True, exist_ok=True)

# Server URL (default port is 8000)
SERVER_URL = "http://localhost:8000/tools"


def list_available_voices():
    """List all available voices from Resemble AI."""
    print("🔍 Listing available voices from Resemble AI...")

    try:
        response = requests.post(SERVER_URL, json={"tool": "list_voices", "params": {}})
        response.raise_for_status()
        result = response.json()

        if "voices" in result and result["voices"]:
            voices = result["voices"]
            print(f"\n✅ Found {len(voices)} voices!\n")

            # Print voice information in a neat format
            for i, voice in enumerate(voices[:5]):  # Show first 5 voices
                print(f"Voice {i + 1}:")
                print(f"  - ID: {voice['id']}")
                print(f"  - Name: {voice['name']}")
                print(f"  - Gender: {voice['gender']}")
                print(f"  - Language: {voice['language']}")
                print()

            if len(voices) > 5:
                print(f"... and {len(voices) - 5} more voices available.\n")

            # Return the first voice ID for demo purposes
            return voices[0]["id"]
        else:
            print("❌ No voices found in the response.")
            return None

    except Exception as e:
        print(f"❌ Error listing voices: {str(e)}")
        return None


def generate_audio_file(voice_id, text):
    """Generate audio from text and save to a file."""
    print(f'🔊 Generating audio for: "{text}"')

    try:
        # Request audio file generation
        response = requests.post(
            SERVER_URL,
            json={
                "tool": "generate_tts",
                "params": {
                    "text": text,
                    "voice_id": voice_id,
                    "return_type": "file",
                    "output_filename": "cursor_example",
                },
            },
        )
        response.raise_for_status()
        result = response.json()

        if result.get("success"):
            file_path = result.get("file_path")
            print(f"✅ Audio file generated successfully: {file_path}")
            return file_path
        else:
            print(f"❌ Failed to generate audio: {result.get('message')}")
            return None

    except Exception as e:
        print(f"❌ Error generating audio file: {str(e)}")
        return None


def generate_base64_audio(voice_id, text):
    """Generate audio from text and return as base64."""
    print(f'🔊 Generating base64 audio for: "{text}"')

    try:
        # Request base64-encoded audio
        response = requests.post(
            SERVER_URL,
            json={
                "tool": "generate_tts",
                "params": {"text": text, "voice_id": voice_id, "return_type": "base64"},
            },
        )
        response.raise_for_status()
        result = response.json()

        if result.get("success") and result.get("audio_data"):
            # Save base64 audio to a file for demonstration
            audio_data = base64.b64decode(result["audio_data"])
            output_path = os.path.join(output_dir, "cursor_example_base64.mp3")

            with open(output_path, "wb") as f:
                f.write(audio_data)

            print(f"✅ Base64 audio decoded and saved to: {output_path}")
            return output_path
        else:
            print(f"❌ Failed to generate base64 audio: {result.get('message')}")
            return None

    except Exception as e:
        print(f"❌ Error generating base64 audio: {str(e)}")
        return None


def main():
    """Main function demonstrating Cursor AI integration with Resemble AI."""
    print("🤖 Cursor AI + Resemble AI Voice Generation Demo\n")

    # Step 1: List available voices
    voice_id = list_available_voices()
    if not voice_id:
        print("❌ Cannot proceed without a voice ID.")
        return

    # Step 2: Generate audio as a file
    file_path = generate_audio_file(
        voice_id,
        "Hello! This is an example of Cursor AI using Resemble's voice generation capabilities.",
    )

    # Step 3: Generate audio as base64
    base64_path = generate_base64_audio(
        voice_id,
        "This is another example showing base64 encoding for web applications.",
    )

    # Success message
    if file_path or base64_path:
        print("\n✨ Demo completed successfully!")
        print(
            "This demonstrates how Cursor AI can use the Resemble AI server to generate voice content."
        )
        print("\nYou can find the generated audio files in:")
        if file_path:
            print(f"- {file_path}")
        if base64_path:
            print(f"- {base64_path}")
    else:
        print("\n❌ Demo failed to generate any audio files.")


if __name__ == "__main__":
    main()
