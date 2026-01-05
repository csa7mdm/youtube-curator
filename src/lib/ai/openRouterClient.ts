/**
 * The Brain Interface - OpenRouter Client
 * 
 * A concrete implementation of AIProvider using OpenRouter.
 * OpenRouter provides access to multiple AI models through a unified API.
 * 
 * Key features:
 * - Fetches available models and filters for free ones
 * - Sorts by context length (critical for video analysis)
 * - Constructs NotebookLM-style prompts for deep analysis
 */

import type { VideoMetadata, AnalysisResult, ModelInfo } from '../common/types';
import type {
    AIProvider,
    AIProviderConfig,
    KeyValidationResult,
    OpenRouterModelsResponse,
    OpenRouterKeyInfo,
    ChatCompletionRequest,
    ChatCompletionResponse,
    OpenRouterModel,
} from './types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterClient implements AIProvider {
    readonly name = 'OpenRouter';

    private apiKey: string;
    private modelId: string;
    private maxTokens: number;
    private temperature: number;
    private cachedModels: ModelInfo[] | null = null;

    constructor(config: AIProviderConfig) {
        this.apiKey = config.apiKey;
        this.modelId = config.modelId || 'meta-llama/llama-3.1-8b-instruct:free';
        this.maxTokens = config.maxTokens || 4096;
        this.temperature = config.temperature || 0.7;
    }

    /**
     * Validate API key using OpenRouter's /auth/key endpoint
     */
    async validateKey(): Promise<KeyValidationResult> {
        try {
            const response = await fetch(`${OPENROUTER_BASE_URL}/auth/key`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return {
                    isValid: false,
                    error: `API key validation failed: ${response.status}`,
                };
            }

            const data = await response.json() as OpenRouterKeyInfo;

            return {
                isValid: true,
                rateLimit: {
                    requestsPerMinute: data.data.rate_limit.requests,
                    tokensPerMinute: 0, // Not provided by OpenRouter
                },
                usage: data.data.limit !== null ? {
                    used: data.data.usage,
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
     * Get available models, filtered to free models and sorted by context length
     */
    async getAvailableModels(): Promise<ModelInfo[]> {
        if (this.cachedModels) {
            return this.cachedModels;
        }

        const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json() as OpenRouterModelsResponse;

        // Filter for free models
        const freeModels = data.data.filter((model: OpenRouterModel) =>
            model.pricing.prompt === '0' && model.pricing.completion === '0'
        );

        // Sort by context length (descending) - larger context is better for video analysis
        freeModels.sort((a, b) => b.context_length - a.context_length);

        // Map to our ModelInfo interface
        this.cachedModels = freeModels.map(model => ({
            id: model.id,
            name: model.name,
            contextLength: model.context_length,
            isFree: true,
            provider: model.id.split('/')[0] || 'unknown',
        }));

        return this.cachedModels;
    }

    /**
     * Analyze videos with NotebookLM-style deep synthesis
     */
    async analyzeVideos(videos: VideoMetadata[]): Promise<AnalysisResult> {
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(videos);

        const request: ChatCompletionRequest = {
            model: this.modelId,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            response_format: { type: 'json_object' },
        };

        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as ChatCompletionResponse;
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content in AI response');
        }

        return this.parseAnalysisResponse(content);
    }

    /**
     * Update the model to use
     */
    setModel(modelId: string): void {
        this.modelId = modelId;
    }

    /**
     * Build the system prompt for NotebookLM-style analysis
     */
    private buildSystemPrompt(): string {
        return `You are a YouTube content analyst with the depth and synthesis capabilities of NotebookLM.
Your task is to analyze a user's YouTube playlist and provide a comprehensive briefing.

You must respond with a valid JSON object matching this exact structure:
{
  "themes": [
    {
      "name": "Theme Name",
      "description": "Description of this theme",
      "videoCount": 5,
      "relevantVideoIds": ["id1", "id2"]
    }
  ],
  "categories": [
    {
      "name": "Category Name",
      "videos": [...video objects from input],
      "rationale": "Why these videos belong together"
    }
  ],
  "summary": "Executive summary of the entire playlist...",
  "recommendations": [
    {
      "videoId": "abc123",
      "reason": "Why watch this first",
      "priority": "high"
    }
  ],
  "connections": [
    {
      "sourceVideoId": "id1",
      "targetVideoId": "id2",
      "relationship": "How these videos relate"
    }
  ]
}

Guidelines:
1. Identify 3-7 major THEMES that span multiple videos
2. Create 3-5 logical CATEGORIES grouping related content
3. Write a 2-3 paragraph SUMMARY synthesizing key insights
4. Recommend 3-5 videos to watch first with clear reasoning
5. Find 3-5 interesting CONNECTIONS between videos
6. Be specific and reference actual video titles
7. Priority levels are: "high", "medium", "low"`;
    }

    /**
     * Build the user prompt with video data
     */
    private buildUserPrompt(videos: VideoMetadata[]): string {
        const videoList = videos.map((v, i) =>
            `${i + 1}. [${v.id}] "${v.title}" by ${v.channel} (${v.duration})`
        ).join('\n');

        return `Analyze this YouTube playlist with ${videos.length} videos:

${videoList}

Provide a comprehensive analysis identifying themes, creating logical categories, writing an executive summary, recommending a viewing order, and finding connections between videos.`;
    }

    /**
     * Parse the AI response into AnalysisResult
     */
    private parseAnalysisResponse(content: string): AnalysisResult {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                themes: parsed.themes || [],
                categories: parsed.categories || [],
                summary: parsed.summary || 'Analysis complete.',
                recommendations: parsed.recommendations || [],
                connections: parsed.connections || [],
                modelUsed: this.modelId,
                analyzedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error('[OpenRouter] Failed to parse response:', error);

            // Return a minimal valid result
            return {
                themes: [],
                categories: [],
                summary: content.slice(0, 500),
                recommendations: [],
                connections: [],
                modelUsed: this.modelId,
                analyzedAt: new Date().toISOString(),
            };
        }
    }

    /**
     * Get headers for API requests
     */
    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'chrome-extension://youtube-curator',
            'X-Title': 'YouTube Curator',
        };
    }
}

/**
 * Factory function to create an OpenRouter client
 */
export function createOpenRouterClient(config: AIProviderConfig): AIProvider {
    return new OpenRouterClient(config);
}
