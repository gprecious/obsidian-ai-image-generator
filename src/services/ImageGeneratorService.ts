import type { Vault } from 'obsidian';
import type { APIProvider, GenerationOptions, GenerationResult, EasyAIImageSettings, ImageSize } from '../types';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { TranslationService } from './TranslationService';
import { saveImage, getObsidianImageLink } from '../utils/fileUtils';
import { OPENAI_SIZE_MAP, GEMINI_SIZE_MAP } from '../constants';

export class ImageGeneratorService {
    private openaiProvider: OpenAIProvider;
    private geminiProvider: GeminiProvider;
    private translationService: TranslationService;
    private vault: Vault;
    private settings: EasyAIImageSettings;

    constructor(vault: Vault, settings: EasyAIImageSettings) {
        this.vault = vault;
        this.settings = settings;
        this.openaiProvider = new OpenAIProvider(settings.openaiApiKey);
        this.geminiProvider = new GeminiProvider(settings.geminiApiKey);
        this.translationService = new TranslationService(
            settings.openaiApiKey,
            settings.geminiApiKey,
            settings.provider
        );
    }

    updateSettings(settings: EasyAIImageSettings): void {
        this.settings = settings;
        this.openaiProvider.updateApiKey(settings.openaiApiKey);
        this.geminiProvider.updateApiKey(settings.geminiApiKey);
        this.translationService.updateKeys(
            settings.openaiApiKey,
            settings.geminiApiKey,
            settings.provider
        );
    }

    private getSizeString(size: ImageSize, provider: APIProvider): string {
        return provider === 'openai' 
            ? OPENAI_SIZE_MAP[size] 
            : GEMINI_SIZE_MAP[size];
    }

    async translatePrompt(prompt: string): Promise<string> {
        if (!this.settings.autoTranslate) {
            return prompt;
        }
        return this.translationService.translate(prompt);
    }

    containsKorean(text: string): boolean {
        return this.translationService.containsKorean(text);
    }

    async generate(options: GenerationOptions): Promise<GenerationResult> {
        const { prompt, size, style, provider } = options;

        try {
            const apiKey = provider === 'openai' 
                ? this.settings.openaiApiKey 
                : this.settings.geminiApiKey;

            if (!apiKey) {
                return {
                    success: false,
                    error: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key is not configured. Please add your API key in plugin settings.`,
                };
            }

            const sizeString = this.getSizeString(size, provider);
            
            const selectedProvider = provider === 'openai' 
                ? this.openaiProvider 
                : this.geminiProvider;

            const imageData = await selectedProvider.generate(prompt, sizeString, style);
            const imagePath = await saveImage(this.vault, imageData, this.settings.saveLocation);

            return {
                success: true,
                imagePath: imagePath,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    getObsidianLink(imagePath: string): string {
        return getObsidianImageLink(imagePath);
    }
}
