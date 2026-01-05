/**
 * ModelSelector Component
 * 
 * A dropdown for selecting AI models with context length info.
 */

import type { ModelInfo } from '../../lib/common/types';

interface ModelSelectorProps {
    models: ModelInfo[];
    selectedModel: string;
    onSelect: (modelId: string) => void;
    isLoading: boolean;
    disabled: boolean;
}

export function ModelSelector({
    models,
    selectedModel,
    onSelect,
    isLoading,
    disabled
}: ModelSelectorProps) {
    return (
        <div className="settings__group">
            <label className="settings__label">
                AI Model {isLoading && '(Loading...)'}
            </label>
            <select
                className="settings__select"
                value={selectedModel}
                onChange={(e) => onSelect(e.target.value)}
                disabled={disabled || models.length === 0}
            >
                {models.length === 0 ? (
                    <option value="">No models available</option>
                ) : (
                    models.map(model => (
                        <option key={model.id} value={model.id}>
                            {model.name} • {formatContextLength(model.contextLength)}
                        </option>
                    ))
                )}
            </select>
        </div>
    );
}

function formatContextLength(length: number): string {
    if (length >= 1000000) {
        return `${Math.round(length / 1000000)}M ctx`;
    }
    if (length >= 1000) {
        return `${Math.round(length / 1000)}K ctx`;
    }
    return `${length} ctx`;
}
