import { App, Modal, Setting, Notice, DropdownComponent, TextAreaComponent, ButtonComponent } from 'obsidian';
import type { EasyAIImageSettings, ImageSize, APIProvider, GenerationResult } from '../types';
import { SIZE_DESCRIPTIONS, DALLE_STYLE_DESCRIPTIONS, GEMINI_STYLE_DESCRIPTIONS } from '../constants';
import type { ImageGeneratorService } from '../services/ImageGeneratorService';
import type { HistoryManager } from '../history/HistoryManager';

export interface GenerateImageModalResult {
    imagePath: string;
    obsidianLink: string;
    originalPrompt: string;
    translatedPrompt: string;
}

export class GenerateImageModal extends Modal {
    private settings: EasyAIImageSettings;
    private imageService: ImageGeneratorService;
    private historyManager: HistoryManager;
    private onSuccess: (result: GenerateImageModalResult) => void;

    private promptInput: TextAreaComponent | null = null;
    private sizeDropdown: DropdownComponent | null = null;
    private styleDropdown: DropdownComponent | null = null;
    private providerDropdown: DropdownComponent | null = null;
    private generateButton: ButtonComponent | null = null;
    private statusEl: HTMLElement | null = null;

    private currentPrompt = '';
    private currentSize: ImageSize;
    private currentStyle: string;
    private currentProvider: APIProvider;
    private isGenerating = false;

    constructor(
        app: App,
        settings: EasyAIImageSettings,
        imageService: ImageGeneratorService,
        historyManager: HistoryManager,
        onSuccess: (result: GenerateImageModalResult) => void
    ) {
        super(app);
        this.settings = settings;
        this.imageService = imageService;
        this.historyManager = historyManager;
        this.onSuccess = onSuccess;

        this.currentSize = settings.defaultSize;
        this.currentProvider = settings.provider;
        this.currentStyle = settings.provider === 'openai' 
            ? settings.defaultDallEStyle 
            : settings.defaultGeminiStyle;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.addClass('easy-ai-image-modal');

        this.setTitle('Generate AI Image');

        new Setting(contentEl)
            .setName('Prompt')
            .setDesc('Describe the image you want to generate (Korean auto-translated)')
            .addTextArea(text => {
                this.promptInput = text;
                text.setPlaceholder('A beautiful sunset over mountains...')
                    .onChange(value => {
                        this.currentPrompt = value;
                    });
                text.inputEl.rows = 4;
                text.inputEl.addClass('easy-ai-image-prompt-input');
            });

        new Setting(contentEl)
            .setName('Provider')
            .setDesc('Select AI provider')
            .addDropdown(dropdown => {
                this.providerDropdown = dropdown;
                dropdown
                    .addOption('openai', 'OpenAI (DALL-E 3)')
                    .addOption('gemini', 'Google Gemini (Imagen)')
                    .setValue(this.currentProvider)
                    .onChange((value: APIProvider) => {
                        this.currentProvider = value;
                        this.updateStyleOptions();
                    });
            });

        new Setting(contentEl)
            .setName('Size')
            .setDesc('Image dimensions')
            .addDropdown(dropdown => {
                this.sizeDropdown = dropdown;
                Object.entries(SIZE_DESCRIPTIONS).forEach(([key, desc]) => {
                    dropdown.addOption(key, desc);
                });
                dropdown
                    .setValue(this.currentSize)
                    .onChange((value: ImageSize) => {
                        this.currentSize = value;
                    });
            });

        const styleSetting = new Setting(contentEl)
            .setName('Style')
            .setDesc('Image style');
        
        styleSetting.addDropdown(dropdown => {
            this.styleDropdown = dropdown;
            this.populateStyleDropdown();
            dropdown.setValue(this.currentStyle)
                .onChange(value => {
                    this.currentStyle = value;
                });
        });

        this.statusEl = contentEl.createDiv({ cls: 'easy-ai-image-status' });

        new Setting(contentEl)
            .addButton(button => {
                this.generateButton = button;
                button
                    .setButtonText('Generate Image')
                    .setCta()
                    .onClick(() => this.handleGenerate());
            })
            .addButton(button => {
                button
                    .setButtonText('Cancel')
                    .onClick(() => this.close());
            });
    }

    private populateStyleDropdown(): void {
        if (!this.styleDropdown) return;

        const styleDescriptions = this.currentProvider === 'openai' 
            ? DALLE_STYLE_DESCRIPTIONS 
            : GEMINI_STYLE_DESCRIPTIONS;

        this.styleDropdown.selectEl.empty();
        
        Object.entries(styleDescriptions).forEach(([key, desc]) => {
            this.styleDropdown?.addOption(key, desc);
        });
    }

    private updateStyleOptions(): void {
        this.populateStyleDropdown();
        
        const defaultStyle = this.currentProvider === 'openai'
            ? this.settings.defaultDallEStyle
            : this.settings.defaultGeminiStyle;
        
        this.currentStyle = defaultStyle;
        this.styleDropdown?.setValue(defaultStyle);
    }

    private setGenerating(generating: boolean): void {
        this.isGenerating = generating;
        
        if (this.generateButton) {
            this.generateButton.setDisabled(generating);
            this.generateButton.setButtonText(generating ? 'Generating...' : 'Generate Image');
        }

        if (this.promptInput) {
            this.promptInput.setDisabled(generating);
        }

        if (this.statusEl) {
            if (generating) {
                this.statusEl.setText('Generating image, please wait...');
                this.statusEl.addClass('loading');
            } else {
                this.statusEl.setText('');
                this.statusEl.removeClass('loading');
            }
        }
    }

    private async handleGenerate(): Promise<void> {
        if (this.isGenerating) return;

        const prompt = this.currentPrompt.trim();
        if (!prompt) {
            new Notice('Please enter a prompt');
            return;
        }

        this.setGenerating(true);
        console.log('[EasyAI] Starting image generation...');
        console.log('[EasyAI] Provider:', this.currentProvider);
        console.log('[EasyAI] Prompt:', prompt);

        try {
            let translatedPrompt = prompt;

            if (this.imageService.containsKorean(prompt) && this.settings.autoTranslate) {
                if (this.statusEl) {
                    this.statusEl.setText('Translating prompt...');
                }
                console.log('[EasyAI] Translating Korean prompt...');
                translatedPrompt = await this.imageService.translatePrompt(prompt);
                console.log('[EasyAI] Translated:', translatedPrompt);
            }

            if (this.statusEl) {
                this.statusEl.setText('Generating image...');
            }

            console.log('[EasyAI] Calling image service...');
            const result: GenerationResult = await this.imageService.generate({
                prompt: translatedPrompt,
                size: this.currentSize,
                style: this.currentStyle,
                provider: this.currentProvider,
            });
            console.log('[EasyAI] Result:', result);

            if (result.success && result.imagePath) {
                await this.historyManager.addHistoryItem(
                    prompt,
                    translatedPrompt,
                    result.imagePath,
                    this.currentProvider,
                    this.currentSize,
                    this.currentStyle
                );

                const obsidianLink = this.imageService.getObsidianLink(result.imagePath);
                
                this.onSuccess({
                    imagePath: result.imagePath,
                    obsidianLink,
                    originalPrompt: prompt,
                    translatedPrompt,
                });

                new Notice('Image generated successfully!');
                this.close();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('[EasyAI] Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
            new Notice(`Error: ${errorMessage}`);
            
            if (this.statusEl) {
                this.statusEl.setText(`Error: ${errorMessage}`);
                this.statusEl.addClass('error');
            }
        } finally {
            this.setGenerating(false);
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
