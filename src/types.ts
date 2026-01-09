export type APIProvider = 'openai' | 'gemini';

export type ImageSize = 'small' | 'medium' | 'large';

export type DallEStyle = 'natural' | 'vivid';

export type GeminiStyle = 'photorealistic' | 'artistic' | 'anime' | 'sketch';

export interface EasyAIImageSettings {
    provider: APIProvider;
    openaiApiKey: string;
    geminiApiKey: string;
    saveLocation: string;
    defaultSize: ImageSize;
    defaultDallEStyle: DallEStyle;
    defaultGeminiStyle: GeminiStyle;
    autoTranslate: boolean;
    maxHistoryItems: number;
}

export interface HistoryItem {
    id: string;
    originalPrompt: string;
    translatedPrompt: string;
    imagePath: string;
    timestamp: number;
    provider: APIProvider;
    size: ImageSize;
    style: string;
}

export interface GenerationResult {
    success: boolean;
    imagePath?: string;
    error?: string;
    revisedPrompt?: string;
}

export interface GenerationOptions {
    prompt: string;
    size: ImageSize;
    style: string;
    provider: APIProvider;
}

export interface IImageProvider {
    generate(prompt: string, size: string, style: string): Promise<ArrayBuffer>;
    getName(): APIProvider;
}

export interface OpenAIImageResponse {
    created: number;
    data: Array<{
        url?: string;
        b64_json?: string;
        revised_prompt?: string;
    }>;
}

export interface GeminiImageResponse {
    data: Array<{
        b64_json?: string;
        url?: string;
        revised_prompt?: string;
    }>;
    created: number;
    usage?: {
        prompt_tokens: number;
    };
}

export interface PluginData {
    settings: EasyAIImageSettings;
    history: HistoryItem[];
}
