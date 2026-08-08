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

The selected client workspace stores provider keys. AI Studio only works when the active provider and key are configured.

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
- current workspace operator role
- governance flags

Governance currently includes:

- `approvalRequired`
- `brandSafe`
- `roleBased`

Runtime enforcement currently includes:

- `approvalRequired` blocks publish until the draft is approved
- `brandSafe` blocks publish when the compliance scanner returns brand-safety warnings
- `roleBased` blocks publish when selected platform accounts do not share the active managed-account role label

The active client drives publish eligibility, selected accounts, brand signals, and live feed refreshes.

## Persistence

The app persists local state to an encrypted vault.

Storage backend depends on runtime:

- web mode stores the encrypted vault in browser `localStorage`
- desktop mode stores the encrypted vault in the Electron user-data directory via a preload bridge

Persisted areas include:

- config
- current session draft
- draft history
- action log
- generated plans
- trend and feed data
- selected theme
- preview layout preference
- last-opened configuration tab
- brand-kit analysis state

The vault uses encrypted storage with a locally generated per-install key. The key is not included in source control.

- web mode keeps the key in browser `localStorage`
- desktop mode stores the key via Electron `safeStorage` (OS-backed when available), with local storage as a fallback

That means the vault is protected against casual local inspection. On desktop, key material is further wrapped by the OS secret store when `safeStorage` encryption is available. It still does not replace full-disk encryption.

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

- extend OS-native secure storage to individual provider credentials beyond vault-key wrapping
- split application state from view logic in `p0stmaster.jsx` as the codebase grows
- add automated tests around publish gating and feed normalization