import { requestUrl } from 'obsidian';
import type { IImageProvider, OpenAIImageResponse } from '../types';
import { API_ENDPOINTS, MODELS } from '../constants';
import { base64ToArrayBuffer } from '../utils/fileUtils';

export class OpenAIProvider implements IImageProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    updateApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    getName(): 'openai' {
        return 'openai';
    }

    async generate(prompt: string, size: string, style: string): Promise<ArrayBuffer> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key is not configured');
        }

        console.log('[EasyAI OpenAI] Generating image with:', { prompt, size, style });

        let response;
        try {
            response = await requestUrl({
                url: API_ENDPOINTS.openai,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODELS.openai.image,
                    prompt: prompt,
                    n: 1,
                    size: size,
                    style: style,
                    response_format: 'b64_json',
                }),
                throw: false,
            });
        } catch (error) {
            console.error('[EasyAI OpenAI] Request error:', error);
            throw new Error(`OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        console.log('[EasyAI OpenAI] Response status:', response.status);

        if (response.status !== 200) {
            const errorData = response.json;
            console.error('[EasyAI OpenAI] Error response:', errorData);
            const errorMessage = errorData?.error?.message || `OpenAI API error: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data: OpenAIImageResponse = response.json;
        console.log('[EasyAI OpenAI] Response received, has data:', !!data.data?.[0]?.b64_json);
        
        if (!data.data?.[0]?.b64_json) {
            throw new Error('No image data received from OpenAI');
        }

        return base64ToArrayBuffer(data.data[0].b64_json);
    }
}
