/**
 * The Mechanic - Infinite Scroll Handler
 * 
 * A standalone, reusable module that handles the messy reality of
 * infinite scrolling on web pages (especially YouTube).
 * 
 * REUSABILITY: This module has ZERO dependencies on Chrome extension APIs.
 * It works purely with the DOM and can be used in any web scraping context.
 */

import type { ScrollerConfig, ScrollProgress, ScrollResult } from './types';

// Default configuration optimized for YouTube
const DEFAULT_CONFIG: ScrollerConfig = {
    containerSelector: 'ytd-playlist-video-list-renderer',
    scrollDelay: 500,
    maxWaitTime: 5000,
    scrollThreshold: 200,
    maxAttempts: 100,
};

/**
 * Scrolls a container to load all lazy-loaded content.
 * Uses an async generator to emit progress events.
 */
export function createInfiniteScroller(config: Partial<ScrollerConfig> = {}) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    let isAborted = false;

    async function* scroll(): AsyncGenerator<ScrollProgress> {
        isAborted = false;
        const container = document.querySelector(cfg.containerSelector);

        if (!container) {
            throw new Error(`Container not found: ${cfg.containerSelector}`);
        }

        let previousItemCount = 0;
        let stableCount = 0;
        let attempts = 0;

        while (!isAborted && attempts < cfg.maxAttempts) {
            attempts++;

            const items = container.querySelectorAll('ytd-playlist-video-renderer');
            const currentCount = items.length;

            const isAtBottom = isScrolledToBottom(container);
            const hasSpinner = !!container.querySelector('ytd-continuation-item-renderer');

            yield {
                loaded: currentCount,
                estimatedTotal: estimateTotal(container),
                isComplete: isAtBottom && !hasSpinner && currentCount === previousItemCount,
                scrollPosition: container.scrollTop,
            };

            if (currentCount === previousItemCount) {
                stableCount++;
                if (stableCount >= 3 && !hasSpinner) {
                    return;
                }
            } else {
                stableCount = 0;
            }

            previousItemCount = currentCount;

            scrollToBottom(container);

            await wait(cfg.scrollDelay);

            if (hasSpinner) {
                await waitForContentLoad(container, cfg.maxWaitTime);
            }
        }
    }

    function abort() {
        isAborted = true;
    }

    async function scrollAll(
        onProgress?: (progress: ScrollProgress) => void
    ): Promise<ScrollResult> {
        try {
            let lastProgress: ScrollProgress | null = null;

            for await (const progress of scroll()) {
                lastProgress = progress;
                onProgress?.(progress);
            }

            return {
                success: true,
                totalScrolled: lastProgress?.scrollPosition ?? 0,
                itemsFound: lastProgress?.loaded ?? 0,
            };
        } catch (error) {
            return {
                success: false,
                totalScrolled: 0,
                itemsFound: 0,
                error: (error as Error).message,
            };
        }
    }

    return {
        scroll,
        scrollAll,
        abort,
    };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isScrolledToBottom(_container: Element): boolean {
    const scrollableElement = getScrollableElement();
    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
    return scrollHeight - scrollTop - clientHeight < 50;
}

function scrollToBottom(_container: Element): void {
    const scrollableElement = getScrollableElement();
    scrollableElement.scrollTo({
        top: scrollableElement.scrollHeight,
        behavior: 'smooth',
    });
}

function getScrollableElement(): Element {
    return document.scrollingElement ?? document.documentElement;
}

function estimateTotal(container: Element): number {
    const countElement = document.querySelector(
        'yt-formatted-string.ytd-playlist-sidebar-primary-info-renderer'
    );

    if (countElement?.textContent) {
        const match = countElement.textContent.match(/(\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
    }

    const currentCount = container.querySelectorAll('ytd-playlist-video-renderer').length;
    return currentCount;
}

async function waitForContentLoad(
    container: Element,
    maxWaitTime: number
): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
        const hasSpinner = !!container.querySelector('ytd-continuation-item-renderer');
        if (!hasSpinner) {
            return;
        }
        await wait(100);
    }
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
