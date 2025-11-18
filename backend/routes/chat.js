const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Verify project ownership middleware
const verifyProjectOwnership = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.projectId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    req.project = result.rows[0];
    next();
  } catch (error) {
    console.error('Project verification error:', error);
    res.status(500).json({ error: 'Failed to verify project ownership' });
  }
};

// Get chat history for a project
router.get('/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20; // Last 20 messages by default
    
    const result = await pool.query(
      `SELECT id, role, content, sources_used, created_at 
       FROM chat_messages 
       WHERE project_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [req.params.projectId, limit]
    );

    // Reverse to get chronological order
    const messages = result.rows.reverse();

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send a message and get AI response
router.post('/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    const { message, mode = 'study' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    const userMessage = await pool.query(
      'INSERT INTO chat_messages (project_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.projectId, 'user', message.trim()]
    );

    // Get all sources for context
    const sourcesResult = await pool.query(
      'SELECT id, filename, content FROM sources WHERE project_id = $1',
      [req.params.projectId]
    );

    // Get recent chat history for context (last 10 messages)
    const historyResult = await pool.query(
      `SELECT role, content FROM chat_messages 
       WHERE project_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.params.projectId]
    );

    const recentHistory = historyResult.rows.reverse();

    // Generate AI response using chatService
    const chatService = require('../services/chatService');
    const aiResponse = await chatService.generateResponse({
      userMessage: message.trim(),
      sources: sourcesResult.rows,
      chatHistory: recentHistory,
      mode: mode
    });

    // Save AI response
    const assistantMessage = await pool.query(
      'INSERT INTO chat_messages (project_id, role, content, sources_used) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.projectId, 'assistant', aiResponse.content, JSON.stringify(aiResponse.sourcesUsed || [])]
    );

    res.json({
      userMessage: userMessage.rows[0],
      assistantMessage: assistantMessage.rows[0]
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Clear chat history
router.delete('/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM chat_messages WHERE project_id = $1',
      [req.params.projectId]
    );

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router;