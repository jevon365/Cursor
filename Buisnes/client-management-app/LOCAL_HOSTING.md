# Local Hosting Guide – Run Everything on Your Machine

**Goal:** Run the full Management App stack locally so you can develop and test without spending money on cloud hosting. Use Railway/Render only when you need to share a live URL or outgrow local hosting.

---

## What Runs Locally

| Service       | Port | URL                     |
|---------------|------|-------------------------|
| Backend API   | 3001 | http://localhost:3001   |
| Unified App   | 5173 | http://localhost:5173   |
| PostgreSQL    | 5432 | localhost (internal)    |

---

## 1. Install PostgreSQL Locally

You need PostgreSQL on your machine. Pick one option.

### Option A: Official Windows Installer (simplest)

1. Download: https://www.postgresql.org/download/windows/
2. Run the installer. Remember the password you set for the `postgres` user.
3. Default port `5432` is fine. Install "Command Line Tools" if offered.

### Option B: Docker (if you use Docker)

```powershell
docker run -d --name management-app-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=management_app -p 5432:5432 postgres:16
```

Then use:
- Host: `localhost`, Port: `5432`, User: `postgres`, Password: `postgres`, Database: `management_app`

### Option C: Chocolatey

```powershell
choco install postgresql
```

Then create a database (see below).

---

## 2. Create the Database

Using **psql** (from PostgreSQL install or Docker):

```powershell
# If PostgreSQL bin is in PATH:
psql -U postgres -c "CREATE DATABASE management_app;"

# Or connect first, then:
# CREATE DATABASE management_app;
```

If you use Docker:

```powershell
docker exec -it management-app-db psql -U postgres -c "CREATE DATABASE management_app;"
```

---

## 3. Backend Setup

```powershell
cd backend
npm install
```

Create `backend\.env` (copy from `backend\.env.example` if it exists, or create manually):

```env
NODE_ENV=development
PORT=3001

# Use either DATABASE_URL or the separate DB_ vars below
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/management_app

# Or individual vars (edit to match your setup):
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=management_app
# DB_USER=postgres
# DB_PASSWORD=your_password

JWT_SECRET=any-random-string-for-local-dev

# Not used for local hosting, but app expects them
CLIENT_APP_URL=http://localhost:5173
ADMIN_APP_URL=http://localhost:5173
```

Replace `YOUR_PASSWORD` / `DB_PASSWORD` with your Postgres password.

**Run the schema:**

```powershell
# From project root
psql -U postgres -d management_app -f backend\src\db\schema.sql

# Or from inside backend folder:
psql -U postgres -d management_app -f src\db\schema.sql
```

**Optional – seed test data:**

```powershell
cd backend
npm run seed
```

Test logins (password `password123`):  
`admin1@test.local`, `client1@test.local`, etc. See `backend\README.md` for full list.

**Start the API:**

```powershell
cd backend
npm run dev
```

Leave this running. Check http://localhost:3001/health — you should see `{"status":"ok",...}`.

---

## 4. Frontend Setup (Unified App)

**Unified app:**

```powershell
cd app-unified
npm install
```

Create `app-unified\.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

**Run the frontend:**

```powershell
# Terminal 2 – Unified App
cd app-unified
npm run dev
```

- Unified App: http://localhost:5173  

---

## 5. One-Command Start (PowerShell)

From the **project root** (`management-app`):

```powershell
.\start-local.ps1
```

This starts:

1. Backend (port 3001)  
2. Unified app (port 5173)  

Each runs in its own window. Close the windows or press `Ctrl+C` in each to stop.

**Prerequisites:** PostgreSQL running, schema applied, `backend\.env` and `app-unified\.env.local` configured as above.

---

## 6. Quick Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `management_app` created
- [ ] Schema run (`backend\src\db\schema.sql`)
- [ ] `backend\.env` with `DATABASE_URL` (or `DB_*`) and `JWT_SECRET`
- [ ] `app-unified\.env.local` with `VITE_API_URL=http://localhost:3001`
- [ ] `npm install` in `backend`, `app-unified`
- [ ] (Optional) `npm run seed` in `backend`

---

## 7. When to Use Cloud (Railway / Render)

- You need a **shareable URL** (e.g. demo, client, team).
- You want **always-on** access without your PC running.
- You’ve **outgrown** local setup (e.g. multiple devs, CI/CD).

**Railway free tier:** About **$1/month** free credit. Usage beyond that is billed (e.g. RAM, CPU, egress). Set a **spending limit** in the Railway dashboard to avoid surprises.

**Recommendation:** Stay on **local hosting** for day‑to‑day dev and testing. Use cloud only when you need a live, shareable deployment.

---

## 8. Troubleshooting

| Issue | What to check |
|-------|----------------|
| Backend won’t start | `DATABASE_URL` / `DB_*` correct? Schema applied? PostgreSQL running? |
| "Connection refused" to DB | PostgreSQL listening on 5432? Firewall? |
| Frontend can’t reach API | `VITE_API_URL=http://localhost:3001` in unified app? Backend running? |
| CORS errors | Backend `CLIENT_APP_URL` / `ADMIN_APP_URL` should be `http://localhost:5173` for local dev. |

---

## 9. Related Docs

- `backend\README.md` – API, seeding, tests  
- `DEPLOYMENT_QUICKSTART.md` – Cloud deploy when you’re ready  
- `README.md` – Project overview
