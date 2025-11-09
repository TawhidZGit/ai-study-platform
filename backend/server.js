const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS middleware - configure properly for development
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware MUST come before routes
app.use(express.json());

// Logging middleware (helps debug)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Import database connection
require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const quizRoutes = require('./routes/quizzes');
const flashcardRoutes = require('./routes/flashcards');

// Test route - MUST come before other routes
app.get('/', (req, res) => {
  res.json({ message: 'AI Study Platform API is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
});