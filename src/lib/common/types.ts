/**
 * Shared Types - The Foundation
 * 
 * This module defines all shared types used across the extension.
 * It serves as the contract between all agents/modules.
 */

// ============================================================
// VIDEO METADATA (Agent 2: The Mechanic)
// ============================================================

export interface VideoMetadata {
    /** YouTube video ID (e.g., "dQw4w9WgXcQ") */
    id: string;
    /** Full YouTube URL */
    url: string;
    /** Video title */
    title: string;
    /** Channel name */
    channel: string;
    /** Channel URL */
    channelUrl: string;
    /** Duration in "HH:MM:SS" or "MM:SS" format */
    duration: string;
    /** Thumbnail URL */
    thumbnail: string;
    /** Position in playlist */
    index: number;
    /** When added to playlist (if available) */
    addedDate?: string;
}

// ============================================================
// AI ANALYSIS (Agent 3: The Brain Interface)
// ============================================================

export interface AnalysisResult {
    /** Main themes discovered across all videos */
    themes: Theme[];
    /** Videos grouped by AI-detected categories */
    categories: CategoryGroup[];
    /** Executive summary of the playlist content */
    summary: string;
    /** AI recommendations on what to watch first */
    recommendations: Recommendation[];
    /** Discovered connections between videos */
    connections: Connection[];
    /** Model used for analysis */
    modelUsed: string;
    /** Timestamp of analysis */
    analyzedAt: string;
}

export interface Theme {
    name: string;
    description: string;
    videoCount: number;
    relevantVideoIds: string[];
}

export interface CategoryGroup {
    name: string;
    videos: VideoMetadata[];
    rationale: string;
}

export interface Recommendation {
    videoId: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
}

export interface Connection {
    sourceVideoId: string;
    targetVideoId: string;
    relationship: string;
}

// ============================================================
// SETTINGS (Agent 5: The Gatekeeper)
// ============================================================

export interface UserSettings {
    /** OpenRouter API key */
    apiKey: string;
    /** Selected model ID */
    selectedModel: string;
    /** Theme preference */
    theme: 'light' | 'dark' | 'system';
    /** Last validated timestamp */
    apiKeyValidatedAt?: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    contextLength: number;
    isFree: boolean;
    provider: string;
}

// ============================================================
// EXTENSION STATE
// ============================================================

export type ScanStatus =
    | 'idle'
    | 'scrolling'
    | 'parsing'
    | 'analyzing'
    | 'complete'
    | 'error';

export interface ExtensionState {
    status: ScanStatus;
    progress: ScanProgress | null;
    videos: VideoMetadata[];
    analysis: AnalysisResult | null;
    error: string | null;
    lastScanAt: string | null;
}

export interface ScanProgress {
    current: number;
    total: number;
    phase: 'scrolling' | 'parsing' | 'analyzing';
    message: string;
}
