# Admin Account Setup Guide

This guide explains how to create admin accounts after deployment, since the registration page only creates client accounts.

## ⚠️ Important: Database Schema Update Required

The backend code uses a `roles` array column, but the schema may only have a `role` column. You may need to add the `roles` column first:

```sql
-- Add roles column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['client']::text[];

-- Update existing rows to populate roles from role
UPDATE users 
SET roles = ARRAY[role]::text[]
WHERE roles IS NULL OR array_length(roles, 1) IS NULL;

-- Ensure role column matches first role in roles array for backward compatibility
UPDATE users 
SET role = roles[1]
WHERE role IS NULL OR role != roles[1];
```

## Option 1: Direct SQL Update (Quickest - One-Time Setup)

### Create a New Admin Account

Connect to your PostgreSQL database and run:

```sql
-- Create a new admin user
INSERT INTO users (email, password_hash, name, role, roles)
VALUES (
  'admin@yourdomain.com',
  '$2b$10$YourHashedPasswordHere',  -- See below for generating hash
  'Admin Name',
  'admin',
  ARRAY['admin', 'client']::text[]
);
```

### Generate Password Hash

You can generate a bcrypt hash using Node.js:

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 10).then(hash => console.log(hash));"
```

Or use an online bcrypt generator (less secure, use only for testing).

### Upgrade Existing User to Admin

```sql
-- Upgrade an existing user to admin
UPDATE users 
SET role = 'admin', 
    roles = ARRAY['admin', 'client']::text[]
WHERE email = 'existing-user@example.com';
```

---

## Option 2: Backend API Endpoint (Recommended for Ongoing Use)

Add an admin-only endpoint to create admin accounts.

### Step 1: Add Endpoint to `backend/src/routes/users.js`

```javascript
import bcrypt from 'bcrypt';

// Create admin user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, name } = req.body;

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

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, roles)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, roles`,
      [email, hashedPassword, name, 'admin', ['admin', 'client']]
    );

    res.status(201).json({
      message: 'Admin user created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
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

    const result = await pool.query(
      `UPDATE users 
       SET roles = $1, role = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, roles`,
      [userRoles, primaryRole, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User roles updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Step 2: Use the API

After deploying, you can create an admin account using curl or Postman:

```bash
# First, login as an existing admin (or use the seed script admin)
TOKEN="your-admin-jwt-token"

# Create new admin account
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "SecurePassword123",
    "name": "New Admin"
  }'
```

---

## Option 3: Update UserManagement Page (Best UX)

Add role editing capability to the UserManagement page so admins can promote users.

### Step 1: Add Update Roles Endpoint (if not already added)

See Option 2, Step 1 above.

### Step 2: Add Service Method

Add to `app-unified/src/services/userService.js`:

```javascript
async updateRoles(userId, roles) {
  const response = await api.put(`/users/${userId}/roles`, { roles });
  return response.data;
}
```

### Step 3: Add UI to UserManagement Page

Add role editing buttons/dropdowns to the UserManagement table.

---

## Option 4: Use Seed Script (For Development/Testing)

The seed script creates test admin accounts:

```bash
cd backend
npm run seed
```

This creates:
- `admin1@test.local` (password: `password123`)
- `admin2@test.local` (password: `password123`)

**Note:** Only use this in development/testing environments!

---

## Important Notes

1. **Database Schema**: The current schema uses both `role` (singular) and `roles` (array). The backend normalizes to use `roles` array, but ensures `role` is set for backward compatibility.

2. **First Admin**: You'll need to create the first admin account using Option 1 (SQL) or Option 4 (seed script) before you can use the API endpoints.

3. **Security**: Always use strong passwords for admin accounts. Consider implementing:
   - Password complexity requirements
   - Two-factor authentication
   - Admin invitation system with secure tokens

4. **Production**: For production, consider:
   - Using environment variables for initial admin credentials
   - Implementing an admin invitation system
   - Adding audit logging for role changes

---

## Quick Reference

**Create admin via SQL:**
```sql
UPDATE users SET role = 'admin', roles = ARRAY['admin', 'client']::text[] WHERE email = 'user@example.com';
```

**Test admin from seed:**
- Email: `admin1@test.local`
- Password: `password123`
