# API Reference

Complete API documentation for YouTube Curator's internal modules.

## Table of Contents

- [Messaging API](#messaging-api)
- [Data Types](#data-types)
- [Storage API](#storage-api)
- [AI Client API](#ai-client-api)

---

## Messaging API

Location: `src/lib/common/messaging.ts`

### sendToBackground

Send a message to the background service worker.

```typescript
function sendToBackground<K extends MessageType>(
    type: K,
    payload: MessageTypeMap[K]
): Promise<void>
```

**Example:**
```typescript
await sendToBackground('START_SCAN', { tabId: 123 });
```

### sendToTab

Send a message to a content script in a specific tab.

```typescript
function sendToTab<K extends MessageType>(
    tabId: number,
    type: K,
    payload: MessageTypeMap[K]
): Promise<void>
```

**Example:**
```typescript
await sendToTab(tabId, 'SCROLL_TO_BOTTOM', { selector: '.playlist' });
```

### broadcastToPopup

Broadcast a message to the popup (if open).

```typescript
function broadcastToPopup<K extends MessageType>(
    type: K,
    payload: MessageTypeMap[K]
): void
```

**Example:**
```typescript
broadcastToPopup('STATE_UPDATE', currentState);
```

### sendAndReceive

Send a message and wait for a response.

```typescript
function sendAndReceive<K extends MessageType, R>(
    type: K,
    payload: MessageTypeMap[K]
): Promise<R>
```

**Example:**
```typescript
const state = await sendAndReceive<'GET_STATE', ExtensionState>('GET_STATE', {});
```

### createMessageListener

Create a message listener with type-safe handlers.

```typescript
function createMessageListener(handlers: HandlerMap): {
    start: () => void;
    stop: () => void;
}
```

**Example:**
```typescript
const listener = createMessageListener({
    'START_SCAN': async (payload) => {
        await handleScan(payload.tabId);
    },
    'GET_STATE': () => {
        return currentState;
    }
});

listener.start();
```

---

## Data Types

Location: `src/lib/common/types.ts`

### VideoMetadata

```typescript
interface VideoMetadata {
    id: string;           // YouTube video ID
    title: string;        // Video title
    channel: string;      // Channel name
    duration: string;     // Duration string (e.g., "12:34")
    thumbnail: string;    // Thumbnail URL
    url: string;          // Full video URL
}
```

### ScanProgress

```typescript
interface ScanProgress {
    phase: 'scrolling' | 'parsing' | 'analyzing';
    current: number;      // Current count
    total: number;        // Total (estimated)
    message: string;      // Human-readable status
}
```

### AnalysisResult

```typescript
interface AnalysisResult {
    summary: string;
    themes: Array<{
        name: string;
        description: string;
        videoCount: number;
    }>;
    categories: Array<{
        name: string;
        rationale: string;
        videos: string[];
    }>;
    recommendations: Array<{
        videoId: string;
        reason: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    modelUsed: string;
    analyzedAt: number;
}
```

### ExtensionState

```typescript
interface ExtensionState {
    status: 'idle' | 'scrolling' | 'parsing' | 'analyzing' | 'complete' | 'error';
    progress: ScanProgress | null;
    videos: VideoMetadata[];
    analysis: AnalysisResult | null;
    error: string | null;
    lastScanAt: number | null;
}
```

### ExtensionSettings

```typescript
interface ExtensionSettings {
    apiKey: string;
    selectedModel: string;
    theme: 'light' | 'dark' | 'system';
}
```

---

## Storage API

Location: `src/lib/settings/storage.ts`

### getSettings

Retrieve all extension settings.

```typescript
async function getSettings(): Promise<ExtensionSettings>
```

### saveSettings

Save extension settings.

```typescript
async function saveSettings(settings: ExtensionSettings): Promise<void>
```

### getApiKey

Get the stored API key.

```typescript
async function getApiKey(): Promise<string | null>
```

### getCachedModels

Get cached AI model list.

```typescript
async function getCachedModels(): Promise<AIModel[]>
```

### cacheModels

Cache AI model list.

```typescript
async function cacheModels(models: AIModel[]): Promise<void>
```

---

## AI Client API

Location: `src/lib/ai/openRouterClient.ts`

### createOpenRouterClient

Create an OpenRouter API client.

```typescript
function createOpenRouterClient(config: { apiKey: string }): OpenRouterClient
```

### OpenRouterClient.getAvailableModels

Fetch available AI models.

```typescript
async function getAvailableModels(): Promise<AIModel[]>
```

### OpenRouterClient.analyzePlaylist

Analyze a playlist using AI.

```typescript
async function analyzePlaylist(
    videos: VideoMetadata[],
    options?: { model?: string }
): Promise<AnalysisResult>
```

### validateApiKey

Validate an OpenRouter API key.

```typescript
async function validateApiKey(apiKey: string): Promise<{
    isValid: boolean;
    error?: string;
    rateLimit?: { requestsPerMinute: number };
}>
```

---

## Message Types

### Popup → Background

| Type | Payload | Description |
|------|---------|-------------|
| `START_SCAN` | `{ tabId: number }` | Start scanning playlist |
| `STOP_SCAN` | `{}` | Cancel current scan |
| `GET_STATE` | `{}` | Request current state |
| `CLEAR_RESULTS` | `{}` | Clear analysis results |

### Background → Content Script

| Type | Payload | Description |
|------|---------|-------------|
| `SCROLL_TO_BOTTOM` | `{ selector: string }` | Scroll playlist container |
| `PARSE_VIDEOS` | `{ containerSelector: string }` | Extract video metadata |

### Content Script → Background

| Type | Payload | Description |
|------|---------|-------------|
| `SCROLL_PROGRESS` | `{ loaded, estimatedTotal }` | Scroll progress update |
| `SCROLL_COMPLETE` | `{}` | Scrolling finished |
| `VIDEOS_PARSED` | `{ videos: VideoMetadata[] }` | Extracted videos |
| `SCRAPE_ERROR` | `{ message, code }` | Scraping error |

### Background → Popup

| Type | Payload | Description |
|------|---------|-------------|
| `STATE_UPDATE` | `ExtensionState` | State changed |
| `SCAN_PROGRESS` | `ScanProgress` | Progress update |
| `ANALYSIS_COMPLETE` | `{ analysis }` | Analysis finished |
| `ERROR` | `{ message, code }` | Error occurred |
