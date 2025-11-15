const pool = require('../config/db');

const streakService = {
  // Update streak when user studies
  async updateStreak(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get current streak data
      const streakResult = await pool.query(
        'SELECT * FROM user_streaks WHERE user_id = $1',
        [userId]
      );

      if (streakResult.rows.length === 0) {
        // First time studying - create streak record
        await pool.query(
          `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_study_date, total_study_days)
           VALUES ($1, 1, 1, $2, 1)`,
          [userId, today]
        );
        return { currentStreak: 1, longestStreak: 1 };
      }

      const streak = streakResult.rows[0];
      const lastStudyDate = streak.last_study_date ? 
        new Date(streak.last_study_date).toISOString().split('T')[0] : null;

      // Already studied today
      if (lastStudyDate === today) {
        return { 
          currentStreak: streak.current_streak, 
          longestStreak: streak.longest_streak 
        };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak;
      let newLongestStreak;

      if (lastStudyDate === yesterdayStr) {
        // Continuing streak
        newCurrentStreak = streak.current_streak + 1;
        newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);
      } else {
        // Streak broken - start over
        newCurrentStreak = 1;
        newLongestStreak = streak.longest_streak;
      }

      await pool.query(
        `UPDATE user_streaks 
         SET current_streak = $1, 
             longest_streak = $2, 
             last_study_date = $3,
             total_study_days = total_study_days + 1,
             updated_at = NOW()
         WHERE user_id = $4`,
        [newCurrentStreak, newLongestStreak, today, userId]
      );

      // Check for streak achievements
      await this.checkStreakAchievements(userId, newCurrentStreak, newLongestStreak);

      return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak };
    } catch (error) {
      console.error('Update streak error:', error);
      throw error;
    }
  },

  // Check and award streak achievements
  async checkStreakAchievements(userId, currentStreak, longestStreak) {
    const achievements = [
      { type: 'streak_3', name: '3 Day Streak', threshold: 3 },
      { type: 'streak_7', name: '7 Day Streak', threshold: 7 },
      { type: 'streak_14', name: '14 Day Streak', threshold: 14 },
      { type: 'streak_30', name: '30 Day Streak', threshold: 30 },
      { type: 'streak_100', name: '100 Day Streak', threshold: 100 },
    ];

    for (const achievement of achievements) {
      if (currentStreak >= achievement.threshold || longestStreak >= achievement.threshold) {
        await pool.query(
          `INSERT INTO user_achievements (user_id, achievement_type, achievement_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, achievement_type) DO NOTHING`,
          [userId, achievement.type, achievement.name]
        );
      }
    }
  },

  // Check and award milestone achievements
  async checkMilestoneAchievements(userId) {
    try {
      // Get user stats
      const stats = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM documents WHERE user_id = $1) as doc_count,
          (SELECT COUNT(*) FROM study_sessions WHERE user_id = $1) as quiz_count,
          (SELECT COUNT(*) FROM flashcard_reviews WHERE user_id = $1 AND times_reviewed > 0) as review_count
        `,
        [userId]
      );

      const { doc_count, quiz_count, review_count } = stats.rows[0];

      const milestones = [
        { type: 'first_doc', name: 'First Document', check: doc_count >= 1 },
        { type: 'doc_10', name: '10 Documents', check: doc_count >= 10 },
        { type: 'first_quiz', name: 'First Quiz', check: quiz_count >= 1 },
        { type: 'quiz_10', name: '10 Quizzes', check: quiz_count >= 10 },
        { type: 'quiz_50', name: '50 Quizzes', check: quiz_count >= 50 },
        { type: 'reviews_100', name: '100 Card Reviews', check: review_count >= 100 },
        { type: 'reviews_500', name: '500 Card Reviews', check: review_count >= 500 },
      ];

      for (const milestone of milestones) {
        if (milestone.check) {
          await pool.query(
            `INSERT INTO user_achievements (user_id, achievement_type, achievement_name)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, achievement_type) DO NOTHING`,
            [userId, milestone.type, milestone.name]
          );
        }
      }
    } catch (error) {
      console.error('Check milestone achievements error:', error);
    }
  }
};

module.exports = streakService;