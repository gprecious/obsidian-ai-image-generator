import { App, PluginSettingTab, Setting } from 'obsidian';
import type { Plugin } from 'obsidian';
import type { EasyAIImageSettings, APIProvider, ImageSize, DallEStyle, GeminiStyle } from './types';
import { 
    SIZE_DESCRIPTIONS, 
    DALLE_STYLE_DESCRIPTIONS, 
    GEMINI_STYLE_DESCRIPTIONS,
    PLUGIN_INFO 
} from './constants';
import type { HistoryManager } from './history/HistoryManager';

export class EasyAIImageSettingTab extends PluginSettingTab {
    private plugin: Plugin;
    private historyManager: HistoryManager;
    private onSettingsChange: () => void;

    constructor(
        app: App, 
        plugin: Plugin, 
        historyManager: HistoryManager,
        onSettingsChange: () => void
    ) {
        super(app, plugin);
        this.plugin = plugin;
        this.historyManager = historyManager;
        this.onSettingsChange = onSettingsChange;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('easy-ai-image-settings');

        const settings = this.historyManager.getSettings();

        containerEl.createEl('h2', { text: 'Easy AI Image Generator Settings' });

        new Setting(containerEl)
            .setName('Default Provider')
            .setDesc('Select your preferred AI provider for image generation')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('openai', 'OpenAI (DALL-E 3)')
                    .addOption('gemini', 'Google Gemini (Imagen)')
                    .setValue(settings.provider)
                    .onChange(async (value: APIProvider) => {
                        await this.historyManager.updateSettings({ provider: value });
                        this.onSettingsChange();
                        this.display();
                    });
            });

        containerEl.createEl('h3', { text: 'API Keys' });

        new Setting(containerEl)
            .setName('OpenAI API Key')
            .setDesc('Your OpenAI API key for DALL-E image generation')
            .addText(text => {
                text
                    .setPlaceholder('sk-...')
                    .setValue(settings.openaiApiKey)
                    .onChange(async value => {
                        await this.historyManager.updateSettings({ openaiApiKey: value });
                        this.onSettingsChange();
                    });
                text.inputEl.type = 'password';
                text.inputEl.addClass('easy-ai-image-api-key-input');
            });

        new Setting(containerEl)
            .setName('Gemini API Key')
            .setDesc('Your Google Gemini API key for Imagen generation')
            .addText(text => {
                text
                    .setPlaceholder('AIza...')
                    .setValue(settings.geminiApiKey)
                    .onChange(async value => {
                        await this.historyManager.updateSettings({ geminiApiKey: value });
                        this.onSettingsChange();
                    });
                text.inputEl.type = 'password';
                text.inputEl.addClass('easy-ai-image-api-key-input');
            });

        containerEl.createEl('h3', { text: 'Default Options' });

        new Setting(containerEl)
            .setName('Default Image Size')
            .setDesc('Default size for generated images')
            .addDropdown(dropdown => {
                Object.entries(SIZE_DESCRIPTIONS).forEach(([key, desc]) => {
                    dropdown.addOption(key, desc);
                });
                dropdown
                    .setValue(settings.defaultSize)
                    .onChange(async (value: ImageSize) => {
                        await this.historyManager.updateSettings({ defaultSize: value });
                        this.onSettingsChange();
                    });
            });

        new Setting(containerEl)
            .setName('Default DALL-E Style')
            .setDesc('Default style when using OpenAI DALL-E')
            .addDropdown(dropdown => {
                Object.entries(DALLE_STYLE_DESCRIPTIONS).forEach(([key, desc]) => {
                    dropdown.addOption(key, desc);
                });
                dropdown
                    .setValue(settings.defaultDallEStyle)
                    .onChange(async (value: DallEStyle) => {
                        await this.historyManager.updateSettings({ defaultDallEStyle: value });
                        this.onSettingsChange();
                    });
            });

        new Setting(containerEl)
            .setName('Default Gemini Style')
            .setDesc('Default style when using Google Gemini')
            .addDropdown(dropdown => {
                Object.entries(GEMINI_STYLE_DESCRIPTIONS).forEach(([key, desc]) => {
                    dropdown.addOption(key, desc);
                });
                dropdown
                    .setValue(settings.defaultGeminiStyle)
                    .onChange(async (value: GeminiStyle) => {
                        await this.historyManager.updateSettings({ defaultGeminiStyle: value });
                        this.onSettingsChange();
                    });
            });

        containerEl.createEl('h3', { text: 'Storage' });

        new Setting(containerEl)
            .setName('Save Location')
            .setDesc('Folder path where generated images will be saved')
            .addText(text => {
                text
                    .setPlaceholder('Attachments/')
                    .setValue(settings.saveLocation)
                    .onChange(async value => {
                        const normalizedValue = value.endsWith('/') ? value : `${value}/`;
                        await this.historyManager.updateSettings({ saveLocation: normalizedValue });
                        this.onSettingsChange();
                    });
            });

        containerEl.createEl('h3', { text: 'Translation' });

        new Setting(containerEl)
            .setName('Auto-translate Korean')
            .setDesc('Automatically translate Korean prompts to English before generating')
            .addToggle(toggle => {
                toggle
                    .setValue(settings.autoTranslate)
                    .onChange(async value => {
                        await this.historyManager.updateSettings({ autoTranslate: value });
                        this.onSettingsChange();
                    });
            });

        containerEl.createEl('h3', { text: 'History' });

        new Setting(containerEl)
            .setName('Max History Items')
            .setDesc('Maximum number of items to keep in generation history')
            .addSlider(slider => {
                slider
                    .setLimits(10, 500, 10)
                    .setValue(settings.maxHistoryItems)
                    .setDynamicTooltip()
                    .onChange(async value => {
                        await this.historyManager.updateSettings({ maxHistoryItems: value });
                        this.onSettingsChange();
                    });
            });

        containerEl.createEl('h3', { text: 'Support' });

        const supportDiv = containerEl.createDiv({ cls: 'easy-ai-image-support' });
        
        const coffeeLink = supportDiv.createEl('a', {
            href: PLUGIN_INFO.fundingUrl,
            cls: 'easy-ai-image-coffee-button',
        });
        coffeeLink.createEl('img', {
            attr: {
                src: 'https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png',
                alt: 'Buy Me A Coffee',
            },
            cls: 'easy-ai-image-coffee-img',
        });

        const linksDiv = supportDiv.createDiv({ cls: 'easy-ai-image-links' });
        linksDiv.createEl('a', {
            text: 'View on GitHub',
            href: PLUGIN_INFO.githubUrl,
        });
        linksDiv.createEl('span', { text: ' • ' });
        linksDiv.createEl('a', {
            text: 'Report an Issue',
            href: `${PLUGIN_INFO.githubUrl}/issues`,
        });
    }
}
