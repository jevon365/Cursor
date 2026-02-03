import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/database.js';

// Run only when explicitly requested (e.g. RUN_INTEGRATION_TESTS=1 npm test)
// and DB env vars are set. Requires a working PostgreSQL instance.
const runIntegration = process.env.RUN_INTEGRATION_TESTS === '1' && !!(
  process.env.DATABASE_URL ||
  (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
);

describe.skipIf(!runIntegration)('Auth API (integration)', () => {
  const testUser = {
    email: `integration-${Date.now()}@test.local`,
    password: 'IntegrationTest123!',
    name: 'Integration Test User',
    role: 'client',
  };
  let token = null;

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    } catch (_) {}
  });

  it('POST /api/auth/register creates user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong' })
      .expect(401);
  });

  it('GET /api/auth/me returns user when valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.name).toBe(testUser.name);
  });

  it('PUT /api/auth/password updates password with valid current password', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: testUser.password, newPassword: 'NewPass123!' })
      .expect(200);
    expect(res.body.message).toContain('updated');
    // restore for delete test
    await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'NewPass123!', newPassword: testUser.password })
      .expect(200);
  });

  it('POST /api/auth/account/delete deletes account with valid password', async () => {
    const res = await request(app)
      .post('/api/auth/account/delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: testUser.password })
      .expect(200);
    expect(res.body.message).toContain('deleted');
    // User should be gone (me returns 404 when user not in DB)
    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(404);
  });
});
