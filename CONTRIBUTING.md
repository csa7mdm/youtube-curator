# Contributing to YouTube Curator

Thank you for your interest in contributing to YouTube Curator! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive environment. Be respectful, constructive, and collaborative.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Google Chrome browser
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/youtube-curator.git
   cd youtube-curator
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/youtube-curator.git
   ```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

This starts Vite in development mode with hot reloading.

### Load Extension in Chrome

1. Run `npm run build` (or `npm run dev`)
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder

### Get Test API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Create a free account
3. Generate an API key
4. Add it in the extension settings

---

## Making Changes

### Branching Strategy

```bash
# Create a feature branch from main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(popup): add dark mode toggle
fix(parser): handle empty playlist titles
docs(readme): update installation instructions
refactor(messaging): simplify type definitions
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Document public functions with JSDoc

```typescript
/**
 * Sends a message to the background script
 * @param type - The message type
 * @param payload - The message payload
 * @returns Promise that resolves when message is sent
 */
export async function sendToBackground<K extends MessageType>(
    type: K,
    payload: MessageTypeMap[K]
): Promise<void> {
    // ...
}
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Use TypeScript for props
- Follow file naming: `ComponentName.tsx`

```typescript
interface ScanButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ScanButton({ onClick, isLoading, disabled }: ScanButtonProps) {
    return (
        <button onClick={onClick} disabled={disabled}>
            {isLoading ? 'Scanning...' : 'Start Scan'}
        </button>
    );
}
```

### CSS

- Use CSS custom properties for theming
- Follow BEM naming convention
- Keep specificity low
- Mobile-first (though popup has fixed size)

```css
.button {
    /* Base styles */
}

.button--primary {
    /* Primary variant */
}

.button__icon {
    /* Button icon element */
}
```

### File Structure

```
src/
├── popup/           # React UI components
├── background/      # Service worker
├── content/         # Content scripts
└── lib/            # Shared utilities
    ├── common/     # Types, messaging
    ├── ai/         # AI integration
    ├── settings/   # Chrome storage
    └── youtube-mechanics/  # YouTube-specific
```

---

## Testing

### Type Checking

```bash
npm run typecheck
```

### Unit Tests

```bash
npm run test
```

### Manual Testing

1. Build the extension
2. Load in Chrome
3. Test on various YouTube playlists:
   - Short playlists (< 20 videos)
   - Long playlists (100+ videos)
   - Watch Later
   - Liked videos
   - Channel playlists

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Settings page saves API key
- [ ] Scan initiates on playlist page
- [ ] Progress indicator updates
- [ ] Analysis displays correctly
- [ ] Clear results works
- [ ] State persists after popup close

---

## Submitting Changes

### Before Submitting

1. **Run checks**:
   ```bash
   npm run typecheck
   npm run build
   ```

2. **Update documentation** if needed

3. **Test manually** in Chrome

### Create Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

### PR Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, PR will be merged
4. Your contribution will be credited!

---

## Areas for Contribution

### Good First Issues

- Documentation improvements
- CSS refinements
- Error message improvements
- Accessibility enhancements

### Feature Ideas

- Export analysis to file
- Multiple playlist comparison
- Custom AI prompts
- Keyboard shortcuts
- Localization support

### Bug Fixes

- Check open issues on GitHub
- Test edge cases
- Improve error handling

---

## Questions?

- Open a GitHub issue for bugs/features
- Start a discussion for questions
- Check existing issues before creating new ones

Thank you for contributing! 🎉
