# macOS Setup

This guide covers two paths:

- running a downloaded unsigned Mac build
- building p0stmaster locally on a Mac

## What to Expect

Current Mac artifacts are:

- universal builds for Intel and Apple Silicon
- unsigned
- not notarized

That means macOS may block first launch until you explicitly allow the app.

## Option 1: Use a Downloaded Mac Build

Get the app from one of these places:

- GitHub Releases for tagged versions
- the `nightly-macos` prerelease for the latest `main` build
- GitHub Actions run artifacts if you are testing a specific run

Download either:

- the `.dmg`
- or the `.zip`

### First launch for an unsigned app

If macOS blocks the app:

1. Open the `.dmg` or extract the `.zip`
2. Move `p0stmaster.app` into `/Applications`
3. Right-click the app and choose `Open`
4. Confirm `Open` again in the system prompt

If macOS still blocks it:

1. Open `System Settings`
2. Go to `Privacy & Security`
3. Find the blocked-app message for p0stmaster
4. Click `Open Anyway`

If the quarantine attribute still causes trouble after you intentionally trust the app, you can remove it manually:

```bash
xattr -dr com.apple.quarantine /Applications/p0stmaster.app
```

Only do that for a build you trust.

## Option 2: Build Locally on macOS

### Prerequisites

- Node.js 20 recommended
- npm
- Xcode Command Line Tools

Install Xcode Command Line Tools if needed:

```bash
xcode-select --install
```

### Clone and install

```bash
git clone https://github.com/AkitaEngineering/p0stmaster.git
cd p0stmaster
npm ci
```

### Run locally in the browser

```bash
npm run serve
```

Open `http://localhost:4173`.

### Run the desktop app locally

```bash
npm run desktop
```

### Build Mac artifacts

```bash
npm run desktop:mac
```

Artifacts are written to:

```text
release/
```

Typical outputs:

- `*.dmg`
- `*.zip`
- `*.blockmap`

## First-Time In-App Setup

After the app opens:

1. Open Settings
2. Create or select a client workspace
3. Add one AI provider key if you want AI drafting
4. Add an Ayrshare API key if you want live publishing
5. Add managed accounts for each platform you want to publish to
6. Add optional feed sources for Live Feed Pulse

## Live Publish Requirements on Mac

Publishing rules are the same on Mac as other platforms.

You need:

- an Ayrshare API key
- at least one mapped account per selected platform
- a public media URL for Instagram, Pinterest, YouTube, and TikTok
- approval first if the client workspace requires approval

## Troubleshooting

### The app will not open because it is from an unidentified developer

Use the right-click `Open` flow first. If that fails, use `Privacy & Security` then `Open Anyway`.

### The app opens but publishing does not work

Check:

- Ayrshare API key is present
- the selected platform has a mapped account
- media URL is present for media-required platforms
- the draft is approved if approval is enabled

### AI drafting fails

Check:

- the active client has the correct AI provider selected
- the corresponding API key is populated
- your network allows outbound provider requests

### Live feeds do not load

Check:

- the feed URLs use `http` or `https`
- the source is public and reachable from your Mac
- the feed actually returns RSS, Atom, or a supported feed format

### Where are Mac builds produced in CI?

The repository workflow publishes:

- a `nightly-macos` prerelease from `main`
- versioned releases for tags like `v0.1.0`

If you only need the newest build, start with the nightly prerelease.