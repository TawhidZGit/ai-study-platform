require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const rateLimit = require('express-rate-limit'); 

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://ai-study-platform-eta.vercel.app', // Vercel URL here
    'http://localhost:5173',                  // local Vite frontend
    'http://localhost:5000'                   // (Optional) Allows local testing tools
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window (15 mins)
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 3. ADD THIS: Apply the bouncer to all routes that start with /api
app.use('/api', apiLimiter);

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
});