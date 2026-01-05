/**
 * The Gatekeeper - Settings Storage
 * 
 * Type-safe wrapper around chrome.storage for managing user settings.
 * Provides a simple API for reading/writing settings with defaults.
 */

import type { UserSettings, ModelInfo } from '../common/types';

const STORAGE_KEYS = {
    SETTINGS: 'userSettings',
    CACHED_MODELS: 'cachedModels',
    LAST_ANALYSIS: 'lastAnalysis',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
    apiKey: '',
    selectedModel: 'meta-llama/llama-3.1-8b-instruct:free',
    theme: 'system',
};

/**
 * Get user settings from storage
 */
export async function getSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
        chrome.storage.sync.get(STORAGE_KEYS.SETTINGS, (result) => {
            const stored = result[STORAGE_KEYS.SETTINGS];
            resolve({ ...DEFAULT_SETTINGS, ...stored });
        });
    });
}

/**
 * Save user settings to storage
 */
export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
    const current = await getSettings();
    const updated = { ...current, ...settings };

    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get API key from storage
 */
export async function getApiKey(): Promise<string> {
    const settings = await getSettings();
    return settings.apiKey;
}

/**
 * Save API key to storage
 */
export async function saveApiKey(apiKey: string): Promise<void> {
    return saveSettings({
        apiKey,
        apiKeyValidatedAt: new Date().toISOString()
    });
}

/**
 * Get cached models from storage
 */
export async function getCachedModels(): Promise<ModelInfo[]> {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEYS.CACHED_MODELS, (result) => {
            resolve(result[STORAGE_KEYS.CACHED_MODELS] || []);
        });
    });
}

/**
 * Save models to cache
 */
export async function cacheModels(models: ModelInfo[]): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEYS.CACHED_MODELS]: models }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Clear all stored data
 */
export async function clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
            chrome.storage.sync.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    });
}

/**
 * Check if API key is configured
 */
export async function hasApiKey(): Promise<boolean> {
    const key = await getApiKey();
    return key.length > 0;
}
