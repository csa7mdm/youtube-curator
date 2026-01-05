/**
 * YouTube Mechanics - Type Definitions
 * 
 * This module defines types specific to YouTube DOM parsing.
 * It's separate from the common types as it may evolve with YouTube's DOM changes.
 */

// Re-export the core VideoMetadata from common types
export type { VideoMetadata } from '../common/types';

/**
 * Configuration for the infinite scroller
 */
export interface ScrollerConfig {
    /** Target container selector */
    containerSelector: string;
    /** Delay between scroll attempts (ms) */
    scrollDelay: number;
    /** Maximum wait time for new content (ms) */
    maxWaitTime: number;
    /** How far from bottom to trigger scroll (px) */
    scrollThreshold: number;
    /** Maximum number of scroll attempts before giving up */
    maxAttempts: number;
}

/**
 * Progress event emitted during scrolling
 */
export interface ScrollProgress {
    /** Number of items currently loaded */
    loaded: number;
    /** Estimated total items (may change as we scroll) */
    estimatedTotal: number;
    /** Whether scrolling is complete */
    isComplete: boolean;
    /** Current scroll position */
    scrollPosition: number;
}

/**
 * Result of a scroll operation
 */
export interface ScrollResult {
    success: boolean;
    totalScrolled: number;
    itemsFound: number;
    error?: string;
}

/**
 * YouTube DOM selectors - centralized for easy updates
 */
export const YOUTUBE_SELECTORS = {
    // Playlist page selectors
    PLAYLIST_CONTAINER: 'ytd-playlist-video-list-renderer',
    PLAYLIST_ITEM: 'ytd-playlist-video-renderer',

    // Video metadata selectors (within a playlist item)
    VIDEO_TITLE: '#video-title',
    VIDEO_LINK: 'a#video-title',
    CHANNEL_NAME: '#channel-name a, ytd-channel-name a',
    CHANNEL_LINK: '#channel-name a',
    DURATION: 'span.ytd-thumbnail-overlay-time-status-renderer',
    THUMBNAIL: 'ytd-thumbnail img',
    INDEX: '#index',

    // Watch Later specific
    WATCH_LATER_CONTAINER: 'ytd-playlist-video-list-renderer[playlist-id="WL"]',

    // Scroll detection
    SPINNER: 'ytd-continuation-item-renderer',
    END_MESSAGE: '#contents > yt-formatted-string',
} as const;

/**
 * YouTube URL patterns
 */
export const YOUTUBE_PATTERNS = {
    VIDEO_ID_REGEX: /(?:v=|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    PLAYLIST_ID_REGEX: /[?&]list=([a-zA-Z0-9_-]+)/,
    CHANNEL_ID_REGEX: /\/(channel|c|user|@)\/([^\/\?]+)/,
} as const;
