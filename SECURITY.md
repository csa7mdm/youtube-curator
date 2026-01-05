# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in YouTube Curator, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email the maintainers directly with details
3. Include steps to reproduce the vulnerability
4. Allow reasonable time for a fix before disclosure

## Security Model

### Permissions

YouTube Curator requests minimal Chrome extension permissions:

- `activeTab`: Access only the current tab when user clicks extension
- `storage`: Save settings and analysis results locally
- `Host permissions`: Only `*://www.youtube.com/*` for content script

### Data Handling

- **Local Storage**: All user data stored in Chrome's local storage
- **API Key**: Stored locally, never transmitted except to OpenRouter
- **Video Data**: Only titles/channels sent to AI for analysis
- **No Tracking**: Zero analytics, telemetry, or user tracking

### Network Security

- All API calls use HTTPS
- API key sent only in Authorization header
- No third-party scripts or resources loaded

## Best Practices for Users

1. Use a unique OpenRouter API key for this extension
2. Review your OpenRouter usage regularly
3. Keep the extension updated
4. Only install from trusted sources
