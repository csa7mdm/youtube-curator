/**
 * The Mechanic - YouTube DOM Parser
 * 
 * A standalone module that parses YouTube playlist pages to extract
 * video metadata. Handles the messy reality of YouTube's DOM.
 * 
 * REUSABILITY: This module has ZERO dependencies on Chrome extension APIs.
 * It works purely with the DOM and can be used in any YouTube scraping context.
 */

import type { VideoMetadata } from '../common/types';
import { YOUTUBE_SELECTORS, YOUTUBE_PATTERNS } from './types';

/**
 * Parse all videos from a playlist container
 */
export function parsePlaylistVideos(
    container: Element | Document = document
): VideoMetadata[] {
    const items = container.querySelectorAll(YOUTUBE_SELECTORS.PLAYLIST_ITEM);
    const videos: VideoMetadata[] = [];

    items.forEach((item, index) => {
        const video = parseVideoElement(item, index);
        if (video) {
            videos.push(video);
        }
    });

    return videos;
}

/**
 * Parse a single video element
 */
export function parseVideoElement(
    element: Element,
    fallbackIndex: number
): VideoMetadata | null {
    try {
        // Get video URL and ID
        const linkElement = element.querySelector(YOUTUBE_SELECTORS.VIDEO_LINK) as HTMLAnchorElement | null;
        if (!linkElement?.href) {
            return null;
        }

        const url = linkElement.href;
        const id = extractVideoId(url);
        if (!id) {
            return null;
        }

        // Get title
        const title = cleanText(linkElement.title || linkElement.textContent || '');
        if (!title) {
            return null;
        }

        // Get channel info
        const channelElement = element.querySelector(YOUTUBE_SELECTORS.CHANNEL_NAME) as HTMLAnchorElement | null;
        const channel = cleanText(channelElement?.textContent || 'Unknown Channel');
        const channelUrl = channelElement?.href || '';

        // Get duration
        const durationElement = element.querySelector(YOUTUBE_SELECTORS.DURATION);
        const duration = cleanText(durationElement?.textContent || '0:00');

        // Get thumbnail
        const thumbnailElement = element.querySelector(YOUTUBE_SELECTORS.THUMBNAIL) as HTMLImageElement | null;
        const thumbnail = getThumbnailUrl(thumbnailElement, id);

        // Get index
        const indexElement = element.querySelector(YOUTUBE_SELECTORS.INDEX);
        const indexText = indexElement?.textContent?.trim();
        const index = indexText ? parseInt(indexText, 10) - 1 : fallbackIndex;

        return {
            id,
            url,
            title,
            channel,
            channelUrl,
            duration,
            thumbnail,
            index,
        };
    } catch (error) {
        console.warn('[Parser] Failed to parse video element:', error);
        return null;
    }
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
    const match = url.match(YOUTUBE_PATTERNS.VIDEO_ID_REGEX);
    return match ? match[1] : null;
}

/**
 * Get thumbnail URL, with fallback to standard thumbnail
 */
function getThumbnailUrl(
    imgElement: HTMLImageElement | null,
    videoId: string
): string {
    if (imgElement?.src && !imgElement.src.includes('data:')) {
        return imgElement.src;
    }
    // Fallback to standard YouTube thumbnail
    return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Clean text content
 */
function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n/g, '')
        .trim();
}

/**
 * Get playlist metadata from the page
 */
export function parsePlaylistMetadata(): {
    title: string;
    videoCount: number;
    isWatchLater: boolean;
} {
    // Get playlist title
    const titleElement = document.querySelector(
        'yt-formatted-string.ytd-playlist-sidebar-primary-info-renderer'
    );
    const title = cleanText(titleElement?.textContent || 'Untitled Playlist');

    // Get video count
    const statsElement = document.querySelector(
        'yt-formatted-string.style-scope.ytd-playlist-sidebar-primary-info-renderer'
    );
    let videoCount = 0;
    if (statsElement?.textContent) {
        const match = statsElement.textContent.match(/(\d+)/);
        if (match) {
            videoCount = parseInt(match[1], 10);
        }
    }

    // Check if Watch Later
    const isWatchLater = window.location.href.includes('list=WL');

    return { title, videoCount, isWatchLater };
}

/**
 * Check if the current page is a playlist page
 */
export function isPlaylistPage(): boolean {
    return (
        window.location.hostname.includes('youtube.com') &&
        (
            window.location.pathname.includes('/playlist') ||
            window.location.search.includes('list=')
        )
    );
}

/**
 * Wait for playlist container to be ready
 */
export async function waitForPlaylistContainer(
    timeout: number = 10000
): Promise<Element> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const container = document.querySelector(YOUTUBE_SELECTORS.PLAYLIST_CONTAINER);
        if (container) {
            return container;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Playlist container not found');
}
