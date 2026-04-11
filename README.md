<p align="center">
  <strong>p0stmaster</strong><br/>
  <em>One workspace. Every platform. AI-powered social content at scale.</em>
</p>

<p align="center">
  <a href="#features">Features</a> · <a href="#quick-start">Quick Start</a> · <a href="#documentation">Docs</a> · <a href="#download">Download</a>
</p>

---

# p0stmaster

**p0stmaster** is a desktop and browser-based social-media command center for agencies, freelancers, and in-house marketing teams. Plan campaigns, draft content with AI, preview posts across seven platforms in real time, and publish — all from one window.

Built by [Akita Engineering](https://github.com/AkitaEngineering).

## Why p0stmaster?

| Pain point | How p0stmaster solves it |
|---|---|
| Juggling five platform tabs | Unified composer with live preview for Instagram, Facebook, LinkedIn, Pinterest, X, YouTube, and TikTok |
| Writing 7 different captions | AI rewrites adapt a single draft to each platform's tone and limits |
| Switching between client logins | Isolated workspaces with separate brands, credentials, and governance |
| Missing trending topics | Live Feed Pulse ingests RSS, Atom, and YouTube feeds for real-time signals |
| Manual approval chains | Built-in approval workflow with draft → pending → approved states |
| Paying per seat for SaaS tools | Free, open-source, runs offline — your keys, your data |

## Features

See [FEATURES.md](FEATURES.md) for the full breakdown. Highlights:

- **Multi-client workspaces** — each client gets its own brands, accounts, API keys, governance rules, and feed sources
- **AI draft generation** — OpenAI / ChatGPT, Google Gemini, or Anthropic Claude — pick per workspace
- **Platform-native previews** — see exactly how your post will look on Instagram, Facebook, LinkedIn, X, Pinterest, YouTube, and TikTok before you publish
- **One-click live publishing** — powered by Ayrshare, publish to all connected platforms simultaneously
- **Campaign planner** — generate a multi-day content calendar and build campaigns in seconds
- **Compliance scanner** — automatic brand-safety and guideline checks before content goes live
- **Brand kit analysis** — upload a logo and extract colour palettes, fonts, and brand signals automatically
- **Live Feed Pulse** — pull trending content from RSS, Atom, and YouTube feeds for inspiration
- **Audience and asset variants** — repurpose a single draft into demographic-tuned or format-tuned variants
- **Encrypted local vault** — all state persists locally with AES-256-GCM encryption; no cloud dependency
- **Themes** — Dark, Light, and FM colour palettes
- **Desktop app** — Electron packaging for macOS (universal) and Windows (installer + portable)
- **Web mode** — run in any modern browser at `localhost:4173`

## Download

| Platform | Artifact | Notes |
|---|---|---|
| **Windows** | [Latest Release](https://github.com/AkitaEngineering/p0stmaster/releases) | NSIS installer or portable `.exe` |
| **macOS** | [Latest Release](https://github.com/AkitaEngineering/p0stmaster/releases) | Universal `.dmg` or `.zip` (Intel + Apple Silicon) |
| **Nightly** | [`nightly-desktop`](https://github.com/AkitaEngineering/p0stmaster/releases/tag/nightly-desktop) | Auto-built from `main` for both platforms |

> Both macOS and Windows builds are currently **unsigned**. See the platform setup guides below for first-launch instructions.

## Quick Start

### Requirements

- Node.js 20+ recommended
- npm
- Internet access for AI providers, live feeds, and Ayrshare publishing

### Install and run

```bash
git clone https://github.com/AkitaEngineering/p0stmaster.git
cd p0stmaster
npm ci
npm run start          # builds and serves at http://localhost:4173
```

### Run the desktop app

```bash
npm run desktop
```

### Build distributable artifacts

```bash
npm run desktop:mac    # universal macOS dmg + zip
npm run desktop:win    # Windows NSIS installer + portable exe
```

Artifacts are written to `release/`.

## Configuration

All configuration happens inside the app through **Settings** (gear icon).

### AI drafting

Add at least one API key per workspace:

| Provider | Key type |
|---|---|
| OpenAI / ChatGPT | OpenAI API key |
| Google Gemini | Gemini API key |
| Anthropic Claude | Claude API key |

### Live publishing

1. Add your **Ayrshare API key**
2. Create a **managed account** for each platform you want to publish to
3. For **Instagram, Pinterest, YouTube, and TikTok**: provide a public media URL for each draft
4. If **approval is enabled**, approve the draft before publishing

### Live feeds

Add feed sources in Settings:

- RSS / Atom URLs (blogs, news sites, industry feeds)
- YouTube channel or playlist feed URLs
- Any public endpoint compatible with RSS Parser

## Available Scripts

| Command | Description |
|---|---|
| `npm run build` | Compile Tailwind CSS + bundle React into `dist/` |
| `npm run serve` | Start the local HTTP server on port `4173` |
| `npm run start` | Build and serve in one step |
| `npm run desktop` | Build and launch Electron locally |
| `npm run desktop:mac` | Build unsigned universal macOS artifacts |
| `npm run desktop:win` | Build unsigned Windows artifacts |

## Project Layout

```
p0stmaster.jsx          Main app state, persistence, orchestration, publish flow
components/
  AppHeader.jsx         Theme switcher, settings access, save banner
  ComposerPanel.jsx     Client selection, planning, drafting, media, publishing
  PreviewPanel.jsx      Platform previews, compliance, brand kit, feeds, history
  ConfigurationModal.jsx  Client, AI, social, brand, governance, account, feed config
  AboutModal.jsx        App info and version
serve.js                Local HTTP server with AI, feeds, and publish proxy routes
electron/main.js        Electron bootstrap: server launch + BrowserWindow
src/main.jsx            React entry point
styles/tailwind.css     Tailwind source stylesheet
```

## Documentation

| Document | Description |
|---|---|
| [FEATURES.md](FEATURES.md) | Complete feature catalogue with details |
| [USER_MANUAL.md](USER_MANUAL.md) | Step-by-step user guide |
| [SETUP_MAC.md](SETUP_MAC.md) | macOS installation and first-launch guide |
| [SETUP_WINDOWS.md](SETUP_WINDOWS.md) | Windows installation and first-launch guide |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture and system design |
| [SALES_FLYER_OUTLINES.md](SALES_FLYER_OUTLINES.md) | AI-ready outlines for marketing flyers |

## Desktop Distribution

| Trigger | Result |
|---|---|
| Push to `main` | Updates `nightly-desktop` prerelease with fresh macOS + Windows artifacts |
| Push a tag like `v0.1.0` | Publishes a versioned GitHub Release |

## Operational Notes

- All data persists locally in an encrypted vault (AES-256-GCM) stored in browser/Electron storage
- The vault passphrase is currently defined in source code — future releases will migrate to OS-native secret storage
- macOS builds are unsigned: Gatekeeper will require right-click → Open or Open Anyway on first launch
- Windows builds are unsigned: SmartScreen will require More info → Run anyway on first launch

## Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Open a pull request

## License

See the repository for license details.

---

<p align="center">
  Built with React, Tailwind CSS, Electron, and a healthy distrust of per-seat SaaS pricing.<br/>
  <strong>Akita Engineering</strong>
</p>