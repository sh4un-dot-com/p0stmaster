# p0stmaster

p0stmaster is a desktop and local-web workspace for planning, adapting, previewing, and publishing social content across multiple client workspaces.

It combines:

- multi-client configuration and account mapping
- AI-assisted draft generation with OpenAI, Gemini, or Claude
- live publishing through Ayrshare
- live RSS, Atom, and YouTube feed ingestion for trend signals
- desktop packaging through Electron

## Current Status

The repository is set up for active local use and unsigned macOS distribution.

- macOS packaging is universal for Apple Silicon and Intel
- macOS GitHub Actions builds publish nightly prereleases from `main`
- version tags like `v0.1.0` publish versioned GitHub releases
- macOS artifacts are currently unsigned and not notarized

## Features

- Separate client workspaces with their own brands, accounts, governance rules, and credentials
- AI rewrite and draft generation against a selected provider
- Live publishing to Facebook, Instagram, LinkedIn, Pinterest, X, YouTube, and TikTok through Ayrshare
- Preview layouts for multiple social surfaces before publishing
- Live Feed Pulse using RSS, Atom, and YouTube sources
- Local encrypted vault persistence for app state

## Requirements

- Node.js 20 recommended
- npm
- Internet access for AI providers, live feeds, and Ayrshare publishing

## Quick Start

Install dependencies:

```bash
npm ci
```

Build the web assets:

```bash
npm run build
```

Run the local web app:

```bash
npm run serve
```

Then open `http://localhost:4173`.

Run the Electron desktop app locally:

```bash
npm run desktop
```

Build unsigned universal macOS artifacts:

```bash
npm run desktop:mac
```

Artifacts are written to `release/`.

## Configuration Prerequisites

To use live functionality end to end, you still need real provider credentials and mappings.

### AI drafting

Configure one of these in Settings:

- OpenAI / ChatGPT API key
- Gemini API key
- Claude API key

### Live publishing

Configure:

- an Ayrshare API key
- at least one managed account for each platform you want to publish to

Additional publishing rules:

- Instagram, Pinterest, YouTube, and TikTok require a public media URL for live delivery
- if approval is enabled for the active client, the draft must be approved before publishing

### Live feeds

Add feed sources in Settings using:

- RSS / Atom URLs
- YouTube feed URLs
- other public feed endpoints supported by RSS Parser

## Available Scripts

- `npm run build`: compiles Tailwind and bundles the React app into `dist/`
- `npm run serve`: starts the local HTTP server on port `4173`
- `npm run start`: builds and serves in one step
- `npm run desktop`: builds and launches Electron locally
- `npm run desktop:mac`: builds unsigned universal macOS `dmg` and `zip` artifacts

## Project Layout

- `p0stmaster.jsx`: primary app state, persistence, orchestration, and publish flow
- `components/`: UI surfaces such as the header, composer, preview panel, and configuration modal
- `serve.js`: local HTTP server plus AI, feeds, and publish proxy routes
- `electron/main.js`: Electron bootstrap that launches the local server and window
- `src/main.jsx`: React entry point
- `.github/workflows/macos-build.yml`: macOS CI build and release workflow

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [SETUP_MAC.md](SETUP_MAC.md)

## Operational Notes

- Persistence is stored locally in an encrypted vault under browser storage.
- The current encryption passphrase is still defined in source code, so this is not the final form of secret management.
- macOS builds are unsigned, so Gatekeeper may require `Open Anyway` or a right-click `Open` flow on first launch.

## macOS Distribution Flow

- Push to `main`: updates the `nightly-macos` prerelease with fresh artifacts
- Push a tag like `v0.1.0`: publishes a versioned GitHub release

For Mac-specific setup and first-run notes, use [SETUP_MAC.md](SETUP_MAC.md).