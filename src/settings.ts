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

        new Setting(containerEl)
            .setName('Easy AI image generator settings')
            .setHeading();

        new Setting(containerEl)
            .setName('Default provider')
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

        new Setting(containerEl)
            .setName('API keys')
            .setHeading();

        new Setting(containerEl)
            .setName('OpenAI API key')
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
            .setName('Gemini API key')
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

        new Setting(containerEl)
            .setName('Default options')
            .setHeading();

        new Setting(containerEl)
            .setName('Default image size')
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
            .setName('Default DALL-E style')
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
            .setName('Default Gemini style')
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

        new Setting(containerEl)
            .setName('Storage')
            .setHeading();

        new Setting(containerEl)
            .setName('Save location')
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

        new Setting(containerEl)
            .setName('Translation')
            .setHeading();

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

        new Setting(containerEl)
            .setName('History')
            .setHeading();

        new Setting(containerEl)
            .setName('Max history items')
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

        new Setting(containerEl)
            .setName('Support')
            .setHeading();

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
