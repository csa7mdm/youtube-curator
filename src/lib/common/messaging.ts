/**
 * The Bridge - Type-Safe Chrome Messaging Library
 * 
 * This module provides a type-safe wrapper around Chrome's messaging APIs.
 * It ensures compile-time safety for all inter-process communication.
 * 
 * REUSABILITY: This module is 100% decoupled from business logic.
 * Drop it into any Chrome extension for type-safe messaging.
 */

import type {
    VideoMetadata,
    AnalysisResult,
    ScanProgress,
    ExtensionState
} from './types';

// ============================================================
// MESSAGE TYPE MAP - The Contract
// ============================================================

/**
 * Defines all possible message types and their payloads.
 * Adding a new message type here automatically enables type checking
 * throughout the extension.
 */
export interface MessageTypeMap {
    // Popup → Background
    'START_SCAN': { tabId: number };
    'STOP_SCAN': {};
    'GET_STATE': {};
    'CLEAR_RESULTS': {};

    // Background → Content Script
    'INJECT_SCRAPER': {};
    'SCROLL_TO_BOTTOM': { selector: string };
    'PARSE_VIDEOS': { containerSelector: string };

    // Content Script → Background
    'SCROLL_PROGRESS': { loaded: number; estimatedTotal: number };
    'SCROLL_COMPLETE': {};
    'VIDEOS_PARSED': { videos: VideoMetadata[] };
    'SCRAPE_ERROR': { message: string; code: string };

    // Background → Popup
    'STATE_UPDATE': ExtensionState;
    'SCAN_PROGRESS': ScanProgress;
    'ANALYSIS_COMPLETE': { analysis: AnalysisResult };
    'ERROR': { message: string; code: string };
}

// ============================================================
// TYPE UTILITIES
// ============================================================

export type MessageType = keyof MessageTypeMap;

export interface TypedMessage<K extends MessageType = MessageType> {
    type: K;
    payload: MessageTypeMap[K];
    timestamp: number;
    source: 'popup' | 'background' | 'content';
}

export type MessageHandler<K extends MessageType> = (
    payload: MessageTypeMap[K],
    sender: chrome.runtime.MessageSender
) => unknown | Promise<unknown>;

// ============================================================
// SEND MESSAGE - Generic Type-Safe Sender
// ============================================================

/**
 * Send a message to the background script (from popup or content script)
 */
export async function sendToBackground<K extends MessageType>(
    type: K,
    payload: MessageTypeMap[K]
): Promise<void> {
    const message: TypedMessage<K> = {
        type,
        payload,
        timestamp: Date.now(),
        source: 'popup', // Will be overwritten by content scripts
    };

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

/**
 * Send a message to a specific tab's content script
 */
export async function sendToTab<K extends MessageType>(
    tabId: number,
    type: K,
    payload: MessageTypeMap[K]
): Promise<void> {
    const message: TypedMessage<K> = {
        type,
        payload,
        timestamp: Date.now(),
        source: 'background',
    };

    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

/**
 * Send a message to the popup (via chrome.runtime)
 * Note: The popup must be open to receive messages
 */
export function broadcastToPopup<K extends MessageType>(
    type: K,
    payload: MessageTypeMap[K]
): void {
    const message: TypedMessage<K> = {
        type,
        payload,
        timestamp: Date.now(),
        source: 'background',
    };

    // Broadcast to all extension views (popup, options, etc.)
    chrome.runtime.sendMessage(message).catch(() => {
        // Popup might not be open, which is fine
    });
}

// ============================================================
// MESSAGE LISTENER - Type-Safe Handler Registration
// ============================================================

type HandlerMap = {
    [K in MessageType]?: MessageHandler<K>;
};

/**
 * Create a message listener with type-safe handlers
 * 
 * @example
 * ```ts
 * const listener = createMessageListener({
 *   'START_SCAN': (payload) => {
 *     // payload is typed as { tabId: number }
 *     startScan(payload.tabId);
 *   },
 *   'GET_STATE': () => {
 *     return getState();
 *   }
 * });
 * 
 * // Start listening
 * listener.start();
 * 
 * // Stop when needed
 * listener.stop();
 * ```
 */
export function createMessageListener(handlers: HandlerMap) {
    const handleMessage = (
        message: TypedMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: unknown) => void
    ): boolean => {
        const handler = handlers[message.type] as MessageHandler<typeof message.type> | undefined;

        if (!handler) {
            console.warn(`[Messaging] No handler for message type: ${message.type}`);
            return false;
        }

        try {
            const result = handler(message.payload, sender);

            if (result instanceof Promise) {
                result
                    .then(sendResponse)
                    .catch((err) => {
                        console.error(`[Messaging] Handler error for ${message.type}:`, err);
                        sendResponse({ error: err.message });
                    });
                return true; // Keep channel open for async response
            }

            sendResponse(result);
            return false;
        } catch (err) {
            console.error(`[Messaging] Sync handler error for ${message.type}:`, err);
            sendResponse({ error: (err as Error).message });
            return false;
        }
    };

    return {
        start: () => {
            chrome.runtime.onMessage.addListener(handleMessage);
        },
        stop: () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        },
    };
}

// ============================================================
// UTILITY: One-time message with response
// ============================================================

/**
 * Send a message and wait for a typed response
 */
export async function sendAndReceive<K extends MessageType, R>(
    type: K,
    payload: MessageTypeMap[K]
): Promise<R> {
    const message: TypedMessage<K> = {
        type,
        payload,
        timestamp: Date.now(),
        source: 'popup',
    };

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response: R) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}
