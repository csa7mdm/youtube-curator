/**
 * YouTube Content Script
 * 
 * This script runs in the context of YouTube pages.
 * It handles DOM scraping operations triggered by the background service.
 */

import {
    createMessageListener,
    sendToBackground
} from '../lib/common/messaging';
import {
    createInfiniteScroller,
    parsePlaylistVideos,
    isPlaylistPage,
    waitForPlaylistContainer,
} from '../lib/youtube-mechanics';

// ============================================================
// STATE
// ============================================================

let currentScroller: ReturnType<typeof createInfiniteScroller> | null = null;

// ============================================================
// MESSAGE HANDLERS
// ============================================================

const listener = createMessageListener({
    /**
     * Handle scroll request from background
     */
    'SCROLL_TO_BOTTOM': async (payload) => {
        const { selector } = payload;

        try {
            // Verify we're on a playlist page
            if (!isPlaylistPage()) {
                throw new Error('Not on a YouTube playlist page');
            }

            // Wait for container to be ready
            await waitForPlaylistContainer();

            // Create scroller and start scrolling
            currentScroller = createInfiniteScroller({
                containerSelector: selector,
            });

            // Scroll and report progress
            await currentScroller.scrollAll((progress) => {
                sendToBackground('SCROLL_PROGRESS', {
                    loaded: progress.loaded,
                    estimatedTotal: progress.estimatedTotal,
                });
            });

            // Notify scroll complete
            await sendToBackground('SCROLL_COMPLETE', {});

            // Parse videos
            const videos = parsePlaylistVideos();

            // Send parsed videos to background
            await sendToBackground('VIDEOS_PARSED', { videos });

        } catch (error) {
            console.error('[ContentScript] Scroll error:', error);
            await sendToBackground('SCRAPE_ERROR', {
                message: (error as Error).message,
                code: 'SCROLL_FAILED',
            });
        }
    },

    /**
     * Handle parse request (if scrolling done separately)
     */
    'PARSE_VIDEOS': async () => {
        try {
            const videos = parsePlaylistVideos();
            await sendToBackground('VIDEOS_PARSED', { videos });
        } catch (error) {
            await sendToBackground('SCRAPE_ERROR', {
                message: (error as Error).message,
                code: 'PARSE_FAILED',
            });
        }
    },

    /**
     * Inject scraper - just acknowledge
     */
    'INJECT_SCRAPER': () => {
        console.log('[YouTube Curator] Content script ready');
    },
});

// Start listening
listener.start();

console.log('[YouTube Curator] Content script loaded on', window.location.href);
