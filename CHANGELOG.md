# Changelog

All notable changes to YouTube Curator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-05

### Added

- 🎉 Initial release of YouTube Curator
- **Popup UI**: Beautiful dark-themed React interface with three tabs (Scan, Results, Settings)
- **Auto-Scroll Scraping**: Automatically scrolls through lazy-loaded YouTube playlists to capture all videos
- **Video Metadata Extraction**: Extracts title, channel, duration, and thumbnail from playlist items
- **OpenRouter Integration**: Connect to multiple AI models (GPT-4, Claude, Gemini, etc.) via OpenRouter API
- **AI Analysis**: Get intelligent summaries, theme identification, and watch recommendations
- **Progress Indicators**: Real-time feedback during scrolling, parsing, and analysis phases
- **Persistent State**: Analysis results saved to Chrome storage for later viewing
- **Settings Management**: Configure API key and select preferred AI model
- **Type-Safe Messaging**: Fully typed Chrome extension messaging system
- **Dark Theme**: Modern, eye-friendly dark UI design

### Technical

- Built with Vite + CRXJS for fast development
- React 18 with TypeScript 5.3
- Chrome Manifest V3 compliant
- Modular architecture with separated concerns

---

## Future Roadmap

### Planned Features

- [ ] Export analysis to JSON/Markdown
- [ ] Multiple playlist comparison
- [ ] Custom AI prompt templates
- [ ] Keyboard shortcuts
- [ ] Localization (i18n)
- [ ] Firefox support
- [ ] Offline mode (cached results)
- [ ] Share analysis via link

### Under Consideration

- Integration with YouTube API (for more metadata)
- Video transcript analysis
- Playlist organization suggestions
- Chrome sync for settings
