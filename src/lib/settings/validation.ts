/**
 * The Gatekeeper - API Validation
 * 
 * Utilities for validating OpenRouter API keys.
 */

import type { KeyValidationResult } from '../ai/types';

const OPENROUTER_AUTH_URL = 'https://openrouter.ai/api/v1/auth/key';

/**
 * Validate an OpenRouter API key
 */
export async function validateApiKey(apiKey: string): Promise<KeyValidationResult> {
    if (!apiKey || apiKey.trim().length === 0) {
        return {
            isValid: false,
            error: 'API key is required',
        };
    }

    try {
        const response = await fetch(OPENROUTER_AUTH_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return {
                    isValid: false,
                    error: 'Invalid API key',
                };
            }
            return {
                isValid: false,
                error: `Validation failed: HTTP ${response.status}`,
            };
        }

        const data = await response.json();

        return {
            isValid: true,
            rateLimit: {
                requestsPerMinute: data.data?.rate_limit?.requests || 0,
                tokensPerMinute: 0,
            },
            usage: data.data?.limit !== null ? {
                used: data.data.usage || 0,
                limit: data.data.limit,
            } : undefined,
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Network error: ${(error as Error).message}`,
        };
    }
}

/**
 * Format API key for display (mask middle characters)
 */
export function maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
        return '*'.repeat(apiKey.length);
    }
    const start = apiKey.slice(0, 4);
    const end = apiKey.slice(-4);
    const middle = '*'.repeat(Math.min(apiKey.length - 8, 20));
    return `${start}${middle}${end}`;
}
