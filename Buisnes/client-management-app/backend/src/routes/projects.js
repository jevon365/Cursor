import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, hasRole } from '../middleware/auth.js';

const router = express.Router();

// Get all projects (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      // Admin can see all projects with client info
      query = `
        SELECT p.*, 
               u.name as client_name,
               u.email as client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      // Clients can only see their own projects
      query = `
        SELECT p.*, 
               u.name as client_name,
               u.email as client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE p.client_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      query = `
        SELECT p.*, 
               u.name as client_name,
               u.email as client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE p.id = $1
      `;
      params = [id];
    } else {
      query = `
        SELECT p.*, 
               u.name as client_name,
               u.email as client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE p.id = $1 AND p.client_id = $2
      `;
      params = [id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, client_id, workspace_id, status, priority } = req.body;

    if (!title || !client_id) {
      return res.status(400).json({ error: 'Title and client_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO projects (title, description, client_id, workspace_id, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        description || '',
        client_id,
        workspace_id || null,
        status || 'active',
        priority || 'medium'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, client_id } = req.body;

    // Check if user has access to this project
    let checkQuery;
    let checkParams;

    if (req.user.role === 'admin') {
      checkQuery = 'SELECT id FROM projects WHERE id = $1';
      checkParams = [id];
    } else {
      checkQuery = 'SELECT id FROM projects WHERE id = $1 AND client_id = $2';
      checkParams = [id, req.user.id];
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Update project (only admin can update all fields)
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (hasRole(req.user, 'admin')) {
      if (status) {
        updateFields.push(`status = $${paramCount++}`);
        updateValues.push(status);
      }
      if (priority) {
        updateFields.push(`priority = $${paramCount++}`);
        updateValues.push(priority);
      }
      if (client_id) {
        updateFields.push(`client_id = $${paramCount++}`);
        updateValues.push(client_id);
      }
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE projects
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
