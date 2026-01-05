/**
 * SettingsPage Component
 * 
 * Manages API key and model selection.
 */

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, cacheModels, getCachedModels } from '../../lib/settings/storage';
import { validateApiKey, maskApiKey } from '../../lib/settings/validation';
import { createOpenRouterClient } from '../../lib/ai/openRouterClient';
import type { UserSettings, ModelInfo } from '../../lib/common/types';

type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings>({
        apiKey: '',
        selectedModel: '',
        theme: 'system',
    });
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings on mount
    useEffect(() => {
        async function loadSettings() {
            const stored = await getSettings();
            setSettings(stored);
            if (stored.apiKey) {
                setApiKeyInput(stored.apiKey);
                setValidationStatus('valid');
            }

            // Load cached models
            const cachedModels = await getCachedModels();
            if (cachedModels.length > 0) {
                setModels(cachedModels);
            }
        }
        loadSettings();
    }, []);

    // Validate API key when input changes (debounced)
    useEffect(() => {
        if (!apiKeyInput || apiKeyInput === settings.apiKey) {
            return;
        }

        const timer = setTimeout(async () => {
            setValidationStatus('checking');
            setValidationError(null);

            const result = await validateApiKey(apiKeyInput);

            if (result.isValid) {
                setValidationStatus('valid');
                // Fetch models with this key
                await loadModels(apiKeyInput);
            } else {
                setValidationStatus('invalid');
                setValidationError(result.error || 'Invalid API key');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [apiKeyInput]);

    async function loadModels(apiKey: string) {
        setIsLoadingModels(true);
        try {
            const client = createOpenRouterClient({ apiKey });
            const fetchedModels = await client.getAvailableModels();
            setModels(fetchedModels);
            await cacheModels(fetchedModels);

            // Auto-select first model if none selected
            if (!settings.selectedModel && fetchedModels.length > 0) {
                setSettings(prev => ({ ...prev, selectedModel: fetchedModels[0].id }));
            }
        } catch (error) {
            console.error('Failed to load models:', error);
        } finally {
            setIsLoadingModels(false);
        }
    }

    async function handleSave() {
        setIsSaving(true);
        try {
            await saveSettings({
                apiKey: apiKeyInput,
                selectedModel: settings.selectedModel,
                theme: settings.theme,
            });
            setSettings(prev => ({ ...prev, apiKey: apiKeyInput }));
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    }



    return (
        <div className="settings">
            <div className="settings__group">
                <label className="settings__label">OpenRouter API Key</label>
                <input
                    type="password"
                    className="settings__input"
                    placeholder="sk-or-v1-..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <div className={`settings__status settings__status--${validationStatus}`}>
                    {validationStatus === 'checking' && '⏳ Validating...'}
                    {validationStatus === 'valid' && '✓ API key is valid'}
                    {validationStatus === 'invalid' && `✗ ${validationError}`}
                    {validationStatus === 'idle' && 'Enter your OpenRouter API key'}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Get your free API key at{' '}
                    <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        openrouter.ai/keys
                    </a>
                </p>
            </div>

            <div className="settings__group">
                <label className="settings__label">
                    AI Model {isLoadingModels && '(Loading...)'}
                </label>
                <select
                    className="settings__select"
                    value={settings.selectedModel}
                    onChange={(e) => setSettings(prev => ({ ...prev, selectedModel: e.target.value }))}
                    disabled={models.length === 0}
                >
                    {models.length === 0 ? (
                        <option value="">Add API key to load models</option>
                    ) : (
                        models.map(model => (
                            <option key={model.id} value={model.id}>
                                {model.name} ({Math.round(model.contextLength / 1000)}K context)
                            </option>
                        ))
                    )}
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Only free models are shown, sorted by context length
                </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    className="button button--primary"
                    onClick={handleSave}
                    disabled={validationStatus !== 'valid' || isSaving}
                    style={{ flex: 1 }}
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {settings.apiKey && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    fontSize: '12px'
                }}>
                    <div style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
                        <strong>Current Configuration</strong>
                    </div>
                    <div>API Key: {maskApiKey(settings.apiKey)}</div>
                    <div>Model: {settings.selectedModel || 'Not selected'}</div>
                </div>
            )}
        </div>
    );
}
