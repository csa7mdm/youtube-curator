/**
 * The Brain Interface - AI Provider Types
 * 
 * This module defines the abstract interface for AI providers.
 * Implementations can be swapped without changing application code.
 * 
 * REUSABILITY: This module is 100% decoupled from Chrome extension APIs.
 * Use it in any TypeScript project that needs AI abstraction.
 */

import type { VideoMetadata, AnalysisResult, ModelInfo } from '../common/types';

/**
 * Abstract interface for AI providers
 * 
 * Any AI provider (OpenRouter, direct Gemini, OpenAI, etc.) must implement this
 */
export interface AIProvider {
    /** Provider name for display */
    readonly name: string;

    /** Validate API credentials */
    validateKey(): Promise<KeyValidationResult>;

    /** Get available models */
    getAvailableModels(): Promise<ModelInfo[]>;

    /** Analyze a list of videos */
    analyzeVideos(videos: VideoMetadata[]): Promise<AnalysisResult>;
}

export interface KeyValidationResult {
    isValid: boolean;
    rateLimit?: {
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
    usage?: {
        used: number;
        limit: number;
    };
    error?: string;
}

/**
 * Configuration for AI provider initialization
 */
export interface AIProviderConfig {
    apiKey: string;
    modelId?: string;
    maxTokens?: number;
    temperature?: number;
}

/**
 * OpenRouter-specific model response
 */
export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length: number;
    pricing: {
        prompt: string;
        completion: string;
    };
    top_provider?: {
        is_moderated: boolean;
    };
}

/**
 * OpenRouter models list response
 */
export interface OpenRouterModelsResponse {
    data: OpenRouterModel[];
}

/**
 * OpenRouter key info response
 */
export interface OpenRouterKeyInfo {
    data: {
        label?: string;
        usage: number;
        limit: number | null;
        is_free_tier: boolean;
        rate_limit: {
            requests: number;
            interval: string;
        };
    };
}

/**
 * OpenRouter chat completion request
 */
export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    max_tokens?: number;
    temperature?: number;
    response_format?: {
        type: 'json_object';
    };
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * OpenRouter chat completion response
 */
export interface ChatCompletionResponse {
    id: string;
    choices: {
        message: {
            role: 'assistant';
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
