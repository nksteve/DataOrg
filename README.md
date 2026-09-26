# MyVault

Treeview browser/editor for the "2nd" Google Drive folder (healthcare, finances,
property, vehicles, IDs, work, travel, disputes, etc). React + Vite, deployed to
GitHub Pages, talks to the Drive API directly from the browser (no backend server)
so it works from a phone browser too.

## Features
- Folder tree (sidebar) + file list (main pane), like a Files app
- Click a file to preview it inline (PDF/image/doc via Drive's own preview)
- Rename, move (folder picker), delete (to Drive trash, recoverable), tag/categorize
- New folder, upload, and a name search across Drive
- Sign in with your Google account - the app only acts as you, on your Drive

## One-time setup: Google OAuth Client ID

MyVault needs an OAuth Client ID so Google will let it ask you to sign in.
This only needs to be done once.

1. Go to https://console.cloud.google.com/ and create a new project (or pick an existing one), e.g. "MyVault".
2. In the left menu: **APIs & Services -> Enabled APIs & services -> + Enable APIs and services**. Search for "Google Drive API" and enable it.
3. **APIs & Services -> OAuth consent screen**:
   - User type: **External**
   - App name: MyVault, your email as support/developer contact
   - Publishing status: leave as **Testing** (no Google verification needed this way)
   - Under "Test users", add `nksteve@gmail.com`
4. **APIs & Services -> Credentials -> + Create credentials -> OAuth client ID**:
   - Application type: **Web application**
   - Name: MyVault
   - Authorized JavaScript origins, add both:
     - `http://localhost:3010`
     - `https://nksteve.github.io`
   - Leave "Authorized redirect URIs" empty (not needed for this flow)
   - Click Create - copy the **Client ID** (looks like `xxxxx.apps.googleusercontent.com`)
5. Paste that Client ID into `src/config.js`, replacing `PUT_YOUR_OAUTH_CLIENT_ID_HERE...`.

Because the consent screen stays in "Testing" mode with just your account as a
test user, Google won't require the app to go through security verification -
this is exactly the personal-use case that mode is for. The one caveat: Google
periodically requires you to re-consent (roughly every 7 days) since the app
isn't verified - just click "Sign in with Google" again when that happens.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:3010 (make sure this origin is in your OAuth client's
authorized origins, per step 4 above).

## Deploy

Push to `main` - a GitHub Action builds and publishes to GitHub Pages automatically.
First-time only: in the repo's Settings -> Pages, set Source to "GitHub Actions".

The live app will be at https://nksteve.github.io/MyVault/
