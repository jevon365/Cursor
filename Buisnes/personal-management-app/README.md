# Personal Management App

Personal time and task management: Jira-style Kanban board and calendar view, with tasks stored in Google Calendar so you can view and update from any device.

- **Static site**: Runs on GitHub Pages (no backend).
- **Google Calendar**: One dedicated "Task Manager" calendar holds all tasks as events; status, progress, and labels are stored in event extended properties.
- **Board**: Drag-and-drop columns (To do, In progress, Done), create/edit/delete tasks, refresh to sync.
- **Calendar**: Week view of tasks by due date.

## Quick start

```bash
cd personal-management-app
npm install
```

Create a `.env` in the project root with `VITE_GOOGLE_CLIENT_ID=your_google_client_id`, then:

```bash
npm run dev
```

**OAuth and deployment:** Full Google Cloud setup, redirect URIs, test users, and GitHub Pages deploy steps are in **`secrets.md`** (local only; that file is in `.gitignore`). Copy `secrets.md` from the template below if needed, or keep your own copy with your client ID and notes—never commit real credentials.

## Features

- **Kanban**: To do, In progress, Done columns; drag-and-drop to change status.
- **Tasks**: Title, description, status, progress %, due date, labels; create, edit, delete.
- **Calendar view**: Week view of tasks by due date; previous/next week, Today, Refresh.
- **Sync**: Data lives in Google Calendar; open the app on any device and refresh to see updates.

## Tech

- React 18, Vite, Tailwind CSS
- `@react-oauth/google` for Google sign-in (no client secret in the app)
- `@dnd-kit` for drag-and-drop
- Google Calendar API v3 (REST) for event CRUD; task metadata in extended properties
