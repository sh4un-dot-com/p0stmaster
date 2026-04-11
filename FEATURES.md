# Features

Complete feature catalogue for p0stmaster.

---

## Multi-Client Workspace System

Manage multiple clients from a single app instance without logging in and out.

- **Isolated workspaces** — each client has its own name, company, contact info, notes, API keys, brands, accounts, feeds, and governance rules
- **Instant switching** — select a workspace from the Client Mode dropdown and every panel updates immediately
- **No cross-contamination** — credentials, brand kits, and publishing accounts are scoped per client

### Use cases

- Agencies managing 10+ brand accounts from one desktop
- Freelancers keeping personal projects separate from client work
- In-house teams with multiple product lines or regions

---

## AI-Powered Content Generation

Three leading AI providers are natively supported — configure per workspace so each client can use a different model.

| Provider | Model family | Key type |
|---|---|---|
| OpenAI / ChatGPT | GPT-4o mini | OpenAI API key |
| Google Gemini | Gemini 2.0 Flash | Gemini API key |
| Anthropic Claude | Claude 3.5 Sonnet | Claude API key |

### AI Studio capabilities

- **Draft generation** — generate a full post from a theme, goal, and brand context
- **Hook generation** — produce five scroll-stopping openers using different psychological angles
- **Brand polish** — tighten positioning and rewrite for a more executive, campaign-ready tone
- **Hashtag generation** — append concise discovery hashtags without turning the post into spam
- **Platform-native rewrites** — adapt a single draft into tone-matched, character-count-aware versions for each selected platform
- **Draft critique** — score the hook, CTA, platform fit, and voice alignment, then return specific fixes and a stronger rewrite
- **A/B variants** — generate multiple testable versions built around different persuasion angles
- **Audience rewrites** — tailor the same message for cold audiences, warm communities, and decision-makers
- **Thread / carousel conversion** — turn one post into a multi-part sequence with reusable thread cards
- **Trend Spark** — use live feed headlines and excerpts as AI context for timely, original posts
- **AI calendar generation** — build a strategic 7-day content plan directly from AI Studio

### AI Studio workflow

- **Create** — draft, hooks, thread/carousel, Trend Spark
- **Optimize** — polish, hashtags, adapt, critique
- **Strategy** — A/B variants, audiences, calendar

---

## Live Publishing via Ayrshare

Publish directly to seven major platforms through the Ayrshare API — no manual copy-paste, no switching tabs.

### Supported platforms

| Platform | Post types | Media required |
|---|---|---|
| Facebook | Feed posts, link posts | No |
| Instagram | Feed posts, stories | Yes — public media URL |
| LinkedIn | Feed posts, articles | No |
| Pinterest | Pins | Yes — public media URL |
| X (Twitter) | Tweets, threads | No |
| YouTube | Videos | Yes — public media URL |
| TikTok | Videos | Yes — public media URL |

### Publishing features

- **Connected delivery status** — real-time indicators show which platforms are ready vs. missing mappings
- **Publish gating** — the app enforces all prerequisites (API key, mapped account, media URL, approval) before enabling the publish button
- **Publish status feedback** — per-platform success/failure reporting after publish
- **Account mapping** — each platform maps to a specific managed account with label, handle, brand, and role

---

## Platform-Native Previews

See how your content will actually look before it goes live. Previews render using the actual layout patterns of each platform.

- **Instagram Feed** — square media frame, handle, caption, interaction icons
- **Facebook Feed** — card layout with link preview, caption, engagement bar
- **LinkedIn Feed** — professional card with brand name, voice label, landscape media
- **X (Twitter)** — tweet bubble with handle, compact caption, inline media
- **TikTok** — vertical card with gradient avatar, adapted caption
- **YouTube** — video thumbnail with channel and description
- **Pinterest** — pin-style vertical card with board context

### Preview controls

- **Mobile / Desktop toggle** — switch between responsive layouts
- **Live content sync** — previews update in real time as you type
- **Media rendering** — uploaded images and videos display in the correct aspect ratios per platform

---

## Campaign Planning

Go from theme to full content calendar in seconds.

- **Quick planner** — provide a theme, frequency, and goal → get a multi-day calendar with titles, dates, and platform targets
- **AI calendar** — generate a 7-day strategic plan with launch, educate, behind-the-scenes, proof, engagement, trend, and CTA slots
- **Build campaign** — expand the active plan into ready-to-edit drafts
- **One-click campaign view** — see the first 3 items inline with full detail expansion

---

## Approval Workflow

Built-in governance for teams that require review before publishing.

