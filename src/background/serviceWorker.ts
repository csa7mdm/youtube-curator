/**
 * The Integrator - Background Service Worker
 * 
 * This is the central nervous system of the extension.
 * It coordinates between the popup, content scripts, and AI provider.
 */

import {
    createMessageListener,
    sendToTab,
    broadcastToPopup
} from '../lib/common/messaging';
import type { ExtensionState } from '../lib/common/types';
import { createOpenRouterClient } from '../lib/ai/openRouterClient';
import { getSettings, getApiKey } from '../lib/settings/storage';

// ============================================================
// STATE MANAGEMENT
// ============================================================

let currentState: ExtensionState = {
    status: 'idle',
    progress: null,
    videos: [],
    analysis: null,
    error: null,
    lastScanAt: null,
};

function updateState(updates: Partial<ExtensionState>): void {
    currentState = { ...currentState, ...updates };
    broadcastToPopup('STATE_UPDATE', currentState);
    chrome.storage.local.set({ extensionState: currentState });
}

// ============================================================
// MESSAGE HANDLERS
// ============================================================

const listener = createMessageListener({
    'START_SCAN': async (payload) => {
        const { tabId } = payload;

        try {
            const apiKey = await getApiKey();
            if (!apiKey) {
                updateState({
                    status: 'error',
                    error: 'API key not configured. Please add your OpenRouter API key in Settings.',
                });
                return;
            }

            updateState({
                status: 'scrolling',
                progress: {
                    current: 0,
                    total: 0,
                    phase: 'scrolling',
                    message: 'Starting scan...',
                },
                error: null,
            });

            // Content script is already injected via manifest.json
            // Just send the command to start scrolling
            await sendToTab(tabId, 'SCROLL_TO_BOTTOM', {
                selector: 'ytd-playlist-video-list-renderer'
            });

        } catch (error) {
            console.error('[ServiceWorker] START_SCAN error:', error);
            updateState({
                status: 'error',
                error: (error as Error).message,
            });
        }
    },

    'SCROLL_PROGRESS': (payload) => {
        updateState({
            progress: {
                current: payload.loaded,
                total: payload.estimatedTotal,
                phase: 'scrolling',
                message: `Scrolling... ${payload.loaded} videos found`,
            },
        });
    },

    'SCROLL_COMPLETE': async () => {
        updateState({
            status: 'parsing',
            progress: {
                ...currentState.progress!,
                phase: 'parsing',
                message: 'Parsing video data...',
            },
        });
    },

    'VIDEOS_PARSED': async (payload) => {
        const { videos } = payload;

        updateState({
            videos,
            status: 'analyzing',
            progress: {
                current: videos.length,
                total: videos.length,
                phase: 'analyzing',
                message: `Analyzing ${videos.length} videos with AI...`,
            },
        });

        try {
            const settings = await getSettings();
            const client = createOpenRouterClient({
                apiKey: settings.apiKey,
                modelId: settings.selectedModel,
            });

            const analysis = await client.analyzeVideos(videos);

            updateState({
                status: 'complete',
                analysis,
                progress: null,
                lastScanAt: new Date().toISOString(),
            });

            chrome.storage.local.set({ lastAnalysis: analysis });
            broadcastToPopup('ANALYSIS_COMPLETE', { analysis });

        } catch (error) {
            console.error('[ServiceWorker] AI Analysis error:', error);
            updateState({
                status: 'error',
                error: `AI analysis failed: ${(error as Error).message}`,
            });
        }
    },

    'SCRAPE_ERROR': (payload) => {
        updateState({
            status: 'error',
            error: payload.message,
        });
    },

    'GET_STATE': () => {
        // Return the state for sendAndReceive, and also broadcast for listeners
        broadcastToPopup('STATE_UPDATE', currentState);
        return currentState;
    },

    'CLEAR_RESULTS': () => {
        updateState({
            status: 'idle',
            progress: null,
            videos: [],
            analysis: null,
            error: null,
        });
    },

    'STOP_SCAN': () => {
        updateState({
            status: 'idle',
            progress: null,
            error: 'Scan cancelled by user',
        });
    },
});

// ============================================================
// INITIALIZATION
// ============================================================

listener.start();

chrome.storage.local.get('extensionState', (result) => {
    if (result.extensionState) {
        currentState = result.extensionState;
        if (['scrolling', 'parsing', 'analyzing'].includes(currentState.status)) {
            currentState.status = 'idle';
            currentState.progress = null;
        }
    }
});

console.log('[YouTube Curator] Service worker initialized');
