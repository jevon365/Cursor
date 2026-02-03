import dotenv from 'dotenv';

// Load .env for tests (JWT_SECRET, etc.)
dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-unit-tests';
