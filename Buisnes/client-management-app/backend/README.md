# Backend API

Node.js/Express backend API for Management App.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up PostgreSQL database:
   - Create a database named `management_app`
   - Or use a cloud database (Supabase, Railway, etc.)

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## Seeding test data

To populate the database with minimal test data (users, workspaces, projects, requests, tasks, comments):

```bash
npm run seed
```

Test logins (password: `password123`):
- **Admins:** `admin1@test.local`, `admin2@test.local`
- **Clients:** `client1@test.local`, `client2@test.local`

Use `npm run seed -- --clear` to truncate existing data before seeding (e.g. on a fresh DB or to reset test data).

## Testing

```bash
npm test
```

Runs unit tests (Vitest + Supertest) for health check and auth API validation. No database required.

To run integration tests (require PostgreSQL with schema applied and env configured):

```bash
RUN_INTEGRATION_TESTS=1 npm test
```

## API Endpoints

See `docs/API.md` for complete API documentation.

## Database Schema

See `docs/DATABASE.md` for database schema and migrations.
