# Management App

A unified application system for managing client requests and project tracking. Users can have both client and admin roles, accessing all features through a single interface.

## Project Structure

```
management-app/
├── backend/          # Node.js/Express API server
├── app-unified/     # Unified React app (client + admin, role-based)
└── docs/            # Documentation
```

## Application

### Unified App (app-unified)
A single React application with role-based access control:

**Client Features:**
- Login to their account
- Submit project change requests
- View progress on their requests
- View and respond to comments
- Track project status

**Admin Features:**
- Managing all projects
- Assigning clients to projects (via Project Detail "Assign client" or Create/Edit Project)
- Viewing all client requests (admins do not create requests; they triage and create tasks from requests)
- Task management with Kanban boards (default view on Tasks page) and list view
- Commenting on requests and tasks
- Workspace management
- User management

**Dual Role Support:**
- Users can have both `client` and `admin` roles
- Same email/password works for both roles
- Navigation and features adapt based on user roles
- Role badges displayed in navigation

## Technology Stack

- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **Frontend**: React 18+ with Vite
- **Authentication**: JWT tokens
- **Hosting**: TBD (Supabase, Railway, Render, or Vercel)

## Getting Started

### Host locally first (recommended)

Run the full stack on your machine—**no cloud costs**. Use Railway/Render only when you need a shareable URL or always-on hosting.

- **Full guide:** [`LOCAL_HOSTING.md`](LOCAL_HOSTING.md) — PostgreSQL setup, env vars, troubleshooting
- **One-command start:** From project root, run `.\start-local.ps1` to start backend + unified app in separate windows

### Prerequisites
- Node.js 18+ installed
- PostgreSQL (local: see `LOCAL_HOSTING.md`; or cloud when deploying)
- npm or yarn

### Setup Instructions

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with database connection
   npm run dev
   ```

2. **Unified App Setup**:
   ```bash
   cd app-unified
   npm install
   cp .env.example .env.local
   # Configure .env.local with API URL (default: http://localhost:3001)
   npm run dev
   ```

## Development

### Getting Started
1. **Setup is complete!** See `SETUP_STATUS.md` for what's been configured.
2. **New to the project?** Read `docs/WHAT_IS_SETUP.md` for an ELI5 explanation.
3. **Ready to build?** Check `docs/TODO.md` for the development roadmap.

### Documentation
- `LOCAL_HOSTING.md` - **Run everything locally** (no cloud cost)
- `SETUP_STATUS.md` - Current setup status and completed phases (Phases 1-5 complete)
- `docs/WHAT_IS_SETUP.md` - Simple explanation of what's been built
- `docs/TODO.md` - Comprehensive development roadmap and task list (updated with progress)
- `docs/PROGRESS_EXPORT_2026-01-23.md` - Detailed progress documentation for Phases 1-5
- `docs/EXPORT_TO_CHATTIN_2026-01-23.md` - Export file ready for chatttin/conversations/
- `docs/EXPORT_TO_CHATTIN.md` - Guide for exporting progress and conversations to chatttin
- `docs/README.md` - Documentation index

### Development Servers

**Option 1 – One script (PowerShell):**  
`.\start-local.ps1` starts backend and unified app in separate windows.

**Option 2 – Manual (2 terminals):**
```bash
# Terminal 1 - Backend (Port 3001)
cd backend && npm run dev

# Terminal 2 - Unified App (Port 5173)
cd app-unified && npm run dev
```

### Testing
- **Backend:** `cd backend && npm test` (Vitest + Supertest; no DB required for unit tests)
- **Unified app:** `cd app-unified && npm test` (Vitest + React Testing Library + vitest-axe)
- **Integration tests:** `RUN_INTEGRATION_TESTS=1 npm test` in `backend/` when DB is configured

## Deployment

**Prefer local hosting** while developing and testing—see [`LOCAL_HOSTING.md`](LOCAL_HOSTING.md). Use cloud only when you need a **shareable URL** or **always-on** hosting.

Cloud options (can incur cost past free tiers):

- **Quick Start**: [`DEPLOYMENT_QUICKSTART.md`](DEPLOYMENT_QUICKSTART.md) — ~15 min (Railway or Render)
- **Ultra-Quick**: [`QUICK_DEPLOY.md`](QUICK_DEPLOY.md) — shortest path
- **Full Guide**: [`DEPLOYMENT.md`](DEPLOYMENT.md) — detailed instructions

**Railway** free tier ≈ $1/month credit; usage beyond that is billed. Set a **spending limit** in the dashboard to avoid surprises. **Render** offers a free tier too—see their pricing.

**Verify readiness**: Run `.\verify-deployment.ps1` to check your setup.
