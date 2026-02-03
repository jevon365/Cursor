# ⚡ Ultra-Quick Deployment (5 Minutes)

The absolute fastest way to get your app running.

## Railway One-Click (Recommended)

1. **Push to GitHub** (if not already)
2. **Go to Railway**: https://railway.app
3. **New Project** → **Deploy from GitHub repo**
4. **Add PostgreSQL** database
5. **Configure Backend**:
   - Root: `backend`
   - Start: `npm start`
   - Variables: Copy from `DEPLOYMENT_QUICKSTART.md`
6. **Run Schema**: PostgreSQL → Query → Paste `backend/src/db/schema.sql`
7. **Deploy Frontend**: Same process, root = `app-unified`

**Done!** Your app is live.

See `DEPLOYMENT_QUICKSTART.md` for detailed steps.
