import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health check', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    expect(res.body).toEqual({ status: 'ok', message: 'Management App API is running' });
  });
});
