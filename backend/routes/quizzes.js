const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const quizService = require('../services/quizService');
const streakService = require('../services/streakService');

const router = express.Router();

router.use(authenticateToken);

// Generate quiz from document
router.post('/generate/:documentId', async (req, res) => {
  try {
    const { numQuestions = 10 } = req.body;
    
    // Get document content
    const docResult = await pool.query(
      'SELECT content, filename FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.documentId, req.user.id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate quiz
    const quiz = await quizService.generateQuiz(docResult.rows[0].content, numQuestions);

    // Save quiz to database
    const quizResult = await pool.query(
      'INSERT INTO quizzes (document_id, questions) VALUES ($1, $2) RETURNING *',
      [req.params.documentId, JSON.stringify(quiz.questions)]
    );

    res.json({
      message: 'Quiz generated successfully',
      quiz: {
        id: quizResult.rows[0].id,
        documentId: req.params.documentId,
        filename: docResult.rows[0].filename,
        questions: quiz.questions,
        createdAt: quizResult.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, d.filename, d.user_id 
       FROM quizzes q 
       JOIN documents d ON q.document_id = d.id 
       WHERE q.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = result.rows[0];

    // Check ownership
    if (quiz.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      quiz: {
        id: quiz.id,
        documentId: quiz.document_id,
        filename: quiz.filename,
        questions: quiz.questions,
        createdAt: quiz.created_at
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit quiz answers and get score
router.post('/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected answer indices

    // Get quiz
    const quizResult = await pool.query(
      `SELECT q.*, d.user_id 
       FROM quizzes q 
       JOIN documents d ON q.document_id = d.id 
       WHERE q.id = $1`,
      [req.params.id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];

    if (quiz.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const questions = quiz.questions;
    let score = 0;
    const results = [];

    // Calculate score
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) score++;

      results.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });

    // Save study session
    await pool.query(
      'INSERT INTO study_sessions (user_id, quiz_id, score, total_questions) VALUES ($1, $2, $3, $4)',
      [req.user.id, req.params.id, score, questions.length]
    );

    // Update streak and check achievements
    await streakService.updateStreak(req.user.id);
    await streakService.checkMilestoneAchievements(req.user.id);

    res.json({
      score: score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results: results
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user's quiz history
router.get('/history/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ss.*, q.id as quiz_id, d.filename 
       FROM study_sessions ss
       JOIN quizzes q ON ss.quiz_id = q.id
       JOIN documents d ON q.document_id = d.id
       WHERE ss.user_id = $1
       ORDER BY ss.completed_at DESC`,
      [req.user.id]
    );

    res.json({ sessions: result.rows });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

module.exports = router;