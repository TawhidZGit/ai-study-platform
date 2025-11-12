import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Trophy, Lock, Flame, ArrowLeft, Loader2 } from 'lucide-react';

const Achievements = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achievementsRes, streakRes] = await Promise.all([
        api.get('/stats/achievements/all'),
        api.get('/stats/streak')
      ]);

      setAchievements(achievementsRes.data.achievements);
      setStreak(streakRes.data.streak);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  const milestones = achievements.filter(a => a.category === 'milestone');
  const streaks = achievements.filter(a => a.category === 'streak');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Achievements</h1>

        {/* Streak Display */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-10 w-10" />
                <h2 className="text-3xl font-bold">Study Streak</h2>
              </div>
              <p className="text-orange-100">Keep learning every day!</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{streak?.currentStreak || 0}</div>
              <div className="text-orange-100 text-sm">Current Streak</div>
              <div className="mt-4 text-2xl font-semibold">{streak?.longestStreak || 0}</div>
              <div className="text-orange-100 text-xs">Longest Streak</div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Overall Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {earnedCount} of {totalCount} achievements unlocked
          </p>
        </div>

        {/* Streak Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Streak Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streaks.map((achievement) => (
              <AchievementCard key={achievement.type} achievement={achievement} />
            ))}
          </div>
        </div>

        {/* Milestone Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Milestone Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((achievement) => (
              <AchievementCard key={achievement.type} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement }) => {
  return (
    <div
      className={`rounded-lg p-6 transition ${
        achievement.earned
          ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400'
          : 'bg-gray-100 border-2 border-gray-300 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${achievement.earned ? 'bg-yellow-400' : 'bg-gray-400'}`}>
          {achievement.earned ? (
            <Trophy className="h-6 w-6 text-white" />
          ) : (
            <Lock className="h-6 w-6 text-white" />
          )}
        </div>
        {achievement.earned && (
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
            Unlocked
          </span>
        )}
      </div>
      <h3 className="font-bold text-gray-800 mb-2">{achievement.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
      {achievement.earned && achievement.earnedAt && (
        <p className="text-xs text-gray-500">
          Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default Achievements;