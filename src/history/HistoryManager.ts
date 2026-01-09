import type { Plugin } from 'obsidian';
import type { HistoryItem, PluginData, EasyAIImageSettings, APIProvider, ImageSize } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { generateUniqueId } from '../utils/dateUtils';

export class HistoryManager {
    private plugin: Plugin;
    private history: HistoryItem[] = [];
    private settings: EasyAIImageSettings = DEFAULT_SETTINGS;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    async loadData(): Promise<{ settings: EasyAIImageSettings; history: HistoryItem[] }> {
        const data = await this.plugin.loadData() as PluginData | null;
        
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
        this.history = data?.history || [];
        
        return { settings: this.settings, history: this.history };
    }

    async saveData(): Promise<void> {
        const data: PluginData = {
            settings: this.settings,
            history: this.history,
        };
        await this.plugin.saveData(data);
    }

    getSettings(): EasyAIImageSettings {
        return this.settings;
    }

    async updateSettings(settings: Partial<EasyAIImageSettings>): Promise<void> {
        this.settings = { ...this.settings, ...settings };
        await this.saveData();
    }

    getHistory(): HistoryItem[] {
        return [...this.history];
    }

    async addHistoryItem(
        originalPrompt: string,
        translatedPrompt: string,
        imagePath: string,
        provider: APIProvider,
        size: ImageSize,
        style: string
    ): Promise<HistoryItem> {
        const item: HistoryItem = {
            id: generateUniqueId(),
            originalPrompt,
            translatedPrompt,
            imagePath,
            timestamp: Date.now(),
            provider,
            size,
            style,
        };

        this.history.unshift(item);

        if (this.history.length > this.settings.maxHistoryItems) {
            this.history = this.history.slice(0, this.settings.maxHistoryItems);
        }

        await this.saveData();
        return item;
    }

    async deleteHistoryItem(id: string): Promise<void> {
        this.history = this.history.filter(item => item.id !== id);
        await this.saveData();
    }

    async clearHistory(): Promise<void> {
        this.history = [];
        await this.saveData();
    }

    getHistoryItemById(id: string): HistoryItem | undefined {
        return this.history.find(item => item.id === id);
    }
}
