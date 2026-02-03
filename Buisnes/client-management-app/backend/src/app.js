import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.APP_URL,
  process.env.CLIENT_APP_URL,
  process.env.ADMIN_APP_URL,
  'http://localhost:5173', // Unified app (default)
  'http://localhost:5174'  // Legacy admin (for backward compatibility)
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Management App API is running' });
});

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import requestRoutes from './routes/requests.js';
import taskRoutes from './routes/tasks.js';
import commentRoutes from './routes/comments.js';
import workspaceRoutes from './routes/workspaces.js';
import userRoutes from './routes/users.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
