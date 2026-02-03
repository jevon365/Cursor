import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'secret123', name: 'Test User' })
        .expect(400);
      expect(res.body.error).toBe('Email, password, and name are required');
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', name: 'Test User' })
        .expect(400);
      expect(res.body.error).toBe('Email, password, and name are required');
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'secret123' })
        .expect(400);
      expect(res.body.error).toBe('Email, password, and name are required');
    });

    it('returns 400 when body is empty', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);
      expect(res.body.error).toBe('Email, password, and name are required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'secret123' })
        .expect(400);
      expect(res.body.error).toBe('Email and password are required');
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
      expect(res.body.error).toBe('Email and password are required');
    });

    it('returns 400 when body is empty', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      expect(res.body.error).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when no Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);
      expect(res.body.error).toBe('Access token required');
    });

    it('returns 401 when Authorization header is empty', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', '')
        .expect(401);
      expect(res.body.error).toBe('Access token required');
    });

    it('returns 403 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      expect(res.body.error).toBe('Invalid or expired token');
    });
  });

  describe('POST /api/auth/account/delete', () => {
    it('returns 401 when no Authorization header', async () => {
      const res = await request(app)
        .post('/api/auth/account/delete')
        .send({ password: 'secret123' })
        .expect(401);
      expect(res.body.error).toBe('Access token required');
    });

    it('returns 403 when token is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/account/delete')
        .set('Authorization', 'Bearer invalid-token')
        .send({ password: 'secret123' })
        .expect(403);
      expect(res.body.error).toBe('Invalid or expired token');
    });
  });
});
