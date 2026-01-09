import { requestUrl } from 'obsidian';
import { API_ENDPOINTS, MODELS, KOREAN_REGEX } from '../constants';
import type { APIProvider } from '../types';

export class TranslationService {
    private openaiApiKey: string;
    private geminiApiKey: string;
    private provider: APIProvider;

    constructor(openaiApiKey: string, geminiApiKey: string, provider: APIProvider) {
        this.openaiApiKey = openaiApiKey;
        this.geminiApiKey = geminiApiKey;
        this.provider = provider;
    }

    updateKeys(openaiApiKey: string, geminiApiKey: string, provider: APIProvider): void {
        this.openaiApiKey = openaiApiKey;
        this.geminiApiKey = geminiApiKey;
        this.provider = provider;
    }

    containsKorean(text: string): boolean {
        return KOREAN_REGEX.test(text);
    }

    async translate(text: string): Promise<string> {
        if (!this.containsKorean(text)) {
            return text;
        }

        const apiKey = this.provider === 'openai' ? this.openaiApiKey : this.geminiApiKey;
        const endpoint = this.provider === 'openai' ? API_ENDPOINTS.openaiChat : API_ENDPOINTS.geminiChat;
        const model = this.provider === 'openai' ? MODELS.openai.chat : MODELS.gemini.chat;

        if (!apiKey) {
            throw new Error(`${this.provider} API key is not configured`);
        }

        const systemPrompt = `You are a translator. Translate the following Korean text to English. 
The text will be used as an AI image generation prompt, so:
1. Keep it concise and descriptive
2. Preserve the artistic intent
3. Add relevant visual keywords if appropriate
4. Output ONLY the translated English text, nothing else.`;

        const response = await requestUrl({
            url: endpoint,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                max_tokens: 500,
                temperature: 0.3,
            }),
        });

        if (response.status !== 200) {
            throw new Error(`Translation failed: ${response.status}`);
        }

        const data = response.json;
        return data.choices[0]?.message?.content?.trim() || text;
    }
}
