import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, hasRole } from '../middleware/auth.js';

const router = express.Router();

// Get comments (filtered by request/project/task)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { request_id, project_id, task_id } = req.query;

    if (!request_id && !project_id && !task_id) {
      return res.status(400).json({ error: 'At least one filter (request_id, project_id, or task_id) is required' });
    }

    let query;
    let params = [];
    let paramCount = 1;

    // Base query
    query = `
      SELECT c.*, 
             u.name as author_name,
             u.email as author_email
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE 1=1
    `;

    // Add filters
    if (request_id) {
      query += ` AND c.request_id = $${paramCount++}`;
      params.push(request_id);
    }

    if (project_id) {
      query += ` AND c.project_id = $${paramCount++}`;
      params.push(project_id);
    }

    if (task_id) {
      query += ` AND c.task_id = $${paramCount++}`;
      params.push(task_id);
    }

    // Role-based access control
    if (hasRole(req.user, 'client')) {
      // Clients can only see comments on their own requests/projects
      query += ` AND (
        (c.request_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM requests r WHERE r.id = c.request_id AND r.client_id = $${paramCount}
        ))
        OR (c.project_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM projects p WHERE p.id = c.project_id AND p.client_id = $${paramCount}
        ))
        OR (c.task_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM tasks t 
          JOIN projects p ON t.project_id = p.id 
          WHERE t.id = c.task_id AND p.client_id = $${paramCount}
        ))
      )`;
      params.push(req.user.id);
    }
    // Admins can see all comments (no additional filter needed)

    query += ` ORDER BY c.created_at ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { request_id, project_id, task_id, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // At least one of request_id, project_id, or task_id must be provided
    if (!request_id && !project_id && !task_id) {
      return res.status(400).json({ error: 'At least one of request_id, project_id, or task_id is required' });
    }

    // Verify access to the resource being commented on
    if (hasRole(req.user, 'client')) {
      if (request_id) {
        const requestCheck = await pool.query(
          'SELECT id FROM requests WHERE id = $1 AND client_id = $2',
          [request_id, req.user.id]
        );
        if (requestCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Access denied to this request' });
        }
      }
      if (project_id) {
        const projectCheck = await pool.query(
          'SELECT id FROM projects WHERE id = $1 AND client_id = $2',
          [project_id, req.user.id]
        );
        if (projectCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Access denied to this project' });
        }
      }
      if (task_id) {
        const taskCheck = await pool.query(
          `SELECT t.id FROM tasks t
           JOIN projects p ON t.project_id = p.id
           WHERE t.id = $1 AND p.client_id = $2`,
          [task_id, req.user.id]
        );
        if (taskCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Access denied to this task' });
        }
      }
    }
    // Admins have access to all resources

    const result = await pool.query(
      `INSERT INTO comments (request_id, project_id, task_id, author_id, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        request_id || null,
        project_id || null,
        task_id || null,
        req.user.id,
        content.trim()
      ]
    );

    // Get the comment with author info
    const commentResult = await pool.query(
      `SELECT c.*, 
              u.name as author_name,
              u.email as author_email
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(commentResult.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update own comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if comment exists and user owns it (or is admin)
    let checkQuery;
    let checkParams;

    if (hasRole(req.user, 'admin')) {
      checkQuery = 'SELECT id, author_id FROM comments WHERE id = $1';
      checkParams = [id];
    } else {
      checkQuery = 'SELECT id, author_id FROM comments WHERE id = $1 AND author_id = $2';
      checkParams = [id, req.user.id];
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    const result = await pool.query(
      `UPDATE comments 
       SET content = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [content.trim(), id]
    );

    // Get the comment with author info
    const commentResult = await pool.query(
      `SELECT c.*, 
              u.name as author_name,
              u.email as author_email
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    res.json(commentResult.rows[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete own comment (or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if comment exists and user owns it (or is admin)
    let checkQuery;
    let checkParams;

    if (req.user.role === 'admin') {
      checkQuery = 'SELECT id FROM comments WHERE id = $1';
      checkParams = [id];
    } else {
      checkQuery = 'SELECT id FROM comments WHERE id = $1 AND author_id = $2';
      checkParams = [id, req.user.id];
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
