# User Manual

Complete guide to using p0stmaster for social content planning, creation, and publishing.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Interface](#the-interface)
3. [Setting Up Your First Workspace](#setting-up-your-first-workspace)
4. [Configuring AI Providers](#configuring-ai-providers)
5. [Configuring Live Publishing](#configuring-live-publishing)
6. [Setting Up Brands](#setting-up-brands)
7. [Managing Accounts](#managing-accounts)
8. [Adding Feed Sources](#adding-feed-sources)
9. [Creating Content](#creating-content)
10. [Using AI Features](#using-ai-features)
11. [Previewing Content](#previewing-content)
12. [Publishing Content](#publishing-content)
13. [Campaign Planning](#campaign-planning)
14. [Approval Workflow](#approval-workflow)
15. [Brand Kit Analysis](#brand-kit-analysis)
16. [Live Feed Pulse](#live-feed-pulse)
17. [Draft History](#draft-history)
18. [Themes](#themes)
19. [Keyboard Shortcuts and Tips](#keyboard-shortcuts-and-tips)
20. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Launching the app

**Desktop (Electron):**
- **Windows:** Run the installer or portable `.exe` from [GitHub Releases](https://github.com/AkitaEngineering/p0stmaster/releases)
- **macOS:** Open the `.dmg` or extract the `.zip` and move to Applications

**Browser mode:**
```bash
npm run start
```
Open `http://localhost:4173` in any modern browser.

### First-time checklist

1. Open the app
2. Click the **gear icon** (⚙) to open Settings
3. Create or rename your first workspace
4. Add at least one AI provider API key (optional but recommended)
5. Add an Ayrshare API key for live publishing (optional)
6. Create managed accounts for your target platforms
7. Set up a brand profile
8. Add feed sources for trend monitoring (optional)
9. Close Settings and start creating

---

## The Interface

p0stmaster has a two-panel layout:

### Left panel — Composer

This is where you create and manage content:

- **Client Mode** — workspace selector and account picker
- **Campaign Planning** — generate calendars and build campaigns
- **Content editor** — write your post, add media, configure platforms
- **AI Studio** — generate, optimize, critique, and plan content without leaving the composer
- **Publish controls** — connected delivery status and publish button

### Right panel — Preview

This is where you see and validate content:

- **Platform previews** — live-rendered mockups for Instagram, Facebook, LinkedIn, X, TikTok, YouTube, and Pinterest
- **Compliance scanner** — brand safety warnings and platform alerts
- **Brand kit** — colour palette, logo, and brand signals
- **Trend panel** — trending topics from your feeds
- **Live Feed Pulse** — latest items from your configured feed sources
- **Draft history** — timestamped previous versions
- **Action log** — chronological record of all actions

### Header bar

- **Theme switcher** — toggle between Dark, Light, and FM themes
- **Settings** — open the configuration modal
- **Save indicator** — shows when vault data has been saved
- **App version** — displayed in the header

---

## Setting Up Your First Workspace

1. Open **Settings** (gear icon)
2. You will see a default workspace called "Workspace"
3. Edit the **workspace name** to identify the client or project
4. Fill in optional fields:
   - **Company** — the client's company name
   - **Contact name** — primary contact for this workspace
   - **Contact email** — contact's email address
   - **Notes** — any notes about this workspace
5. Click **Save** or close Settings

### Creating additional workspaces

1. In Settings, click **Add Client** or the "+" button
2. A new blank workspace is created
3. Configure it with its own name, credentials, and accounts
4. Switch between workspaces using the **Client Workspace** dropdown in the composer

---

## Configuring AI Providers

Each workspace can use a different AI provider. AI Studio always uses the provider configured for the currently selected workspace.

1. Open **Settings**
2. Go to the **AI Provider** section
3. Select your preferred provider from the dropdown:
   - **OpenAI / ChatGPT**
   - **Google Gemini**
   - **Anthropic Claude**
4. Paste the corresponding **API key** into the key field
5. Save

### Getting API keys

| Provider | Where to get a key |
|---|---|
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Anthropic Claude | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |

> Your API keys are stored locally in the encrypted vault. They are never sent anywhere except to the corresponding provider's API.

---

## Configuring Live Publishing

Live publishing uses the [Ayrshare](https://www.ayrshare.com/) API to post content directly to social platforms.

1. Open **Settings**
2. Go to the **Social API Keys** section
3. Paste your **Ayrshare API key**
4. Save

### Platform requirements

| Platform | Needs media URL? | Additional requirements |
|---|---|---|
| Facebook | No | Mapped account |
| Instagram | Yes | Mapped account + public media URL |
| LinkedIn | No | Mapped account |
| Pinterest | Yes | Mapped account + public media URL + board name |
| X (Twitter) | No | Mapped account |
| YouTube | Yes | Mapped account + public media URL |
| TikTok | Yes | Mapped account + public media URL |

---

## Setting Up Brands

Brands define the visual and tonal identity for content in a workspace.

1. Open **Settings**
2. Go to the **Brands** section
3. Click **Add Brand**
4. Fill in:
   - **Brand name** — e.g., "Acme Corp"
   - **City / Market** — e.g., "Toronto, ON"
   - **Voice** — e.g., "Professional but approachable"
   - **Primary colour** — hex colour picker
   - **Hashtags** — comma-separated list
   - **Templates** — reusable content templates
   - **Fonts** — preferred fonts
   - **CTA library** — pre-written calls to action
5. Save

Brands are linked to managed accounts, so each social account can be associated with a specific brand profile.

---

## Managing Accounts

Managed accounts represent your social media profiles.

1. Open **Settings**
2. Go to the **Accounts** section
3. Click **Add Account**
4. Fill in:
   - **Platform** — Instagram, Facebook, LinkedIn, Pinterest, X, YouTube, or TikTok
   - **Label** — a friendly name (e.g., "Main IG Account")
   - **Handle** — the platform handle (e.g., "@acmecorp")
   - **Brand** — link to a brand profile
   - **Role** — the operator role allowed to publish through this mapping (`creator`, `reviewer`, `publisher`, or `admin`)
5. Save

### Why accounts matter for publishing

The publish system checks that each selected platform has a mapped account. If you select Instagram but have no Instagram account configured, the app will warn you and block publish.

---

## Adding Feed Sources

Feed sources power the Live Feed Pulse feature.

1. Open **Settings**
2. Go to the **Feed Sources** section
3. Click **Add Feed Source**
4. Fill in:
   - **Label** — friendly name (e.g., "TechCrunch")
   - **Type** — RSS, YouTube, or News
   - **URL** — the feed URL (e.g., `https://techcrunch.com/feed`)
   - **Enabled** — toggle on/off
5. Save

---

## Creating Content

### Writing a post

1. Select your target **platforms** by clicking the platform icons (Instagram, Facebook, LinkedIn, etc.)
2. Choose a **post type** (feed, story, reel, etc.)
3. Write your content in the **content area**
4. Optionally add:
   - **Theme** — the topic or campaign theme
   - **Frequency** — posting frequency
   - **Goal** — campaign objective
   - **Notes** — internal notes
   - **Link** — URL to include in the post
5. See your content update in real time in the preview panel

### Adding media

1. Click the **media upload** area or drag and drop files
2. Supported formats: images (JPG, PNG, WebP, SVG) and videos
3. Media appears in the preview panel rendered in each platform's aspect ratio
4. To remove media, click the **trash icon** on the media item

### Public media URL

For platforms that require hosted media (Instagram, Pinterest, YouTube, TikTok):

1. Upload your media to a hosting service (e.g., your website, S3, Cloudinary)
2. Paste the **public URL** into the "Publish Media URL" field
3. This URL is what Ayrshare uses to attach media to the published post

---

## Using AI Features

Click the **AI Studio** button (sparkles icon) in the composer to access AI features.

### Available AI actions

| Action | What it does |
|---|---|
| **Draft** | Creates a fresh post from your theme, goal, notes, platforms, and brand context |
| **Hooks** | Generates five opening lines with different persuasion styles, then writes a stronger post |
| **Thread / Carousel** | Converts one message into a multi-part thread or carousel sequence |
| **Trend Spark** | Uses your live feed items as context for timely, trend-led copy |
| **Polish** | Rewrites the current draft in a tighter, more executive tone |
| **Hashtags** | Appends concise, platform-ready discovery hashtags |
| **Adapt** | Generates platform-specific preview copy for each selected platform |
| **Critique** | Scores the draft and returns specific improvements plus a stronger rewrite |
| **A/B Variants** | Produces multiple testable versions of the same message |
| **Audiences** | Rewrites the post for cold audiences, warm communities, and decision-makers |
| **Calendar** | Generates a 7-day strategic content calendar |

### What happens after each AI action

- **Draft, Hooks, Trend Spark, Polish, and Hashtags** update the main draft text
- **Adapt** updates the platform preview copy without overwriting every preview with the same caption
- **Critique** opens a review block with a score, fixes, and a rewrite recommendation
- **A/B Variants** and **Thread / Carousel** create selectable cards you can click to apply back into the draft
- **Audiences** updates the audience-variant area with AI-generated segment rewrites
- **Calendar** replaces the current content calendar with an AI-generated 7-day plan

### Tips for better AI output

- Fill in the **theme**, **goal**, and **brand voice** before generating — the AI uses these as context
- The more specific your notes, the more targeted the output
- Select your target **platforms** before running **Adapt** so the AI knows exactly what to optimize for
- Refresh **Live Feed Pulse** before using **Trend Spark** if you want the AI to react to the latest headlines
- Use **Critique** before requesting approval to catch weak hooks, vague CTAs, or platform-fit issues early
- Review and edit AI output — it's a starting point, not a final draft

---

## Previewing Content

The right panel shows live previews that update as you type.

### Platform previews

Each platform preview mimics the actual post layout:

- **Instagram** — square aspect ratio, avatar, handle, caption
- **LinkedIn** — professional card with landscape media
- **X (Twitter)** — tweet-style with compact text
- **TikTok** — vertical format with brand avatar
- **Facebook** — card with engagement bar
- **YouTube** — video thumbnail layout
- **Pinterest** — vertical pin card

### Mobile vs. Desktop

Toggle the **Mobile / Desktop** switch in the preview header to see how posts render on different screen sizes.

### Compliance warnings

The compliance scanner runs automatically and surfaces:

- Character count warnings per platform
- Missing media warnings for platforms that require it
- Brand safety alerts based on governance rules
- Unmapped platform warnings

When **Brand Safe** is enabled, brand-safety warnings become publish blockers instead of advisory warnings.

---

## Publishing Content

### Pre-publish checklist

Before the publish button activates, verify:

- [ ] At least one platform is selected
- [ ] Content is not empty
- [ ] Ayrshare API key is configured
- [ ] Each selected platform has a mapped account
- [ ] Media-required platforms have a public media URL
- [ ] Draft is approved (if approval is required)
- [ ] Brand-safe warnings are cleared (if Brand Safe is enabled)
- [ ] Selected platform accounts share the active role label (if Role Based is enabled)

### Publishing

1. Verify the **Connected Delivery** status shows your platforms as ready
2. Click the **Publish** button
3. The app sends your content through the Ayrshare API to all selected platforms
4. A status message confirms success or reports per-platform errors

### After publishing

- The publish action is logged in the **Action Log**
- The draft is saved to **Draft History**
- Platform-specific results are displayed in the publisher status area

---

## Campaign Planning

### Generating a plan

1. Fill in the **Theme** (e.g., "Summer product launch")
2. Set the **Frequency** (e.g., "3x per week")
3. Set the **Goal** (e.g., "Drive website traffic")
4. Click **Generate plan**
5. A multi-day calendar appears with titles, dates, and platform targets

### Generating an AI calendar

1. Open **AI Studio** in the composer
2. Click **Calendar** in the **Strategy** section
3. Wait for the AI to generate a 7-day plan
4. Review the day-by-day titles and platform targets in the planner area
5. Edit the draft theme, goal, or platforms and rerun if you want a different strategy mix

### Building a campaign

1. After generating a plan, click **Build campaign**
2. Each calendar item is expanded into an editable draft
3. Review, edit, and publish each piece individually

---

## Approval Workflow

When approval is enabled for a workspace:

### For content creators

1. Create your content as normal
2. Click **Request approval** — the draft status changes to "pending"
3. Wait for approval before publishing

### For reviewers

1. Review the content in the preview panel
2. Click **Approve now** — the draft status changes to "approved"
3. The publish button becomes active

### Configuring approval

1. Open **Settings**
2. Go to the **Governance** section
3. Toggle **Approval Required** on or off
4. Additional governance options:
   - **Brand Safe** — block publish when the compliance scanner finds brand-safety issues
   - **Role Based** — require every selected platform mapping to share the active managed-account role before publish
   - **Current Operator Role** — set the local role for this workspace so approval and publish actions follow reviewer/publisher/admin rules

---

## Brand Kit Analysis

Upload a logo to automatically extract brand signals.

1. In the preview panel, find the **Brand Kit** section
2. Click **Upload Logo** and select an image file
3. p0stmaster analyses the image and extracts:
   - Dominant colour palette (up to 4 swatches)
   - Image dimensions
   - Visual brand signals
4. Use the extracted colours to inform your content design

---

## Live Feed Pulse

Monitor trends and get content inspiration from live feeds.

1. Configure feed sources in Settings (see [Adding Feed Sources](#adding-feed-sources))
2. In the preview panel, find the **Live Feed Pulse** section
3. Click **Refresh** to pull the latest items
4. Browse headlines and summaries from your configured sources
5. Use **Trend Spark** in AI Studio to turn those items into ready-to-edit content

### Trend extraction

The trend panel aggregates keywords and topics across all your feed sources, surfacing what's currently hot in your industry.

---

## Draft History

Every time you save or modify a draft, a timestamped copy is stored.

1. In the preview panel, find the **Draft History** section
2. Browse previous versions with relative timestamps
3. Click a history entry to restore that version

---

## Themes

Switch visual themes from the header bar.

| Theme | Description |
|---|---|
| **Dark** | Default — slate and indigo on black |
| **Light** | White cards on light grey background |
| **FM** | Neon fuchsia and purple on black |

Your theme selection persists across sessions.

---

## Keyboard Shortcuts and Tips

- **Ctrl/Cmd + S** — save current state (if implemented)
- Use **AI Studio** for quick content iterations without leaving the composer
- **Drag and drop** media directly into the upload zone
- Toggle platforms on/off to quickly see how content adapts
- Use **mobile preview** to catch layout issues before publishing

---

## Troubleshooting

### The app will not open

- **macOS:** Right-click → Open, or use System Settings → Privacy & Security → Open Anyway. See [SETUP_MAC.md](SETUP_MAC.md).
- **Windows:** Click More info → Run anyway on the SmartScreen prompt. See [SETUP_WINDOWS.md](SETUP_WINDOWS.md).

### AI Studio is not working

1. Open Settings and verify the correct AI provider is selected
2. Confirm the API key is entered for that provider
3. Check that your network allows outbound HTTPS requests
4. Verify your API key has available quota/credits

### Publishing fails

1. Verify your Ayrshare API key is entered in Settings
2. Check that each selected platform has a mapped account
3. For Instagram/Pinterest/YouTube/TikTok, confirm you have a public media URL
4. If approval is required, make sure the draft is approved
5. Check the publish status area for per-platform error messages

### Live feeds are not loading

1. Verify the feed URL is correct and uses `http://` or `https://`
2. Confirm the source is publicly accessible
3. Check that the feed returns valid RSS, Atom, or supported XML
4. Try the feed URL directly in a browser to verify it loads

### Data seems missing after reopening

All data is stored in the browser's local storage (encrypted vault). If you:
- Cleared browser data, the vault is gone
- Switched browsers, each browser has its own vault
- In Electron, data persists in the app's storage directory

### Previews look wrong

- Check that you have content in the draft
- Verify media is uploaded (some platforms show placeholder icons without media)
- Toggle between Mobile and Desktop to compare layouts
