import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const SALT_ROUNDS = 10;
const TEST_PASSWORD = 'password123';

const SEED_EMAILS = ['admin1@test.local', 'admin2@test.local', 'client1@test.local', 'client2@test.local'];

const clearTables = async () => {
  await pool.query(`
    TRUNCATE comments, tasks, requests, projects, workspaces, users CASCADE
  `);
  console.log('Cleared existing data.');
};

const seedUsersExist = async () => {
  const r = await pool.query(
    'SELECT 1 FROM users WHERE email = ANY($1) LIMIT 1',
    [SEED_EMAILS]
  );
  return r.rows.length > 0;
};

const seed = async () => {
  const clearFirst = process.argv.includes('--clear');
  if (clearFirst) {
    await clearTables();
  } else {
    const exist = await seedUsersExist();
    if (exist) {
      console.error('Seed users already exist. Use --clear to reset and re-seed, or use a fresh database.');
      process.exit(1);
    }
  }

  const ids = { users: [], workspaces: [], projects: [], requests: [], tasks: [] };

  // 2 admins, 2 clients
  const users = [
    { email: 'admin1@test.local', name: 'Test Admin 1', role: 'admin', roles: ['admin', 'client'] },
    { email: 'admin2@test.local', name: 'Test Admin 2', role: 'admin', roles: ['admin', 'client'] },
    { email: 'client1@test.local', name: 'Test Client 1', role: 'client', roles: ['client'] },
    { email: 'client2@test.local', name: 'Test Client 2', role: 'client', roles: ['client'] }
  ];
  const hash = await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);
  for (const u of users) {
    // Check if roles column exists, if not, add it
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT[]');
    } catch (e) {
      // Column might already exist, ignore error
    }
    
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, roles)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [u.email, hash, u.name, u.role, u.roles]
    );
    ids.users.push({ id: r.rows[0].id, ...u });
  }
  console.log(`Created ${ids.users.length} users.`);

  const [admin1, admin2, client1, client2] = ids.users;

  // 2 workspaces (one per client)
  const wsData = [
    { name: 'Test Workspace 1', client_id: client1.id, description: 'Workspace for Client 1' },
    { name: 'Test Workspace 2', client_id: client2.id, description: 'Workspace for Client 2' }
  ];
  for (const w of wsData) {
    const r = await pool.query(
      `INSERT INTO workspaces (name, client_id, description) VALUES ($1, $2, $3) RETURNING id`,
      [w.name, w.client_id, w.description]
    );
    ids.workspaces.push({ id: r.rows[0].id, ...w });
  }
  console.log(`Created ${ids.workspaces.length} workspaces.`);

  const [ws1, ws2] = ids.workspaces;

  // 4 projects: mix of statuses
  const projectsData = [
    { title: 'Test Project 1', description: 'Active project for Client 1', client_id: client1.id, workspace_id: ws1.id, status: 'active', priority: 'high' },
    { title: 'Test Project 2', description: 'On-hold project for Client 1', client_id: client1.id, workspace_id: ws1.id, status: 'on-hold', priority: 'medium' },
    { title: 'Test Project 3', description: 'Completed project for Client 2', client_id: client2.id, workspace_id: ws2.id, status: 'completed', priority: 'low' },
    { title: 'Test Project 4', description: 'Active project for Client 2', client_id: client2.id, workspace_id: ws2.id, status: 'active', priority: 'urgent' }
  ];
  for (const p of projectsData) {
    const r = await pool.query(
      `INSERT INTO projects (title, description, client_id, workspace_id, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [p.title, p.description, p.client_id, p.workspace_id, p.status, p.priority]
    );
    ids.projects.push({ id: r.rows[0].id, ...p });
  }
  console.log(`Created ${ids.projects.length} projects.`);

  const [proj1, proj2, proj3, proj4] = ids.projects;

  // 6 requests
  const requestsData = [
    { project_id: proj1.id, client_id: client1.id, title: 'Sample feature request', description: 'Add login redirect.', status: 'new', priority: 'medium', category: 'feature' },
    { project_id: proj1.id, client_id: client1.id, title: 'Bug: button not working', description: 'Submit button does nothing.', status: 'in-progress', priority: 'high', category: 'bug' },
    { project_id: proj1.id, client_id: client1.id, title: 'Change layout', description: 'Move sidebar to the left.', status: 'completed', priority: 'low', category: 'change' },
    { project_id: proj2.id, client_id: client1.id, title: 'Other request', description: 'Miscellaneous change.', status: 'on-hold', priority: 'medium', category: 'other' },
    { project_id: proj3.id, client_id: client2.id, title: 'Client 2 feature', description: 'Export to CSV.', status: 'completed', priority: 'high', category: 'feature' },
    { project_id: proj4.id, client_id: client2.id, title: 'Urgent fix', description: 'Fix crash on save.', status: 'new', priority: 'urgent', category: 'bug' }
  ];
  for (const rq of requestsData) {
    const r = await pool.query(
      `INSERT INTO requests (project_id, client_id, title, description, status, priority, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [rq.project_id, rq.client_id, rq.title, rq.description, rq.status, rq.priority, rq.category]
    );
    ids.requests.push({ id: r.rows[0].id, ...rq });
  }
  console.log(`Created ${ids.requests.length} requests.`);

  const [req1, req2, req3, req4, req5, req6] = ids.requests;

  // 8 tasks
  const tasksData = [
    { project_id: proj1.id, request_id: req1.id, title: 'Implement login redirect', status: 'todo', priority: 'medium', assignee_id: admin1.id },
    { project_id: proj1.id, request_id: req2.id, title: 'Fix submit button', status: 'in-progress', priority: 'high', assignee_id: admin1.id },
    { project_id: proj1.id, request_id: req3.id, title: 'Move sidebar', status: 'done', priority: 'low', assignee_id: admin2.id },
    { project_id: proj1.id, request_id: null, title: 'General cleanup', status: 'review', priority: 'medium', assignee_id: admin2.id },
    { project_id: proj2.id, request_id: req4.id, title: 'Misc change', status: 'todo', priority: 'medium', assignee_id: null },
    { project_id: proj3.id, request_id: req5.id, title: 'CSV export', status: 'done', priority: 'high', assignee_id: admin1.id },
    { project_id: proj4.id, request_id: req6.id, title: 'Fix save crash', status: 'todo', priority: 'urgent', assignee_id: admin2.id },
    { project_id: proj4.id, request_id: null, title: 'Add tests', status: 'in-progress', priority: 'medium', assignee_id: admin1.id }
  ];
  for (const t of tasksData) {
    const r = await pool.query(
      `INSERT INTO tasks (project_id, request_id, title, description, status, priority, assignee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [t.project_id, t.request_id, t.title, t.description || null, t.status, t.priority, t.assignee_id || null]
    );
    ids.tasks.push({ id: r.rows[0].id, ...t });
  }
  console.log(`Created ${ids.tasks.length} tasks.`);

  const [task1, task2, task3, task4, task5, task6, task7, task8] = ids.tasks;

  // 8 comments: mix on requests, projects, tasks
  const commentsData = [
    { request_id: req1.id, project_id: null, task_id: null, author_id: admin1.id, content: 'We will look into this next sprint.' },
    { request_id: req2.id, project_id: null, task_id: null, author_id: client1.id, content: 'Thanks, it blocks our release.' },
    { request_id: null, project_id: proj1.id, task_id: null, author_id: admin2.id, content: 'Project kickoff complete.' },
    { request_id: null, project_id: proj1.id, task_id: null, author_id: client1.id, content: 'Looking forward to it!' },
    { request_id: null, project_id: null, task_id: task1.id, author_id: admin1.id, content: 'Starting on this today.' },
    { request_id: null, project_id: null, task_id: task2.id, author_id: admin2.id, content: 'Root cause found, fix in progress.' },
    { request_id: null, project_id: null, task_id: task7.id, author_id: admin2.id, content: 'Treating as P0.' },
    { request_id: req5.id, project_id: null, task_id: null, author_id: client2.id, content: 'Export works great, thanks!' }
  ];
  for (const c of commentsData) {
    await pool.query(
      `INSERT INTO comments (request_id, project_id, task_id, author_id, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [c.request_id || null, c.project_id || null, c.task_id || null, c.author_id, c.content]
    );
  }
  console.log(`Created ${commentsData.length} comments.`);

  console.log('\nSeed complete.');
  console.log('Test logins (password: ' + TEST_PASSWORD + '):');
  console.log('  Admins:  admin1@test.local, admin2@test.local');
  console.log('  Clients: client1@test.local, client2@test.local');
  console.log('\nUse --clear to truncate existing data before seeding.');
};

const main = async () => {
  try {
    await pool.query('SELECT 1');
  } catch (e) {
    console.error('Database connection failed:', e.message);
    process.exit(1);
  }
  try {
    await seed();
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();
