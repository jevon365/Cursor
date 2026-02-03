import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, hasRole } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks (filtered by role and query params)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, request_id, assignee_id, status } = req.query;
    
    let query;
    let params = [];
    let paramCount = 1;

    // Base query with role-based filtering
    if (hasRole(req.user, 'admin')) {
      // Admin can see all tasks
      query = `
        SELECT t.*, 
               u.name as assignee_name,
               p.title as project_title,
               r.title as request_title
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN requests r ON t.request_id = r.id
        WHERE 1=1
      `;
    } else {
      // Clients can only see tasks for their projects
      query = `
        SELECT t.*, 
               u.name as assignee_name,
               p.title as project_title,
               r.title as request_title
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN requests r ON t.request_id = r.id
        WHERE p.client_id = $${paramCount++}
      `;
      params.push(req.user.id);
    }

    // Add filters
    if (project_id) {
      query += ` AND t.project_id = $${paramCount++}`;
      params.push(project_id);
    }

    if (request_id) {
      query += ` AND t.request_id = $${paramCount++}`;
      params.push(request_id);
    }

    if (assignee_id) {
      query += ` AND t.assignee_id = $${paramCount++}`;
      params.push(assignee_id);
    }

    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let query;
    let params;

    if (hasRole(req.user, 'admin')) {
      query = `
        SELECT t.*, 
               u.name as assignee_name,
               p.title as project_title,
               r.title as request_title
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN requests r ON t.request_id = r.id
        WHERE t.id = $1
      `;
      params = [id];
    } else {
      query = `
        SELECT t.*, 
               u.name as assignee_name,
               p.title as project_title,
               r.title as request_title
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN requests r ON t.request_id = r.id
        WHERE t.id = $1 AND p.client_id = $2
      `;
      params = [id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { project_id, request_id, title, description, status, priority, assignee_id, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, request_id, title, description, status, priority, assignee_id, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        project_id || null,
        request_id || null,
        title,
        description || '',
        status || 'todo',
        priority || 'medium',
        assignee_id || null,
        due_date || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee_id, due_date, project_id, request_id } = req.body;

    // Check if task exists
    const checkResult = await pool.query('SELECT id FROM tasks WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
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
      // Set completed_at if status is 'done'
      if (status === 'done') {
        updateFields.push(`completed_at = NOW()`);
      } else {
        updateFields.push(`completed_at = NULL`);
      }
    }
    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      updateValues.push(priority);
    }
    if (assignee_id !== undefined) {
      updateFields.push(`assignee_id = $${paramCount++}`);
      updateValues.push(assignee_id);
    }
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      updateValues.push(due_date);
    }
    if (project_id !== undefined) {
      updateFields.push(`project_id = $${paramCount++}`);
      updateValues.push(project_id);
    }
    if (request_id !== undefined) {
      updateFields.push(`request_id = $${paramCount++}`);
      updateValues.push(request_id);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user has access to this task
    let checkQuery;
    let checkParams;

    if (hasRole(req.user, 'admin')) {
      checkQuery = 'SELECT id FROM tasks WHERE id = $1';
      checkParams = [id];
    } else {
      // Clients can only update tasks for their projects
      checkQuery = `
        SELECT t.id FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.id = $1 AND p.client_id = $2
      `;
      checkParams = [id, req.user.id];
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Update status
    const updateFields = [`status = $1`, `updated_at = NOW()`];
    const updateValues = [status];

    if (status === 'done') {
      updateFields.push(`completed_at = NOW()`);
    } else {
      updateFields.push(`completed_at = NULL`);
    }

    updateValues.push(id);

    const result = await pool.query(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $2 RETURNING *`,
      updateValues
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign task to user
router.patch('/:id/assignee', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee_id } = req.body;

    // Check if task exists
    const checkResult = await pool.query('SELECT id FROM tasks WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // If assignee_id is provided, verify user exists
    if (assignee_id) {
      const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [assignee_id]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET assignee_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [assignee_id || null, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
