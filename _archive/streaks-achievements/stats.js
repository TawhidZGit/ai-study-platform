const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Get overview statistics
router.get('/overview', async (req, res) => {
  try {
    // Total documents
    const docsResult = await pool.query(
      'SELECT COUNT(*) as total FROM documents WHERE user_id = $1',
      [req.user.id]
    );

    // Total quizzes taken
    const quizzesResult = await pool.query(
      'SELECT COUNT(*) as total FROM study_sessions WHERE user_id = $1',
      [req.user.id]
    );

    // Total flashcard sets
    const flashcardsResult = await pool.query(
      `SELECT COUNT(DISTINCT fs.id) as total 
       FROM flashcard_sets fs
       JOIN documents d ON fs.document_id = d.id
       WHERE d.user_id = $1`,
      [req.user.id]
    );

    // Average quiz score
    const avgScoreResult = await pool.query(
      `SELECT 
        AVG(CAST(score AS FLOAT) / CAST(total_questions AS FLOAT) * 100) as avg_score
       FROM study_sessions 
       WHERE user_id = $1`,
      [req.user.id]
    );

    // Total flashcards reviewed
    const reviewsResult = await pool.query(
      `SELECT COUNT(*) as total 
       FROM flashcard_reviews fr
       WHERE fr.user_id = $1 AND fr.times_reviewed > 0`,
      [req.user.id]
    );

    res.json({
      stats: {
        totalDocuments: parseInt(docsResult.rows[0].total),
        totalQuizzes: parseInt(quizzesResult.rows[0].total),
        totalFlashcardSets: parseInt(flashcardsResult.rows[0].total),
        averageQuizScore: Math.round(parseFloat(avgScoreResult.rows[0].avg_score) || 0),
        totalFlashcardsReviewed: parseInt(reviewsResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get quiz performance over time
router.get('/quiz-performance', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        DATE(completed_at) as date,
        AVG(CAST(score AS FLOAT) / CAST(total_questions AS FLOAT) * 100) as avg_score,
        COUNT(*) as quiz_count
       FROM study_sessions
       WHERE user_id = $1
       GROUP BY DATE(completed_at)
       ORDER BY date DESC
       LIMIT 30`,
      [req.user.id]
    );

    const performance = result.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(parseFloat(row.avg_score)),
      count: parseInt(row.quiz_count)
    })).reverse();

    res.json({ performance });
  } catch (error) {
    console.error('Get quiz performance error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz performance' });
  }
});

// Get study activity (last 7 days)
router.get('/study-activity', async (req, res) => {
  try {
    // Get quiz activity
    const quizActivity = await pool.query(
      `SELECT DATE(completed_at) as date, COUNT(*) as count
       FROM study_sessions
       WHERE user_id = $1 
       AND completed_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(completed_at)`,
      [req.user.id]
    );

    // Get flashcard activity
    const flashcardActivity = await pool.query(
      `SELECT DATE(last_reviewed) as date, COUNT(*) as count
       FROM flashcard_reviews
       WHERE user_id = $1 
       AND last_reviewed >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(last_reviewed)`,
      [req.user.id]
    );

    // Combine and format
    const activityMap = {};
    
    quizActivity.rows.forEach(row => {
      const dateStr = new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      activityMap[dateStr] = { date: dateStr, quizzes: parseInt(row.count), flashcards: 0 };
    });

    flashcardActivity.rows.forEach(row => {
      const dateStr = new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (activityMap[dateStr]) {
        activityMap[dateStr].flashcards = parseInt(row.count);
      } else {
        activityMap[dateStr] = { date: dateStr, quizzes: 0, flashcards: parseInt(row.count) };
      }
    });

    const activity = Object.values(activityMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({ activity });
  } catch (error) {
    console.error('Get study activity error:', error);
    res.status(500).json({ error: 'Failed to fetch study activity' });
  }
});

// Get recent study sessions
router.get('/recent-sessions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ss.*,
        q.id as quiz_id,
        d.filename
       FROM study_sessions ss
       JOIN quizzes q ON ss.quiz_id = q.id
       JOIN documents d ON q.document_id = d.id
       WHERE ss.user_id = $1
       ORDER BY ss.completed_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    const sessions = result.rows.map(row => ({
      id: row.id,
      quizId: row.quiz_id,
      filename: row.filename,
      score: row.score,
      totalQuestions: row.total_questions,
      percentage: Math.round((row.score / row.total_questions) * 100),
      completedAt: row.completed_at
    }));

    res.json({ sessions });
  } catch (error) {
    console.error('Get recent sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent sessions' });
  }
});

// Get flashcard progress
router.get('/flashcard-progress', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN times_reviewed = 0 THEN 1 END) as new_cards,
        COUNT(CASE WHEN times_reviewed > 0 AND times_reviewed < 5 THEN 1 END) as learning,
        COUNT(CASE WHEN times_reviewed >= 5 THEN 1 END) as mastered
       FROM flashcard_reviews
       WHERE user_id = $1`,
      [req.user.id]
    );

    const stats = result.rows[0];

    res.json({
      progress: {
        total: parseInt(stats.total),
        new: parseInt(stats.new_cards),
        learning: parseInt(stats.learning),
        mastered: parseInt(stats.mastered)
      }
    });
  } catch (error) {
    console.error('Get flashcard progress error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard progress' });
  }
});

// Get user streak data
router.get('/streak', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_streaks WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          totalStudyDays: 0,
          lastStudyDate: null
        }
      });
    }

    const streak = result.rows[0];
    res.json({
      streak: {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        totalStudyDays: streak.total_study_days,
        lastStudyDate: streak.last_study_date
      }
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
});