- **Draft → Pending → Approved** — three-state approval lifecycle per draft
- **Request approval** — content creators submit for review
- **Approve now** — reviewers approve with one click
- **Publish gating** — when approval is required, the publish button stays disabled until the draft is approved
- **Per-client toggle** — approval workflow is a governance flag that can be enabled or disabled per workspace

---

## Brand Kit and Compliance

### Brand profiles

Each workspace supports multiple brand profiles with:

- Brand name and market/city
- Brand voice description
- Hashtag library
- Primary colour
- Template library
- Font preferences
- CTA library

### Brand kit analysis

- Upload a logo image and p0stmaster will extract:
  - Colour palette (up to 4 dominant swatches)
  - Image dimensions
  - Visual brand signals

### Compliance scanner

- Automatic brand-safety checks on draft content
- Platform-specific alerts (e.g., character limits, media requirements)
- Warnings surface in the preview panel before you publish

---

## Live Feed Pulse

Ingest real-time content from the web to surface trends and inspire content.

### Supported feed types

| Type | Source examples |
|---|---|
| RSS | Blog feeds, news sites, industry publications |
| Atom | WordPress sites, Medium, Substack |
| YouTube | Channel feeds, playlist feeds |

### Feed features

- **Per-client feed sources** — each workspace has its own feed list
- **Enable/disable per source** — toggle feeds without deleting them
- **Live refresh** — pull the latest items on demand
- **Trend extraction** — surface trending topics and keywords from aggregated feed data
- **Trend Spark integration** — push live headlines and excerpts into AI Studio to generate timely posts
- **Last-updated timestamp** — see exactly when feeds were last refreshed

---

## Content Composer

The left-panel composer is the primary workspace for creating content.

- **Rich text editor** with content area, notes field, and link field
- **Platform selector** — toggle each of the 7 platforms on/off per draft
- **Post type selector** — feed post, story, reel, etc.
- **Media upload** — attach images and videos with drag-and-drop or file picker
- **Public media URL field** — for platforms that require a hosted URL (Instagram, Pinterest, YouTube, TikTok)
- **Pinterest board field** — specify the target board for Pinterest pins
- **AI Studio** — create, optimize, and strategize without leaving the composer
- **Clickable AI results** — apply A/B variants or individual thread parts straight back into the active draft

---

## Draft History and Action Log

Never lose work and always know what happened.

- **Draft history** — every save creates a timestamped history entry; browse and restore previous versions
- **Action log** — a chronological record of key actions (publishes, AI calls, approvals, saves)
- **Relative timestamps** — "2 minutes ago", "1 hour ago" for quick scanning

---

## Encrypted Local Persistence

All app state is stored locally with no cloud dependency.

- **AES-256-GCM encryption** — vault is encrypted with a PBKDF2-derived key (250,000 iterations, SHA-256)
- **Persisted data** — config, current draft, draft history, action log, plans, trends, feeds, theme
- **Browser storage backend** — works in both Electron and browser modes
- **No account required** — no sign-up, no login, no server-side storage

---

## Themes

Three built-in colour palettes:

| Theme | Style |
|---|---|
| **Dark** | Slate/indigo on black — default |
| **Light** | White cards on light grey |
| **FM** | Fuchsia/purple neon on black |

Theme selection persists across sessions.

---

## Desktop App (Electron)

p0stmaster ships as a native desktop application for macOS and Windows.

- **macOS** — universal build supporting both Apple Silicon and Intel; distributed as `.dmg` and `.zip`
- **Windows** — distributed as NSIS installer and portable `.exe`
- **Auto-ephemeral port** — the Electron shell starts the local server on port `0` and connects automatically
- **Nightly builds** — every push to `main` publishes fresh artifacts to the `nightly-desktop` prerelease
- **Versioned releases** — tags like `v0.1.0` publish full GitHub Releases

---

## Web Mode

No Electron required — run p0stmaster in any modern browser.

```bash
npm run start
# → http://localhost:4173
```

All features work in the browser, including AI generation, live publishing, and encrypted persistence.

---

## Technical Highlights

| Area | Detail |
|---|---|
| Frontend | React 18, Tailwind CSS 3, Lucide icons |
| Bundler | esbuild for fast builds |
| Server | Plain Node.js HTTP server with zero framework dependencies |
| Desktop | Electron 41 |
| Encryption | Web Crypto API — PBKDF2 + AES-256-GCM |
| Feed parsing | rss-parser |
| Publishing API | Ayrshare REST API |
| AI proxying | Server-side proxy to OpenAI, Gemini, and Claude APIs |
| CI/CD | GitHub Actions with macOS and Windows matrix builds |
