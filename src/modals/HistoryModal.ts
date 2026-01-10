import { App, Modal, Setting, Notice, ButtonComponent, TFile } from 'obsidian';
import type { HistoryItem, EasyAIImageSettings } from '../types';
import type { HistoryManager } from '../history/HistoryManager';
import type { ImageGeneratorService } from '../services/ImageGeneratorService';
import { formatDisplayDate } from '../utils/dateUtils';
import { GenerateImageModal, GenerateImageModalResult } from './GenerateImageModal';

class ImagePreviewModal extends Modal {
    private imagePath: string;

    constructor(app: App, imagePath: string) {
        super(app);
        this.imagePath = imagePath;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.addClass('easy-ai-image-preview-modal');

        const file = this.app.vault.getAbstractFileByPath(this.imagePath);
        if (file instanceof TFile) {
            const img = contentEl.createEl('img');
            img.src = this.app.vault.getResourcePath(file);
            img.alt = 'Generated image';
        } else {
            contentEl.createEl('p', { text: 'Image not found' });
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export class HistoryModal extends Modal {
    private historyManager: HistoryManager;
    private imageService: ImageGeneratorService;
    private settings: EasyAIImageSettings;
    private onInsert: (obsidianLink: string) => void;
    private onRegenerate: (result: GenerateImageModalResult) => void;

    constructor(
        app: App,
        historyManager: HistoryManager,
        imageService: ImageGeneratorService,
        settings: EasyAIImageSettings,
        onInsert: (obsidianLink: string) => void,
        onRegenerate: (result: GenerateImageModalResult) => void
    ) {
        super(app);
        this.historyManager = historyManager;
        this.imageService = imageService;
        this.settings = settings;
        this.onInsert = onInsert;
        this.onRegenerate = onRegenerate;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.addClass('easy-ai-image-history-modal');

        this.setTitle('Image generation history');
        this.renderContent();
    }

    private renderContent(): void {
        const { contentEl } = this;
        contentEl.empty();

        const history = this.historyManager.getHistory();

        if (history.length === 0) {
            contentEl.createEl('p', { 
                text: 'No images generated yet. Use the "Generate AI Image" command to create your first image.',
                cls: 'easy-ai-image-empty-state'
            });
            return;
        }

        const headerDiv = contentEl.createDiv({ cls: 'easy-ai-image-history-header' });
        
        new Setting(headerDiv)
            .setName(`${history.length} image(s) in history`)
            .addButton(button => {
                button
                    .setButtonText('Clear all')
                    .setWarning()
                    .onClick(async () => {
                        await this.historyManager.clearHistory();
                        this.renderContent();
                        new Notice('History cleared');
                    });
            });

        const listEl = contentEl.createDiv({ cls: 'easy-ai-image-history-list' });

        history.forEach(item => {
            this.renderHistoryItem(listEl, item);
        });
    }

    private renderHistoryItem(container: HTMLElement, item: HistoryItem): void {
        const itemEl = container.createDiv({ cls: 'easy-ai-image-history-item' });

        // Thumbnail
        const thumbnailEl = itemEl.createDiv({ cls: 'easy-ai-image-history-thumbnail' });
        const file = this.app.vault.getAbstractFileByPath(item.imagePath);

        if (file instanceof TFile) {
            const img = thumbnailEl.createEl('img');
            img.src = this.app.vault.getResourcePath(file);
            img.alt = 'Generated Image';
            thumbnailEl.addEventListener('click', () => {
                new ImagePreviewModal(this.app, item.imagePath).open();
            });
        } else {
            const placeholder = thumbnailEl.createDiv({ cls: 'easy-ai-image-history-thumbnail-placeholder' });
            placeholder.setText('Not found');
        }

        // Content wrapper
        const contentEl = itemEl.createDiv({ cls: 'easy-ai-image-history-content' });

        const infoEl = contentEl.createDiv({ cls: 'easy-ai-image-history-info' });

        const promptEl = infoEl.createDiv({ cls: 'easy-ai-image-history-prompt' });
        promptEl.setText(item.originalPrompt);

        if (item.originalPrompt !== item.translatedPrompt) {
            const translatedEl = infoEl.createDiv({ cls: 'easy-ai-image-history-translated' });
            translatedEl.setText(`→ ${item.translatedPrompt}`);
        }

        const metaEl = infoEl.createDiv({ cls: 'easy-ai-image-history-meta' });
        metaEl.setText(`${item.provider.toUpperCase()} • ${item.size} • ${item.style} • ${formatDisplayDate(item.timestamp)}`);

        const actionsEl = contentEl.createDiv({ cls: 'easy-ai-image-history-actions' });

        new ButtonComponent(actionsEl)
            .setButtonText('Insert')
            .setTooltip('Insert image link at cursor')
            .onClick(() => {
                const link = this.imageService.getObsidianLink(item.imagePath);
                this.onInsert(link);
                this.close();
                new Notice('Image link inserted');
            });

        new ButtonComponent(actionsEl)
            .setButtonText('Regenerate')
            .setTooltip('Generate a new image with the same prompt')
            .onClick(() => {
                this.close();
                const modal = new GenerateImageModal(
                    this.app,
                    {
                        ...this.settings,
                        provider: item.provider,
                        defaultSize: item.size,
                    },
                    this.imageService,
                    this.historyManager,
                    this.onRegenerate
                );
                modal.open();
            });

        new ButtonComponent(actionsEl)
            .setButtonText('Delete')
            .setWarning()
            .setTooltip('Remove from history')
            .onClick(async () => {
                await this.historyManager.deleteHistoryItem(item.id);
                this.renderContent();
                new Notice('Item removed from history');
            });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
