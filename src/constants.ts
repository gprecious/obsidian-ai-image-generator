import type { EasyAIImageSettings, ImageSize } from './types';

export const DEFAULT_SETTINGS: EasyAIImageSettings = {
    provider: 'openai',
    openaiApiKey: '',
    geminiApiKey: '',
    saveLocation: 'Attachments/',
    defaultSize: 'medium',
    defaultDallEStyle: 'vivid',
    defaultGeminiStyle: 'photorealistic',
    autoTranslate: true,
    maxHistoryItems: 100,
};

export const API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/images/generations',
    openaiChat: 'https://api.openai.com/v1/chat/completions',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/images/generations',
    geminiChat: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
} as const;

export const OPENAI_SIZE_MAP: Record<ImageSize, string> = {
    small: '1024x1024',
    medium: '1024x1024',
    large: '1792x1024',
};

export const GEMINI_SIZE_MAP: Record<ImageSize, string> = {
    small: '1024x1024',
    medium: '1024x1024',
    large: '1408x768',
};

export const MODELS = {
    openai: {
        image: 'dall-e-3',
        chat: 'gpt-4o-mini',
    },
    gemini: {
        image: 'gemini-2.0-flash-exp',
        chat: 'gemini-2.0-flash',
    },
} as const;

export const DALLE_STYLE_DESCRIPTIONS: Record<string, string> = {
    natural: 'Natural, realistic style',
    vivid: 'Vivid, dramatic hyper-real style',
} as const;

export const GEMINI_STYLE_DESCRIPTIONS: Record<string, string> = {
    photorealistic: 'Photo-realistic, high detail',
    artistic: 'Artistic, creative interpretation',
    anime: 'Anime/manga style',
    sketch: 'Pencil sketch style',
};

export const SIZE_DESCRIPTIONS: Record<ImageSize, string> = {
    small: 'Small (1024x1024)',
    medium: 'Medium (1024x1024)',
    large: 'Large (wide)',
};

export const PLUGIN_INFO = {
    id: 'obsidian-easy-ai-image-generator',
    name: 'Easy AI Image Generator',
    fundingUrl: 'https://www.buymeacoffee.com/gprecious',
    githubUrl: 'https://github.com/gprecious/obsidian-ai-image-generator',
} as const;

export const KOREAN_REGEX = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

export const IMAGE_PREFIX = 'ai_image_';
export const IMAGE_EXTENSION = 'png';
