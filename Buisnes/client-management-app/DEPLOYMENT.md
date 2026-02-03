# Deployment Guide - Management App

This guide will help you deploy the Management App to a hosting platform so you can test it live.

## 🚀 Quick Start - Railway (Recommended)

Railway is the fastest way to get your app running. It has a free tier and handles PostgreSQL automatically.

### Step 1: Install Railway CLI (Optional but helpful)
```bash
npm i -g @railway/cli
```

### Step 2: Deploy Backend

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Create New Project**: Click "New Project"
3. **Add PostgreSQL**: Click "New" → "Database" → "Add PostgreSQL"
4. **Deploy Backend**:
   - Click "New" → "GitHub Repo" (or "Empty Project" to upload)
   - Select your repository
   - Railway will auto-detect Node.js
   - Set **Root Directory** to `backend`
   - Set **Start Command** to `npm start`

5. **Configure Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<from PostgreSQL service>
   JWT_SECRET=<generate a random string, e.g., openssl rand -hex 32>
   CLIENT_APP_URL=<your client app URL>
   ADMIN_APP_URL=<your admin app URL>
   ```

6. **Run Database Schema**:
   - In Railway, go to your PostgreSQL service
   - Click "Connect" → "Query"
   - Copy contents of `backend/src/db/schema.sql`
   - Paste and execute

7. **Seed Database** (optional):
   - In Railway backend service, open "Settings" → "Deploy"
   - Add a one-time command: `npm run seed`
   - Or connect via Railway CLI and run: `railway run npm run seed`

### Step 3: Deploy Unified App (app-unified)

1. **Create New Service** in same Railway project
2. **Deploy**:
   - Root Directory: `app-unified`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s dist -l 5173`
3. **Add to package.json** (if not exists):
   ```json
   "scripts": {
     "serve": "serve -s dist -l 5173"
   }
   ```
4. **Environment Variables**:
   ```
   VITE_API_URL=<your backend URL from Railway>
   ```

### Step 4: Update CORS in Backend

Update backend environment variables:
```
CLIENT_APP_URL=<your client portal URL>
ADMIN_APP_URL=<your admin portal URL>
```

---

## 🌐 Alternative: Render

### Backend Deployment

1. **Create Account**: [render.com](https://render.com)
2. **New Web Service**:
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
3. **Add PostgreSQL Database**:
   - New → PostgreSQL
   - Copy the Internal Database URL
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<from PostgreSQL>
   JWT_SECRET=<random string>
   CLIENT_APP_URL=<client URL>
   ADMIN_APP_URL=<admin URL>
   ```
5. **Run Schema**: Use Render's PostgreSQL dashboard or connect via psql

### Frontend Deployment

1. **New Static Site**:
   - Root Directory: `app-unified`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
2. **Environment Variables**:
   ```
   VITE_API_URL=<backend URL>
   ```

---

## 🔧 Local Production Build Test

Before deploying, test locally:

```bash
# Backend
cd backend
npm install
npm start  # Should run on port 3001

# Unified App
cd app-unified
npm install
npm run build
npx serve -s dist -l 5173
```

---

## 📋 Environment Variables Checklist

### Backend (.env)
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (or platform default)
- [ ] `DATABASE_URL=<postgres connection string>`
- [ ] `JWT_SECRET=<strong random secret>`
- [ ] `CLIENT_APP_URL=<production client URL>`
- [ ] `ADMIN_APP_URL=<production admin URL>`

### Unified App (.env.production)
- [ ] `VITE_API_URL=<production backend URL>`

---

## 🧪 Testing Your Deployment

1. **Health Check**: Visit `https://your-backend-url.railway.app/health`
2. **Register Test User**: 
   - Go to client portal
   - Register a new account
3. **Register Admin**:
   - Go to admin portal
   - Register (will be admin by default)
4. **Test Features**:
   - Create a project (admin)
   - Create a request (client)
   - Create a task (admin)
   - Test Kanban board

---

## 🐛 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct
- Verify database schema is run
- Check logs in Railway/Render dashboard

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend `CLIENT_APP_URL` and `ADMIN_APP_URL` match unified app URL

### Database connection errors
- Verify `DATABASE_URL` format
- Check if database is accessible from backend
- Ensure schema.sql has been executed

---

## 📝 Next Steps After Deployment

1. ✅ Test all features
2. ✅ Add error logging (Sentry)
3. ✅ Set up monitoring
4. ✅ Configure custom domain (optional)
5. ✅ Set up CI/CD for auto-deploy

---

## 🔗 Quick Links

- **Railway**: https://railway.app
- **Render**: https://render.com
- **Vercel** (frontend only): https://vercel.com
