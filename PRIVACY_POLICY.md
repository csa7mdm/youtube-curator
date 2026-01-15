# Privacy Policy for YouTube Curator

**Last Updated: January 2026**

## Overview

YouTube Curator is a browser extension that analyzes your YouTube playlists using AI. We are committed to protecting your privacy.

## Data Collection

### What We Collect

YouTube Curator collects the following data **locally on your device only**:

| Data Type | Purpose | Storage |
|-----------|---------|---------|
| YouTube video titles | To analyze playlist content | Local browser storage only |
| Playlist information | To provide categorization | Local browser storage only |
| User preferences | To remember your settings | Local browser storage only |
| AI API key (yours) | To connect to AI services | Local browser storage only |

### What We DO NOT Collect

- We do NOT collect your YouTube account credentials
- We do NOT access your private playlists without permission
- We do NOT track your viewing history
- We do NOT store data on external servers
- We do NOT share or sell any data

## AI Processing

When analyzing playlists:
- Video metadata is sent to your configured AI provider (OpenRouter)
- You use **your own API key**
- Data is sent directly to the AI provider's API
- Subject to the AI provider's privacy policy

### Supported AI Providers
- **OpenRouter**: Routes to GPT-4, Claude, Gemini, etc.
- Subject to [OpenRouter Privacy Policy](https://openrouter.ai/privacy)

## Data Storage

All data is stored locally using Chrome's `storage` API:
- Data remains on your device
- Data is deleted when you uninstall the extension
- You can clear data anytime via extension settings

## Permissions Explained

| Permission | Why We Need It |
|------------|----------------|
| `storage` | To save your preferences and API key locally |
| `activeTab` | To interact with YouTube pages |
| `scripting` | To extract playlist information |
| `*://*.youtube.com/*` | To access YouTube playlist data |

## YouTube Data

- We only access publicly visible playlist information
- We do not access your YouTube account
- We do not modify your playlists
- Data extraction happens client-side only

## Your Rights

You have the right to:
- Access your stored data (via extension settings)
- Delete your data (clear storage or uninstall)
- Control which AI provider to use
- Revoke your API key at any time

## Children's Privacy

YouTube Curator is not intended for users under 13 years of age.

## Changes to This Policy

We will update this policy as needed. Changes will be noted with an updated date.

## Contact

For privacy questions, open an issue on our [GitHub repository](https://github.com/csa7mdm/youtube-curator).

---

**Summary**: YouTube Curator analyzes playlists locally and uses your own API key for AI features. We don't collect, store, or sell your personal data.
