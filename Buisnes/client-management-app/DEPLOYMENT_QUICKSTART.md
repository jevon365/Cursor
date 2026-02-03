# 🚀 Quick Deployment Guide

Get your Management App running in production in 15 minutes!

**Want to avoid cloud costs?** Host locally instead—see [`LOCAL_HOSTING.md`](LOCAL_HOSTING.md). Use this guide only when you need a **shareable live URL** or **always-on** hosting. Railway free tier has limited credit; set a spending limit to avoid overages.

---

## Option 1: Railway (Easiest - Recommended)

### Prerequisites
- GitHub account
- Railway account (free at [railway.app](https://railway.app))

### Step-by-Step

#### 1. Deploy Backend (5 min)

1. Go to [railway.app](https://railway.app) → New Project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Click "New" → "GitHub Repo" → Select your repo
4. In the service settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Go to "Variables" tab, add:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<click "Add Reference" → select PostgreSQL → DATABASE_URL>
   JWT_SECRET=<click "Generate" to create a random secret>
   CLIENT_APP_URL=<we'll update this after deploying frontend>
   ADMIN_APP_URL=<we'll update this after deploying frontend>
   ```
6. **Run Database Schema**:
   - Go to PostgreSQL service → "Connect" → "Query"
   - Copy entire contents of `backend/src/db/schema.sql`
   - Paste and click "Run"
7. **Deploy**: Railway auto-deploys on push, or click "Deploy" button

#### 2. Deploy Unified App (3 min)

1. In same Railway project, click "New" → "GitHub Repo" → Select same repo
2. Settings:
   - **Root Directory**: `app-unified`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 5173`
3. Variables:
   ```
   VITE_API_URL=<your backend URL from step 1>
   ```
4. Deploy!

#### 3. Update CORS (2 min)

Go back to Backend service → Variables:
- Update `CLIENT_APP_URL` to your unified app URL (same as admin since it's unified)
- Update `ADMIN_APP_URL` to your unified app URL
- Redeploy backend (or it auto-redeploys)

#### 5. Test! (2 min)

1. Visit your client portal URL
2. Register a new account
3. Visit admin portal URL  
4. Register an admin account
5. Test creating projects, requests, tasks!

---

## Option 2: Render (Alternative)

### Backend

1. [render.com](https://render.com) → New → Web Service
2. Connect GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add PostgreSQL: New → PostgreSQL
5. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<from PostgreSQL service>
   JWT_SECRET=<generate random string>
   CLIENT_APP_URL=<update after frontend deploy>
   ADMIN_APP_URL=<update after frontend deploy>
   ```
6. Run schema via Render PostgreSQL dashboard

### Frontend (Both Apps)

1. New → Static Site
2. Connect GitHub repo
3. Settings:
   - **Root Directory**: `app-unified`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=<your backend URL>
   ```

---

## 🔍 Verify Everything Works

### Checklist

- [ ] Backend health check: `https://your-backend.railway.app/health` returns `{"status":"ok"}`
- [ ] Client portal loads and shows login page
- [ ] Admin portal loads and shows login page
- [ ] Can register new user in client portal
- [ ] Can register admin in admin portal
- [ ] Can login to both portals
- [ ] Can create project (admin)
- [ ] Can create request (client)
- [ ] Can create task (admin)
- [ ] Kanban board works (admin)

---

## 🐛 Common Issues

### "Cannot connect to database"
- ✅ Check `DATABASE_URL` is set correctly
- ✅ Verify schema.sql was executed
- ✅ Check database is running in Railway/Render

### "CORS error" in browser console
- ✅ Update backend `CLIENT_APP_URL` and `ADMIN_APP_URL` variables
- ✅ Make sure URLs match exactly (including https://)
- ✅ Redeploy backend after updating

### "API request failed"
- ✅ Check `VITE_API_URL` in frontend is correct
- ✅ Verify backend is running (check health endpoint)
- ✅ Check browser console for specific error

### Frontend shows blank page
- ✅ Check build completed successfully
- ✅ Verify `VITE_API_URL` is set
- ✅ Check browser console for errors

---

## 📝 Environment Variables Reference

### Backend
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...  # Auto-provided by Railway/Render
JWT_SECRET=<random-string>     # Generate with: openssl rand -hex 32
CLIENT_APP_URL=https://your-unified-app.railway.app
ADMIN_APP_URL=https://your-unified-app.railway.app
```

### Frontend (Unified App)
```bash
VITE_API_URL=https://your-backend.railway.app
```

---

## 🎉 You're Done!

Your app should now be live and testable. Share the URLs with your team!

**Next Steps:**
- Test all features thoroughly
- Add error logging (Sentry)
- Set up monitoring
- Configure custom domain (optional)
