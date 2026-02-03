import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, roles, role, created_at FROM users ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user roles (admin only)
router.put('/:id/roles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'Roles must be a non-empty array' });
    }

    // Ensure 'client' is always included
    let userRoles = [...new Set([...roles, 'client'])];
    const primaryRole = userRoles.includes('admin') ? 'admin' : 'client';

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user roles
    const result = await pool.query(
      `UPDATE users 
       SET roles = $1, role = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, roles, role, created_at`,
      [userRoles, primaryRole, id]
    );

    res.json({
      message: 'User roles updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
