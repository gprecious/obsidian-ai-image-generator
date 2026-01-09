import { Vault, TFolder, normalizePath } from 'obsidian';
import { generateFilename } from './dateUtils';

export async function ensureFolderExists(vault: Vault, folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);
    const folder = vault.getAbstractFileByPath(normalizedPath);
    
    if (!folder) {
        await vault.createFolder(normalizedPath);
    } else if (!(folder instanceof TFolder)) {
        throw new Error(`Path exists but is not a folder: ${normalizedPath}`);
    }
}

export async function saveImage(
    vault: Vault,
    imageData: ArrayBuffer,
    saveLocation: string
): Promise<string> {
    await ensureFolderExists(vault, saveLocation);
    
    const filename = generateFilename();
    const filePath = normalizePath(`${saveLocation}/${filename}`);
    
    await vault.createBinary(filePath, imageData);
    
    return filePath;
}

export function getObsidianImageLink(filePath: string): string {
    const filename = filePath.split('/').pop() || filePath;
    return `![[${filename}]]`;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
