import { inflection } from 'inflection-ai-sdk-provider';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        const prompt = `Convert the following text into SSML markup for speech synthesis.
Please exclusively the SSML output:
- Do not add \`\`\` or \`\`\` at the beginning or end of the output.
- Do not add any other text or comments to the output.
- Strictly follow the format of the SSML elements.
- Do not add any xml tags to <speak> or </speak>
- After the <speak> tag, add <lang xml:lang="en-us"> and </lang> tags. THIS IS MANDATORY AND SHOULD WRAP THE ENTIRE OUTPUT.
- Be generous with emotions and intonation tags.

These are the SSML elements that Resemble supports. The speak element requires a spoken request. All other elements are optional.

| SSML Element | Required | Summary |
|---|---|---|
| 'speak' | Yes |  |
| 'prosody' | No |  |
| 'emphasis' | No |  |
| 'say-as' | No |  |
| 'sub' | No |  |
| 'break' | No |  |
| 'language' | No |  |
| 'resemble:convert' | No |  |
| 'resemble:fill' | No |  |
| 'audio' | No |  |

'<speak>': Speak tag

The required element of most SSML documents.

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'voice' | Yes |  |
| 'lang' | No |  |
| 'volume' | No |  |
| 'pitch' | No |  |
| 'rate' | No |  |
| 'prosody' | No |  |
| 'prompt' | No |  |


'<prosody>' tag

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'pitch' | No |  |
| 'rate' | No |  |
| 'volume' | No |  |


'<emphasis>' tag

An optional tag that specifies the emphasis of the synthesized speech. Emphasis makes a spoken phrase stand out.

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'level' | No |  |


'<say-as>' tag

An optional element that indicates the content type.

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'interpret-as' | Yes |  |


'<sub>' tag

An optional element that specifies a string of text that is pronounced in place of the element's text.

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'interpret-as' | Yes |  |


'<break>' tag

An optional tag used to insert pauses between words.

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'time' | Yes |  |


'<language>' tag

If supported by the voice, this tag will allow you to switch languages.

Example

Supported Languages

'<resemble:convert>' tag

If supported by the voice, this tag will allow you to convert speech to speech.

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'rc' | Yes |  |
| 'pitch' | No |  |


'<resemble:fill>' tag

Example

Attributes

| Attribute | Required | Description |
|---|---|---|
| 'resemble:used' | Yes |  |


'<audio>' tag

The 'audio' tag allows you to import waveform audio files and then wire the waveform speech output.


Text: ${text}

SSML:`;

        const { text: ssmlText } = await generateText({
            model: inflection('inflection_3_pi'),
            prompt,
        });

        return NextResponse.json({ ssml: ssmlText });
    } catch (error) {
        console.error('Error generating SSML:', error);
        return NextResponse.json(
            { error: 'Failed to generate SSML' },
            { status: 500 }
        );
    }
} 