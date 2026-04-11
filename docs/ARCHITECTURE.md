# Architecture

## Overview

p0stmaster is a single-user local application built from a React frontend, a small Node HTTP server, and an Electron desktop shell.

The runtime model is intentionally simple:

- React handles stateful UI, previews, and workflow orchestration
- the local server handles outbound API calls and static asset serving
- Electron starts the server on an ephemeral port and loads it into a desktop window

## Main Runtime Pieces

### Frontend

Primary file:

- `p0stmaster.jsx`

This file owns most application state, including:

- client workspace configuration
- selected draft and draft metadata
- approval state
- live feed results
- publish readiness and provider gating
- local encrypted persistence

UI is split into focused components:

- `components/AppHeader.jsx`: theme switcher, settings access, quick actions, and save banner
- `components/ComposerPanel.jsx`: client selection, planning, content drafting, media handling, and publish initiation
- `components/PreviewPanel.jsx`: platform previews, compliance scan, brand kit, trends, live feeds, and history
- `components/ConfigurationModal.jsx`: client, AI, social API, brand, governance, account, and feed-source management

### Local server

Primary file:

- `serve.js`

Responsibilities:

- serves `dist/` assets and falls back to root `index.html`
- proxies AI requests through `/api/ai`
- fetches live feed data through `/api/feeds`
- publishes content through `/api/publish`

The server validates inputs and normalizes external-provider failures into clearer client-facing errors.

### Desktop shell

Primary file:

- `electron/main.js`

Responsibilities:

- starts the local server with `startServer({ port: 0, silent: true })`
- creates the Electron window
- loads the server URL into the BrowserWindow
- shuts the server down on app exit

## Provider Model

### AI providers

Supported providers:

- ChatGPT via OpenAI API
- Gemini
- Claude

The selected client workspace stores provider keys. AI drafting only works when the active provider and key are configured.

### Social publishing

Current live publisher:

- Ayrshare

Supported delivery platforms through Ayrshare:

- Facebook
- Instagram
- LinkedIn
- Pinterest
- X
- YouTube
- TikTok

Important publish rules:

- the active client must have an Ayrshare API key
- the client must have a mapped account for each selected platform
- Instagram, Pinterest, YouTube, and TikTok require a public media URL
- story drafts are published as standard provider posts

## Client Configuration Model

Each client workspace carries its own configuration envelope, including:

- AI provider selection and API keys
- social provider credentials
- feed sources
- managed accounts
- brands
- governance flags

Governance currently includes:

- `approvalRequired`
- `brandSafe`
- `roleBased`

The active client drives publish eligibility, selected accounts, brand signals, and live feed refreshes.

## Persistence

The app persists local state to a vault stored in browser storage.

Persisted areas include:

- config
- current session draft
- draft history
- action log
- generated plans
- trend and feed data
- selected theme

The vault uses encrypted storage, but there is an important limitation:

- the passphrase is currently defined in source code rather than injected from environment or OS-native secret storage

That means the vault is protected against casual local inspection, but it should not yet be treated as hardened secret management.

## Build and Packaging

### Web build

`npm run build` performs:

- Tailwind CSS compilation into `dist/tailwind.css`
- React bundle generation into `dist/bundle.js`

### Local web run

`npm run serve` starts the app on `http://localhost:4173`.

### Desktop run

`npm run desktop` builds the assets and opens the Electron shell locally.

### macOS packaging

`npm run desktop:mac` builds:

- universal macOS app
- `dmg`
- `zip`

Output directory:

- `release/`

The current repository configuration does not sign or notarize the Mac app.

## CI and Release Flow

Workflow file:

- `.github/workflows/desktop-build.yml`

Current behavior:

- runs on pushes and manual dispatch
- builds macOS artifacts on `macos-14`
- builds Windows artifacts on `windows-latest`
- uploads build artifacts to the workflow run
- updates a `nightly-desktop` prerelease on `main`
- creates versioned GitHub releases for tags matching `v*`

## Operational Caveats

- There is no backend database; the local vault is the source of truth for the user session.
- The app assumes a trusted local environment.
- macOS builds are unsigned and unnotarized, so first-launch trust prompts are expected.
- Windows builds are unsigned, so SmartScreen trust prompts are expected.

## Good Next Hardening Steps

- move the vault passphrase out of source
- add OS-native secure storage for provider credentials
- split application state from view logic in `p0stmaster.jsx` as the codebase grows
- add automated tests around publish gating and feed normalization