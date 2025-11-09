const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const flashcardService = require('../services/flashcardService');

const router = express.Router();
router.use(authenticateToken);

// Generate flashcards from document
router.post('/generate/:documentId', async (req, res) => {
  try {
    const { numCards = 20 } = req.body;
    
    const docResult = await pool.query(
      'SELECT content, filename FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.documentId, req.user.id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const flashcards = await flashcardService.generateFlashcards(
      docResult.rows[0].content, 
      numCards
    );

    // Save flashcard set to database
    const setResult = await pool.query(
      'INSERT INTO flashcard_sets (document_id, cards) VALUES ($1, $2) RETURNING *',
      [req.params.documentId, JSON.stringify(flashcards.cards)]
    );

    // Initialize review progress for each card
    const cardPromises = flashcards.cards.map((_, index) => 
      pool.query(
        `INSERT INTO flashcard_reviews (user_id, flashcard_set_id, card_index) 
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [req.user.id, setResult.rows[0].id, index]
      )
    );
    await Promise.all(cardPromises);

    res.json({
      message: 'Flashcards generated successfully',
      flashcardSet: {
        id: setResult.rows[0].id,
        documentId: req.params.documentId,
        filename: docResult.rows[0].filename,
        cards: flashcards.cards,
        createdAt: setResult.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Get flashcard set by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fs.*, d.filename, d.user_id 
       FROM flashcard_sets fs 
       JOIN documents d ON fs.document_id = d.id 
       WHERE fs.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    const set = result.rows[0];

    if (set.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      flashcardSet: {
        id: set.id,
        documentId: set.document_id,
        filename: set.filename,
        cards: set.cards,
        createdAt: set.created_at
      }
    });
  } catch (error) {
    console.error('Get flashcard set error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard set' });
  }
});

// Get cards due for review
router.get('/:id/due', async (req, res) => {
  try {
    // Get flashcard set
    const setResult = await pool.query(
      `SELECT fs.*, d.user_id 
       FROM flashcard_sets fs 
       JOIN documents d ON fs.document_id = d.id 
       WHERE fs.id = $1`,
      [req.params.id]
    );

    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (setResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get cards due for review
    const reviewResult = await pool.query(
      `SELECT * FROM flashcard_reviews 
       WHERE user_id = $1 
       AND flashcard_set_id = $2 
       AND next_review_date <= NOW()
       ORDER BY next_review_date ASC`,
      [req.user.id, req.params.id]
    );

    const cards = setResult.rows[0].cards;
    const dueCards = reviewResult.rows.map(review => ({
      ...cards[review.card_index],
      cardIndex: review.card_index,
      reviewId: review.id,
      timesReviewed: review.times_reviewed
    }));

    res.json({
      dueCards,
      totalDue: dueCards.length,
      totalCards: cards.length
    });
  } catch (error) {
    console.error('Get due cards error:', error);
    res.status(500).json({ error: 'Failed to fetch due cards' });
  }
});

// Submit card review (spaced repetition update)
router.post('/:id/review', async (req, res) => {
  try {
    const { cardIndex, difficulty } = req.body; // difficulty: 'again', 'hard', 'good', 'easy'

    // Get current review state
    const reviewResult = await pool.query(
      `SELECT * FROM flashcard_reviews 
       WHERE user_id = $1 AND flashcard_set_id = $2 AND card_index = $3`,
      [req.user.id, req.params.id, cardIndex]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review record not found' });
    }

    const review = reviewResult.rows[0];

    // Calculate new interval based on SM-2 algorithm (simplified)
    let newInterval = review.interval;
    let newEaseFactor = parseFloat(review.ease_factor);

    switch(difficulty) {
      case 'again':
        newInterval = 1;
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
        break;
      case 'hard':
        newInterval = Math.max(1, Math.round(review.interval * 1.2));
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
        break;
      case 'good':
        newInterval = Math.round(review.interval * newEaseFactor);
        break;
      case 'easy':
        newInterval = Math.round(review.interval * newEaseFactor * 1.3);
        newEaseFactor = newEaseFactor + 0.15;
        break;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update review record
    await pool.query(
      `UPDATE flashcard_reviews 
       SET ease_factor = $1, 
           interval = $2, 
           next_review_date = $3,
           last_reviewed = NOW(),
           times_reviewed = times_reviewed + 1
       WHERE id = $4`,
      [newEaseFactor, newInterval, nextReviewDate, review.id]
    );

    res.json({
      message: 'Review recorded',
      nextReviewDate,
      interval: newInterval
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to record review' });
  }
});

// Get progress statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
         COUNT(*) as total_cards,
         COUNT(CASE WHEN next_review_date <= NOW() THEN 1 END) as due_today,
         AVG(times_reviewed) as avg_reviews,
         COUNT(CASE WHEN times_reviewed = 0 THEN 1 END) as new_cards,
         COUNT(CASE WHEN times_reviewed > 0 THEN 1 END) as learning_cards
       FROM flashcard_reviews
       WHERE user_id = $1 AND flashcard_set_id = $2`,
      [req.user.id, req.params.id]
    );

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;