// Get user achievements
router.get('/achievements', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT achievement_type, achievement_name, earned_at 
       FROM user_achievements 
       WHERE user_id = $1
       ORDER BY earned_at DESC`,
      [req.user.id]
    );

    res.json({ achievements: result.rows });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get all available achievements (with earned status)
router.get('/achievements/all', async (req, res) => {
  try {
    const allAchievements = [
      { type: 'first_doc', name: 'First Document', description: 'Upload your first document', category: 'milestone' },
      { type: 'doc_10', name: '10 Documents', description: 'Upload 10 documents', category: 'milestone' },
      { type: 'first_quiz', name: 'First Quiz', description: 'Complete your first quiz', category: 'milestone' },
      { type: 'quiz_10', name: '10 Quizzes', description: 'Complete 10 quizzes', category: 'milestone' },
      { type: 'quiz_50', name: '50 Quizzes', description: 'Complete 50 quizzes', category: 'milestone' },
      { type: 'reviews_100', name: '100 Card Reviews', description: 'Review 100 flashcards', category: 'milestone' },
      { type: 'reviews_500', name: '500 Card Reviews', description: 'Review 500 flashcards', category: 'milestone' },
      { type: 'streak_3', name: '3 Day Streak', description: 'Study for 3 days in a row', category: 'streak' },
      { type: 'streak_7', name: '7 Day Streak', description: 'Study for 7 days in a row', category: 'streak' },
      { type: 'streak_14', name: '14 Day Streak', description: 'Study for 14 days in a row', category: 'streak' },
      { type: 'streak_30', name: '30 Day Streak', description: 'Study for 30 days in a row', category: 'streak' },
      { type: 'streak_100', name: '100 Day Streak', description: 'Study for 100 days in a row', category: 'streak' },
    ];

    const earnedResult = await pool.query(
      'SELECT achievement_type, earned_at FROM user_achievements WHERE user_id = $1',
      [req.user.id]
    );

    const earnedMap = {};
    earnedResult.rows.forEach(row => {
      earnedMap[row.achievement_type] = row.earned_at;
    });

    const achievements = allAchievements.map(achievement => ({
      ...achievement,
      earned: !!earnedMap[achievement.type],
      earnedAt: earnedMap[achievement.type] || null
    }));

    res.json({ achievements });
  } catch (error) {
    console.error('Get all achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

module.exports = router;