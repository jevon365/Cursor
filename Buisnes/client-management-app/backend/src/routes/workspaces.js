import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, hasRole } from '../middleware/auth.js';

const router = express.Router();

// Get all workspaces (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      // Admin can see all workspaces
      query = `
        SELECT w.*, 
               u.name as client_name,
               u.email as client_email
        FROM workspaces w
        LEFT JOIN users u ON w.client_id = u.id
        ORDER BY w.created_at DESC
      `;
      params = [];
    } else {
      // Clients can only see their own workspaces
      query = `
        SELECT w.*, 
               u.name as client_name,
               u.email as client_email
        FROM workspaces w
        LEFT JOIN users u ON w.client_id = u.id
        WHERE w.client_id = $1
        ORDER BY w.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single workspace
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      query = `
        SELECT w.*, 
               u.name as client_name,
               u.email as client_email
        FROM workspaces w
        LEFT JOIN users u ON w.client_id = u.id
        WHERE w.id = $1
      `;
      params = [id];
    } else {
      query = `
        SELECT w.*, 
               u.name as client_name,
               u.email as client_email
        FROM workspaces w
        LEFT JOIN users u ON w.client_id = u.id
        WHERE w.id = $1 AND w.client_id = $2
      `;
      params = [id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workspace (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, client_id, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!client_id) {
      return res.status(400).json({ error: 'client_id is required' });
    }

    // Verify client exists
    const clientCheck = await pool.query('SELECT id FROM users WHERE id = $1', [client_id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const result = await pool.query(
      `INSERT INTO workspaces (name, client_id, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, client_id, description || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workspace (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client_id, description } = req.body;

    // Check if workspace exists
    const checkResult = await pool.query('SELECT id FROM workspaces WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // If client_id is being updated, verify client exists
    if (client_id) {
      const clientCheck = await pool.query('SELECT id FROM users WHERE id = $1', [client_id]);
      if (clientCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (client_id !== undefined) {
      updateFields.push(`client_id = $${paramCount++}`);
      updateValues.push(client_id);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE workspaces
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workspace (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM workspaces WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects in workspace
router.get('/:id/projects', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if workspace exists and user has access
    let workspaceQuery;
    let workspaceParams;

    if (hasRole(req.user, 'admin')) {
      workspaceQuery = 'SELECT id FROM workspaces WHERE id = $1';
      workspaceParams = [id];
    } else {
      workspaceQuery = 'SELECT id FROM workspaces WHERE id = $1 AND client_id = $2';
      workspaceParams = [id, req.user.id];
    }

    const workspaceCheck = await pool.query(workspaceQuery, workspaceParams);

    if (workspaceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Get projects in workspace
    let projectsQuery;
    let projectsParams;

    if (hasRole(req.user, 'admin')) {
      projectsQuery = 'SELECT * FROM projects WHERE workspace_id = $1 ORDER BY created_at DESC';
      projectsParams = [id];
    } else {
      projectsQuery = 'SELECT * FROM projects WHERE workspace_id = $1 AND client_id = $2 ORDER BY created_at DESC';
      projectsParams = [id, req.user.id];
    }

    const result = await pool.query(projectsQuery, projectsParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workspace projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
