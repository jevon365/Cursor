import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, roles } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Normalize roles: ensure it's an array and has at least 'client'
    let userRoles = Array.isArray(roles) ? roles : (roles ? [roles] : ['client']);
    // Ensure 'client' is always included
    if (!userRoles.includes('client')) {
      userRoles.push('client');
    }
    // Remove duplicates
    userRoles = [...new Set(userRoles)];

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, roles, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, roles',
      [email, hashedPassword, name, userRoles, userRoles[0]] // Keep role for backward compatibility
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, name, roles FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Query database for full user record to get latest data
    const result = await pool.query(
      'SELECT id, email, name, roles, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password hash
    const result = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account (using POST instead of DELETE to ensure body is parsed)
router.post('/account/delete', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    console.log('Delete account request received for user:', req.user.id);

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Get user with password hash
    const result = await pool.query(
      'SELECT id, password_hash, roles FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      console.error('Invalid password for user:', req.user.id);
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user (cascade will handle related records if foreign keys are set up)
    const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.id]);
    
    if (deleteResult.rows.length === 0) {
      console.error('Failed to delete user:', req.user.id);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    console.log('Account deleted successfully for user:', req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
