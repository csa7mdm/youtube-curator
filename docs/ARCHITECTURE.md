# Architecture Overview

This document provides a detailed technical overview of the YouTube Curator Chrome extension architecture.

## Table of Contents

- [System Design](#system-design)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Messaging System](#messaging-system)
- [State Management](#state-management)
- [AI Integration](#ai-integration)

---

## System Design

YouTube Curator follows the **Chrome Extension Manifest V3** architecture with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTENSION CONTEXT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐              ┌─────────────────────────────────┐  │
│  │                     │              │                                 │  │
│  │    POPUP            │◄────────────►│    SERVICE WORKER               │  │
│  │    (React SPA)      │   Chrome     │    (Background Script)          │  │
│  │                     │   Runtime    │                                 │  │
│  │  • User Interface   │   Messages   │  • Orchestration               │  │
│  │  • State Display    │              │  • State Management            │  │
│  │  • User Inputs      │              │  • AI Communication            │  │
│  │                     │              │  • Storage Management          │  │
│  └─────────────────────┘              └──────────────┬──────────────────┘  │
│                                                       │                     │
│                                                       │ Chrome Tabs         │
│                                                       │ Messages            │
│                                                       ▼                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         CONTENT SCRIPT                                │  │
│  │                    (Injected into YouTube tabs)                       │  │
│  │                                                                       │  │
│  │  • DOM Manipulation      • Infinite Scroll Handler                   │  │
│  │  • Video Metadata Extraction    • Progress Reporting                 │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ HTTPS API Calls
                                       ▼
                           ┌─────────────────────────┐
                           │      OPENROUTER         │
                           │      API GATEWAY        │
                           │                         │
                           │  → GPT-4               │
                           │  → Claude              │
                           │  → Gemini              │
                           │  → Other LLMs          │
                           └─────────────────────────┘
```

---

## Component Architecture

### 1. Popup (React SPA)

**Location**: `src/popup/`

The popup is a React single-page application that provides the user interface.

```
popup/
├── App.tsx                 # Main component with tab navigation
├── main.tsx               # React DOM entry point
├── styles.css             # Global styles (dark theme)
└── components/
    ├── ScanButton.tsx     # Initiates playlist scan
    ├── ProgressIndicator.tsx  # Shows scan progress
    ├── AnalysisResult.tsx # Displays AI analysis
    └── SettingsPage.tsx   # API key configuration
```

**Key Responsibilities**:
- Render user interface
- Collect user inputs (start scan, settings)
- Display extension state and analysis results
- Communicate with background via messaging

### 2. Background Service Worker

**Location**: `src/background/serviceWorker.ts`

The background script is the "brain" of the extension.

**Key Responsibilities**:
- Maintain extension state
- Orchestrate scan workflow
- Communicate with AI provider
- Persist data to Chrome storage
- Route messages between popup and content scripts

**State Shape**:
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

### 3. Content Script

**Location**: `src/content/youtubeScript.ts`

Injected into YouTube pages to interact with the DOM.

**Key Responsibilities**:
- Scroll through lazy-loaded playlist content
- Extract video metadata from DOM elements
- Report progress back to background script

### 4. Shared Libraries

**Location**: `src/lib/`

```
lib/
├── common/
│   ├── messaging.ts       # Type-safe Chrome messaging
│   └── types.ts          # Shared TypeScript interfaces
├── ai/
│   └── openRouterClient.ts  # OpenRouter API client
├── settings/
│   └── storage.ts        # Chrome storage wrapper
└── youtube-mechanics/
    ├── scroller.ts       # Infinite scroll automation
    └── parser.ts         # Video metadata extraction
```

---

## Data Flow

### Scan Workflow Sequence

```
User                  Popup               Background           Content Script        OpenRouter
  │                     │                     │                      │                    │
  │  Click "Scan"       │                     │                      │                    │
  ├────────────────────►│                     │                      │                    │
  │                     │   START_SCAN        │                      │                    │
  │                     ├────────────────────►│                      │                    │
  │                     │                     │   SCROLL_TO_BOTTOM   │                    │
  │                     │                     ├─────────────────────►│                    │
  │                     │                     │                      │                    │
  │                     │                     │   SCROLL_PROGRESS    │                    │
  │                     │◄────────────────────┼──────────────────────┤                    │
  │                     │                     │                      │                    │
  │                     │                     │   SCROLL_COMPLETE    │                    │
  │                     │                     │◄─────────────────────┤                    │
  │                     │                     │                      │                    │
  │                     │                     │   PARSE_VIDEOS       │                    │
  │                     │                     ├─────────────────────►│                    │
  │                     │                     │                      │                    │
  │                     │                     │   VIDEOS_PARSED      │                    │
  │                     │                     │◄─────────────────────┤                    │
  │                     │                     │                      │                    │
  │                     │                     │   API Request        │                    │
  │                     │                     ├────────────────────────────────────────────►
  │                     │                     │                      │                    │
  │                     │                     │   AI Analysis        │                    │
  │                     │◄────────────────────┼──────────────────────┼────────────────────┤
  │                     │   STATE_UPDATE      │                      │                    │
  │◄────────────────────┤   (complete)        │                      │                    │
  │                     │                     │                      │                    │
```

---

## Messaging System

### Type-Safe Messaging

All inter-component communication uses a centralized, type-safe messaging system.

**Message Type Map** (`src/lib/common/messaging.ts`):

```typescript
export interface MessageTypeMap {
    // Popup → Background
    'START_SCAN': { tabId: number };
    'STOP_SCAN': {};
    'GET_STATE': {};
    'CLEAR_RESULTS': {};

    // Background → Content Script
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
```

### Sending Messages

```typescript
// Popup/Content → Background
await sendToBackground('START_SCAN', { tabId: 123 });

// Background → Content Script
await sendToTab(tabId, 'SCROLL_TO_BOTTOM', { selector: '.playlist' });

// Background → Popup (broadcast)
broadcastToPopup('STATE_UPDATE', currentState);

// Request/Response pattern
const state = await sendAndReceive<'GET_STATE', ExtensionState>('GET_STATE', {});
```

---

## State Management

### Centralized State

All extension state is managed in the background service worker:

```typescript
let currentState: ExtensionState = {
    status: 'idle',
    progress: null,
    videos: [],
    analysis: null,
    error: null,
    lastScanAt: null,
};
```

### State Updates

State changes are:
1. Applied locally
2. Broadcast to popup
3. Persisted to Chrome storage

```typescript
function updateState(updates: Partial<ExtensionState>): void {
    currentState = { ...currentState, ...updates };
    broadcastToPopup('STATE_UPDATE', currentState);
    chrome.storage.local.set({ extensionState: currentState });
}
```

### State Persistence

State survives:
- Popup close/open cycles
- Browser restarts (via Chrome storage)
- Service worker restarts

---

## AI Integration

### OpenRouter Client

The extension uses OpenRouter as an AI gateway, providing access to multiple LLMs.

**Client Location**: `src/lib/ai/openRouterClient.ts`

**Key Features**:
- Model selection (user can choose from available models)
- Automatic retry with exponential backoff
- Error handling and rate limiting
- Response parsing and validation

### AI Prompt Design

The system prompt instructs the AI to:
1. Analyze video titles and channel names
2. Identify recurring themes
3. Categorize videos by topic
4. Recommend priority videos
5. Return structured JSON

**Response Schema**:
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

---

## Design Decisions

### Why React for Popup?

- Component-based architecture
- Efficient DOM updates
- Rich ecosystem
- TypeScript integration

### Why Service Worker (not Background Page)?

- Manifest V3 requirement
- Memory efficiency
- Automatic lifecycle management

### Why OpenRouter?

- Access to multiple LLMs from single API
- Free tier available
- Simple pay-as-you-go pricing
- No vendor lock-in

### Why Type-Safe Messaging?

- Compile-time error catching
- Self-documenting API
- Easier refactoring
- IDE autocomplete support

---

## Performance Considerations

1. **Lazy Loading**: Content script only loads on YouTube pages
2. **Debounced Scroll**: Prevents excessive progress updates
3. **Chunked Processing**: Large playlists processed in batches
4. **Efficient Storage**: Only essential data persisted
5. **Service Worker**: Runs only when needed

---

## Security Model

1. **Minimal Permissions**: Only YouTube URLs, storage, activeTab
2. **Content Security Policy**: Restricts script sources
3. **Local Storage**: Sensitive data (API key) stored locally
4. **HTTPS Only**: All external API calls over TLS
5. **No Tracking**: Zero analytics or telemetry
