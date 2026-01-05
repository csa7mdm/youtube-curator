<div align="center">

# 📺 YouTube Curator

### AI-Powered YouTube Playlist Analyzer

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-FF6B6B)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Transform overwhelming YouTube playlists into actionable insights using AI.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [API](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 🎯 What is YouTube Curator?

YouTube Curator is a **Chrome extension** that uses **artificial intelligence** to analyze YouTube playlists and provide intelligent recommendations. Instead of manually scanning through hundreds of videos, let AI categorize, summarize, and prioritize content for you.

### The Problem

- 📚 Playlists with 50+ videos are overwhelming
- ⏰ No time to watch everything
- 🔍 Hard to find the most relevant content
- 📋 No way to understand playlist themes at a glance

### The Solution

YouTube Curator automatically:
- 🤖 **Scrapes** video metadata from any YouTube playlist
- 🧠 **Analyzes** content using AI (via OpenRouter)
- 📊 **Categorizes** videos by theme and topic
- ⭐ **Recommends** which videos to watch first
- 📝 **Summarizes** the entire playlist in seconds

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Auto-Scroll Scraping** | Automatically scrolls through lazy-loaded playlists to capture all videos |
| 🤖 **AI Analysis** | Uses OpenRouter API to access multiple LLM models (GPT-4, Claude, Gemini, etc.) |
| 🏷️ **Smart Categorization** | Groups videos by identified themes and topics |
| ⭐ **Priority Recommendations** | Suggests most valuable videos to watch first |
| 📊 **Visual Dashboard** | Beautiful dark-themed UI with progress indicators |
| 💾 **Persistent State** | Saves analysis results for later viewing |
| 🔧 **Configurable Models** | Choose from free or paid AI models |
| 🔒 **Privacy-First** | Your data stays local; only video titles go to AI |

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Google Chrome** browser
- **OpenRouter API Key** (free tier available)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/youtube-curator.git
cd youtube-curator

# Install dependencies
npm install

# Build for production
npm run build
```

### Load in Chrome

1. Open `chrome://extensions` in Chrome
2. Enable **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this project
5. Pin the extension to your toolbar

### Get Your API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up (free) and create an API key
3. Click the YouTube Curator extension icon → **Settings**
4. Paste your API key and click **Save**

---

## 📖 Usage

### Basic Workflow

```
1. Navigate to YouTube     →  Open any YouTube playlist page
2. Click Extension Icon    →  Opens the YouTube Curator popup
3. Click "Start Scan"      →  Extension scrolls and extracts videos
4. Wait for Analysis       →  AI processes video metadata
5. View Results            →  Browse categorized insights
```

### Supported Playlists

- ✅ Regular playlists (`/playlist?list=...`)
- ✅ Watch Later playlist
- ✅ Liked videos playlist
- ✅ Channel playlists
- ⚠️ Mix playlists (limited support)

### Analysis Output

The AI provides:

- **Summary**: One-paragraph overview of the playlist
- **Themes**: Key topics with video counts
- **Categories**: Grouped videos with rationale
- **Recommendations**: Top videos to watch first with reasons

---

## 🏗️ Architecture

YouTube Curator follows a **modular Chrome Extension architecture** using Manifest V3:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHROME BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    Messages    ┌──────────────────────────┐  │
│  │              │◄──────────────►│                          │  │
│  │    Popup     │                │   Background Service     │  │
│  │   (React)    │                │       Worker             │  │
│  │              │                │                          │  │
│  └──────────────┘                └────────────┬─────────────┘  │
│                                               │                 │
│                                               │ Messages        │
│                                               ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Content Script                        │   │
│  │            (Runs in YouTube tab context)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌──────────────────┐
                    │   OpenRouter     │
                    │   API (AI)       │
                    └──────────────────┘
```

### Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Popup** | React + TypeScript | User interface and controls |
| **Background** | Service Worker | State management, AI communication |
| **Content Script** | Vanilla TypeScript | DOM scraping, scroll automation |
| **Messaging** | Chrome Runtime API | Type-safe inter-process communication |

---

## 📁 Project Structure

```
youtube-curator/
├── src/
│   ├── popup/                    # React UI
│   │   ├── App.tsx              # Main app component
│   │   ├── components/          # UI components
│   │   │   ├── ScanButton.tsx
│   │   │   ├── AnalysisResult.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── ProgressIndicator.tsx
│   │   ├── styles.css           # Dark theme styling
│   │   └── main.tsx             # React entry point
│   │
│   ├── background/
│   │   └── serviceWorker.ts     # Background orchestration
│   │
│   ├── content/
│   │   └── youtubeScript.ts     # YouTube DOM interaction
│   │
│   └── lib/                      # Shared modules
│       ├── common/
│       │   ├── messaging.ts     # Type-safe messaging
│       │   └── types.ts         # TypeScript interfaces
│       ├── ai/
│       │   └── openRouterClient.ts  # AI API client
│       ├── settings/
│       │   └── storage.ts       # Chrome storage wrapper
│       └── youtube-mechanics/
│           ├── scroller.ts      # Infinite scroll handler
│           └── parser.ts        # Video metadata extractor
│
├── public/
│   └── icons/                   # Extension icons
│
├── manifest.json                # Chrome extension manifest
├── vite.config.ts              # Vite + CRXJS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## 🔌 API Reference

### Message Types

The extension uses a type-safe messaging system:

```typescript
interface MessageTypeMap {
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
    'VIDEOS_PARSED': { videos: VideoMetadata[] };

    // Background → Popup
    'STATE_UPDATE': ExtensionState;
    'ANALYSIS_COMPLETE': { analysis: AnalysisResult };
}
```

### Data Types

```typescript
interface VideoMetadata {
    id: string;
    title: string;
    channel: string;
    duration: string;
    thumbnail: string;
    url: string;
}

interface AnalysisResult {
    summary: string;
    themes: Array<{ name: string; description: string; videoCount: number }>;
    categories: Array<{ name: string; rationale: string; videos: string[] }>;
    recommendations: Array<{ 
        videoId: string; 
        reason: string; 
        priority: 'high' | 'medium' | 'low' 
    }>;
}
```

---

## 🛠️ Development

### Commands

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck

# Run tests
npm run test
```

### Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) + [CRXJS](https://crxjs.dev/vite-plugin)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.3
- **UI Framework**: [React](https://reactjs.org/) 18
- **Extension API**: Chrome Manifest V3
- **AI Provider**: [OpenRouter](https://openrouter.ai/) (LLM Gateway)

### Development Tips

1. Use `npm run dev` for hot-reload during development
2. Check `chrome://extensions` → "Errors" for debugging
3. Use Chrome DevTools on the popup: right-click → "Inspect"
4. Background script logs appear in the service worker console

---

## 🔐 Privacy & Security

- ✅ **No user tracking** - Zero analytics or telemetry
- ✅ **Data stays local** - Video data stored in Chrome's local storage
- ✅ **Minimal AI exposure** - Only video titles and channels sent to AI
- ✅ **Your API key** - You control and pay for AI usage
- ✅ **Open source** - Audit the code yourself

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing TypeScript patterns
- Add types for all new code
- Test in Chrome before submitting
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing LLM API access
- [CRXJS](https://crxjs.dev/) for excellent Chrome extension tooling
- [Vite](https://vitejs.dev/) for blazing-fast builds

---

<div align="center">

**[⬆ Back to Top](#-youtube-curator)**

Made with ❤️ by developers who had too many videos in their Watch Later

</div>
