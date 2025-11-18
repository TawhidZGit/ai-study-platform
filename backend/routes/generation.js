const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const quizService = require('../services/quizService');
const flashcardService = require('../services/flashcardService');
const { generateSummary } = require('../services/aiService');

const router = express.Router();
router.use(authenticateToken);

// Verify project ownership
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

// Get all generated content for a project
router.get('/:projectId', verifyProjectOwnership, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM generated_content WHERE project_id = $1 ORDER BY created_at DESC',
      [req.params.projectId]
    );

    res.json({ content: result.rows });
  } catch (error) {
    console.error('Get generated content error:', error);
    res.status(500).json({ error: 'Failed to fetch generated content' });
  }
});

// Generate quiz from sources
router.post('/:projectId/quiz', verifyProjectOwnership, async (req, res) => {
  try {
    const { numQuestions = 10, title } = req.body;

    // Get all sources
    const sourcesResult = await pool.query(
      'SELECT content FROM sources WHERE project_id = $1',
      [req.params.projectId]
    );

    if (sourcesResult.rows.length === 0) {
      return res.status(400).json({ error: 'No sources available. Upload sources first.' });
    }

    // Combine all source content
    const combinedContent = sourcesResult.rows.map(s => s.content).join('\n\n');

    // Generate quiz
    const quiz = await quizService.generateQuiz(combinedContent, numQuestions);

    // Save to database
    const result = await pool.query(
      `INSERT INTO generated_content (project_id, content_type, title, data) 
       VALUES ($1, 'quiz', $2, $3) 
       RETURNING *`,
      [req.params.projectId, title || `Quiz - ${new Date().toLocaleDateString()}`, JSON.stringify(quiz)]
    );

    res.json({ content: result.rows[0] });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Generate flashcards from sources
router.post('/:projectId/flashcards', verifyProjectOwnership, async (req, res) => {
  try {
    const { numCards = 20, title } = req.body;

    // Get all sources
    const sourcesResult = await pool.query(
      'SELECT content FROM sources WHERE project_id = $1',
      [req.params.projectId]
    );

    if (sourcesResult.rows.length === 0) {
      return res.status(400).json({ error: 'No sources available. Upload sources first.' });
    }

    // Combine all source content
    const combinedContent = sourcesResult.rows.map(s => s.content).join('\n\n');

    // Generate flashcards
    const flashcards = await flashcardService.generateFlashcards(combinedContent, numCards);

    // Save to database
    const result = await pool.query(
      `INSERT INTO generated_content (project_id, content_type, title, data) 
       VALUES ($1, 'flashcards', $2, $3) 
       RETURNING *`,
      [req.params.projectId, title || `Flashcards - ${new Date().toLocaleDateString()}`, JSON.stringify(flashcards)]
    );

    res.json({ content: result.rows[0] });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Generate summary from sources
router.post('/:projectId/summary', verifyProjectOwnership, async (req, res) => {
  try {
    const { title } = req.body;

    // Get all sources
    const sourcesResult = await pool.query(
      'SELECT content FROM sources WHERE project_id = $1',
      [req.params.projectId]
    );

    if (sourcesResult.rows.length === 0) {
      return res.status(400).json({ error: 'No sources available. Upload sources first.' });
    }

    // Combine all source content
    const combinedContent = sourcesResult.rows.map(s => s.content).join('\n\n');

    // Generate summary
    const summary = await generateSummary(combinedContent);

    // Save to database
    const result = await pool.query(
      `INSERT INTO generated_content (project_id, content_type, title, data) 
       VALUES ($1, 'summary', $2, $3) 
       RETURNING *`,
      [req.params.projectId, title || `Summary - ${new Date().toLocaleDateString()}`, JSON.stringify(summary)]
    );

    res.json({ content: result.rows[0] });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Delete generated content
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM generated_content 
       WHERE id = $1 
       AND project_id IN (SELECT id FROM projects WHERE user_id = $2)
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete generated content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;