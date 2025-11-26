require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { cleanupOrphanedFiles } = require('./utils/fileCleanup');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/sources', require('./routes/sources'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/generation', require('./routes/generation'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Run cleanup on startup (optional - removes orphaned files)
  try {
    console.log('Running orphaned file cleanup...');
    await cleanupOrphanedFiles(pool);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
});