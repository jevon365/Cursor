import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

// Middleware to verify JWT token and check if user exists
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists in database
    try {
      const result = await pool.query(
        'SELECT id, email, roles FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'User account no longer exists' });
      }

      // Attach user data from database to request
      req.user = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        roles: result.rows[0].roles
      };
      next();
    } catch (error) {
      console.error('Authentication database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Helper function to check if user has a role
export const hasRole = (user, role) => {
  if (!user) return false;
  // Support both old (role) and new (roles array) format
  const roles = user.roles || (user.role ? [user.role] : []);
  return Array.isArray(roles) && roles.includes(role);
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (hasRole(req.user, 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Middleware to check if user is client
export const requireClient = (req, res, next) => {
  if (hasRole(req.user, 'client')) {
    next();
  } else {
    res.status(403).json({ error: 'Client access required' });
  }
};
