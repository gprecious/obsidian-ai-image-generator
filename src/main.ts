import { Plugin, Editor, MarkdownView } from 'obsidian';
import { HistoryManager } from './history/HistoryManager';
import { ImageGeneratorService } from './services/ImageGeneratorService';
import { EasyAIImageSettingTab } from './settings';
import { GenerateImageModal, GenerateImageModalResult } from './modals/GenerateImageModal';
import { HistoryModal } from './modals/HistoryModal';

export default class EasyAIImagePlugin extends Plugin {
    private historyManager!: HistoryManager;
    private imageService!: ImageGeneratorService;

    async onload(): Promise<void> {
        this.historyManager = new HistoryManager(this);
        const { settings } = await this.historyManager.loadData();

        this.imageService = new ImageGeneratorService(this.app.vault, settings);

        this.addRibbonIcon('image', 'AI Image History', () => {
            this.openHistoryModal();
        });

        this.addCommand({
            id: 'generate-ai-image',
            name: 'Generate AI Image',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                this.openGenerateModal(editor);
            },
        });

        this.addCommand({
            id: 'open-ai-image-history',
            name: 'Open Image History',
            callback: () => {
                this.openHistoryModal();
            },
        });

        this.addSettingTab(new EasyAIImageSettingTab(
            this.app,
            this,
            this.historyManager,
            () => this.onSettingsChange()
        ));
    }

    private onSettingsChange(): void {
        const settings = this.historyManager.getSettings();
        this.imageService.updateSettings(settings);
    }

    private openGenerateModal(editor: Editor): void {
        const settings = this.historyManager.getSettings();
        
        const modal = new GenerateImageModal(
            this.app,
            settings,
            this.imageService,
            this.historyManager,
            (result: GenerateImageModalResult) => {
                editor.replaceSelection(result.obsidianLink);
            }
        );
        modal.open();
    }

    private openHistoryModal(): void {
        const settings = this.historyManager.getSettings();
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        
        const modal = new HistoryModal(
            this.app,
            this.historyManager,
            this.imageService,
            settings,
            (obsidianLink: string) => {
                if (activeView) {
                    activeView.editor.replaceSelection(obsidianLink);
                }
            },
            (result: GenerateImageModalResult) => {
                if (activeView) {
                    activeView.editor.replaceSelection(result.obsidianLink);
                }
            }
        );
        modal.open();
    }

    onunload(): void {}
}
