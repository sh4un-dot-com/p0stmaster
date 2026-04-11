# Windows Setup

This guide covers two paths:

- running a downloaded unsigned Windows build
- building p0stmaster locally on Windows 10 or Windows 11

## What to Expect

Current Windows artifacts are:

- x64 NSIS installer builds
- x64 portable executable builds
- unsigned

That means Windows may show a SmartScreen warning until you explicitly allow the app.

## Option 1: Use a Downloaded Windows Build

Get the app from one of these places:

- GitHub Releases for tagged versions
- the `nightly-desktop` prerelease for the latest `main` build
- GitHub Actions run artifacts if you are testing a specific run

Download either:

- the installer `.exe`
- or the portable `.exe`

### First launch for an unsigned app

If Windows shows `Windows protected your PC`:

1. Click `More info`
2. Confirm the app name is `p0stmaster`
3. Click `Run anyway`

If Windows marks the file as downloaded from the internet and keeps warning:

1. Right-click the downloaded `.exe`
2. Choose `Properties`
3. On the `General` tab, check `Unblock` if present
4. Click `Apply`
5. Run the file again

Use the installer build if you want Start menu shortcuts and a standard install flow.

Use the portable build if you want to run the app directly without installing it.

Only bypass SmartScreen for a build you trust.

## Option 2: Build Locally on Windows

### Prerequisites

- Windows 10 or Windows 11
- Node.js 20 recommended
- npm

### Clone and install

```powershell
git clone https://github.com/AkitaEngineering/p0stmaster.git
cd p0stmaster
npm ci
```

### Run locally in the browser

```powershell
npm run serve
```

Open `http://localhost:4173`.

### Run the desktop app locally

```powershell
npm run desktop
```

### Build Windows artifacts

```powershell
npm run desktop:win
```

Artifacts are written to:

```text
release/
```

Typical outputs:

- `p0stmaster Setup *.exe`
- `p0stmaster *.exe`
- `*.blockmap`

## First-Time In-App Setup

After the app opens:

1. Open Settings
2. Create or select a client workspace
3. Add one AI provider key if you want AI drafting
4. Add an Ayrshare API key if you want live publishing
5. Add managed accounts for each platform you want to publish to
6. Add optional feed sources for Live Feed Pulse

## Live Publish Requirements on Windows

Publishing rules are the same on Windows as other platforms.

You need:

- an Ayrshare API key
- at least one mapped account per selected platform
- a public media URL for Instagram, Pinterest, YouTube, and TikTok
- approval first if the client workspace requires approval

## Troubleshooting

### The app will not open because Windows blocked it

Use the SmartScreen `More info` then `Run anyway` flow first. If the file still shows a downloaded-file warning, use the `Properties` then `Unblock` flow.

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
- the source is public and reachable from your Windows machine
- the feed actually returns RSS, Atom, or a supported feed format

### Where are Windows builds produced in CI?

The repository workflow publishes:

- a `nightly-desktop` prerelease from `main`
- versioned releases for tags like `v0.1.0`

If you only need the newest build, start with the nightly prerelease.