import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, hasRole } from '../middleware/auth.js';

const router = express.Router();

// Get all requests (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      // Admin can see all requests
      query = `
        SELECT r.*, p.title as project_title
        FROM requests r
        LEFT JOIN projects p ON r.project_id = p.id
        ORDER BY r.created_at DESC
      `;
      params = [];
    } else {
      // Clients can only see their own requests
      query = `
        SELECT r.*, p.title as project_title
        FROM requests r
        LEFT JOIN projects p ON r.project_id = p.id
        WHERE r.client_id = $1
        ORDER BY r.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      query = `
        SELECT r.*, p.title as project_title
        FROM requests r
        LEFT JOIN projects p ON r.project_id = p.id
        WHERE r.id = $1
      `;
      params = [id];
    } else {
      query = `
        SELECT r.*, p.title as project_title
        FROM requests r
        LEFT JOIN projects p ON r.project_id = p.id
        WHERE r.id = $1 AND r.client_id = $2
      `;
      params = [id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create request (clients and admins can create)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, title, description, priority, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Use client_id from token if user has client role, otherwise use req.body.client_id
    const client_id = hasRole(req.user, 'client') ? req.user.id : (req.body.client_id || req.user.id);

    const result = await pool.query(
      `INSERT INTO requests (project_id, client_id, title, description, status, priority, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        project_id || null,
        client_id,
        title,
        description,
        'new',
        priority || 'medium',
        category || 'other'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, project_id } = req.body;

    // Check if request exists
    const checkResult = await pool.query('SELECT id FROM requests WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
      if (status === 'completed') {
        updateFields.push(`completed_at = NOW()`);
      }
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      updateValues.push(priority);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount++}`);
      updateValues.push(category);
    }
    if (project_id !== undefined) {
      updateFields.push(`project_id = $${paramCount++}`);
      updateValues.push(project_id);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE requests
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update request status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['new', 'in-progress', 'completed', 'rejected', 'on-hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
