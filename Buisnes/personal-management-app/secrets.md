# Local secrets and setup (do not commit)

This file is listed in `.gitignore`. Keep your real values here and in `.env` only.

---

## Your values

Paste your real values below. Use the same Client ID in `.env` as `VITE_GOOGLE_CLIENT_ID`.

- **Google OAuth Client ID:** (paste here)
- **Google OAuth Client secret:** (optional; not used by the app in the browser, but you may need it elsewhere)

Example `.env` in project root:

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

---

## Full setup (OAuth and deployment)

### 1. Google Cloud / OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or pick an existing one).
3. Enable **Google Calendar API**: APIs & Services → Library → search "Calendar API" → Enable.
4. Configure OAuth consent screen: APIs & Services → OAuth consent screen (External). Add your email as a **test user** so you can sign in while the app is in Testing.
5. Create credentials: APIs & Services → Credentials → Create credentials → OAuth client ID.
   - Application type: **Web application**.
   - **Authorized JavaScript origins** (protocol + host only):
     - `http://localhost:5174` (local dev)
     - `https://jevon365.github.io` (GitHub Pages)
   - **Authorized redirect URIs** (exact app URL):
     - `http://localhost:5174/` (local dev)
     - `https://jevon365.github.io/personal-management-app/`
6. Copy the **Client ID** into your `.env` as `VITE_GOOGLE_CLIENT_ID` and optionally into the "Your values" section above.

### 2. Local development

```bash
cd personal-management-app
npm install
```

Create a `.env` in the project root with:

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

Then:

```bash
npm run dev
```

Open `http://localhost:5174`. The first time you use the app, a calendar named **Task Manager** is created in your Google account.

### 3. Build for GitHub Pages

App URL: **https://jevon365.github.io/personal-management-app/**

```bash
GITHUB_PAGES=true npm run build
```

Deploy the contents of `dist/` to the repo/branch that serves that path (e.g. repo `personal-management-app` with Pages enabled).
