import { requestUrl } from 'obsidian';
import type { IImageProvider } from '../types';
import { MODELS } from '../constants';
import { base64ToArrayBuffer } from '../utils/fileUtils';

interface GeminiGenerateContentResponse {
    candidates?: Array<{
        content: {
            parts: Array<{
                text?: string;
                inlineData?: {
                    mimeType: string;
                    data: string;
                };
            }>;
        };
    }>;
    error?: {
        message: string;
        code: number;
    };
}

export class GeminiProvider implements IImageProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    updateApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    getName(): 'gemini' {
        return 'gemini';
    }

    private enhancePromptForStyle(prompt: string, style: string): string {
        const styleEnhancements: Record<string, string> = {
            photorealistic: 'photorealistic, high detail, professional photography, sharp focus',
            artistic: 'artistic interpretation, creative, expressive, painterly style',
            anime: 'anime style, manga illustration, Japanese animation aesthetic',
            sketch: 'pencil sketch, hand-drawn, detailed linework, graphite drawing',
        };

        const enhancement = styleEnhancements[style];
        return enhancement ? `${prompt}, ${enhancement}` : prompt;
    }

    async generate(prompt: string, size: string, style: string): Promise<ArrayBuffer> {
        if (!this.apiKey) {
            throw new Error('Gemini API key is not configured');
        }

        const enhancedPrompt = `Generate an image: ${this.enhancePromptForStyle(prompt, style)}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini.image}:generateContent?key=${this.apiKey}`;

        console.debug('[EasyAI Gemini] Generating image with:', { prompt: enhancedPrompt });

        let response;
        try {
            response = await requestUrl({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: enhancedPrompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseModalities: ['TEXT', 'IMAGE'],
                    },
                }),
                throw: false,
            });
        } catch (error) {
            console.error('[EasyAI Gemini] Request error:', error);
            throw new Error(`Gemini request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        console.debug('[EasyAI Gemini] Response status:', response.status);

        if (response.status !== 200) {
            const errorData = response.json;
            console.error('[EasyAI Gemini] Error response:', errorData);
            const errorMessage = errorData?.error?.message || `Gemini API error: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data: GeminiGenerateContentResponse = response.json;
        console.debug('[EasyAI Gemini] Response received:', JSON.stringify(data).substring(0, 200));

        // Find the image part in the response
        const parts = data.candidates?.[0]?.content?.parts;
        if (!parts) {
            throw new Error('No content received from Gemini');
        }

        const imagePart = parts.find(part => part.inlineData?.data);
        if (!imagePart?.inlineData?.data) {
            throw new Error('No image data received from Gemini. The model may have returned text only.');
        }

        return base64ToArrayBuffer(imagePart.inlineData.data);
    }
}
