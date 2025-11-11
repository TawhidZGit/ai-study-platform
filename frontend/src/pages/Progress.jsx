import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, BookOpen, Brain, Target, Award, Calendar,
  FileText, Loader2
} from 'lucide-react';

const Progress = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [studyActivity, setStudyActivity] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [flashcardProgress, setFlashcardProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [overview, performance, activity, sessions, flashcards] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/stats/quiz-performance'),
        api.get('/stats/study-activity'),
        api.get('/stats/recent-sessions'),
        api.get('/stats/flashcard-progress')
      ]);

      setStats(overview.data.stats);
      setQuizPerformance(performance.data.performance);
      setStudyActivity(activity.data.activity);
      setRecentSessions(sessions.data.sessions);
      setFlashcardProgress(flashcards.data.progress);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const pieData = flashcardProgress ? [
    { name: 'New', value: flashcardProgress.new },
    { name: 'Learning', value: flashcardProgress.learning },
    { name: 'Mastered', value: flashcardProgress.mastered },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Progress Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<FileText />}
            title="Documents"
            value={stats?.totalDocuments || 0}
            color="blue"
          />
          <StatCard
            icon={<BookOpen />}
            title="Quizzes Taken"
            value={stats?.totalQuizzes || 0}
            color="green"
          />
          <StatCard
            icon={<Brain />}
            title="Flashcard Sets"
            value={stats?.totalFlashcardSets || 0}
            color="purple"
          />
          <StatCard
            icon={<Target />}
            title="Avg Quiz Score"
            value={`${stats?.averageQuizScore || 0}%`}
            color="orange"
          />
          <StatCard
            icon={<Award />}
            title="Cards Reviewed"
            value={stats?.totalFlashcardsReviewed || 0}
            color="pink"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quiz Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quiz Performance
            </h2>
            {quizPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={quizPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No quiz data yet</p>
                <p className="text-sm mt-2">Take some quizzes to see your progress!</p>
              </div>
            )}
          </div>

          {/* Study Activity Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Study Activity (Last 7 Days)
            </h2>
            {studyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quizzes" fill="#3b82f6" name="Quizzes" />
                  <Bar dataKey="flashcards" fill="#10b981" name="Flashcards" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No recent activity</p>
                <p className="text-sm mt-2">Start studying to see your activity!</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flashcard Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Flashcard Progress</h2>
            {pieData.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No flashcards yet</p>
                <p className="text-sm mt-2">Create flashcards to track progress!</p>
              </div>
            )}
            {flashcardProgress && (
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{flashcardProgress.new}</div>
                  <div className="text-sm text-gray-600">New</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{flashcardProgress.learning}</div>
                  <div className="text-sm text-gray-600">Learning</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{flashcardProgress.mastered}</div>
                  <div className="text-sm text-gray-600">Mastered</div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Quiz Sessions</h2>
            {recentSessions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/quiz/${session.quizId}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800 truncate">{session.filename}</h3>
                      <span className={`text-lg font-bold ${
                        session.percentage >= 80 ? 'text-green-600' :
                        session.percentage >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {session.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{session.score}/{session.totalQuestions} correct</span>
                      <span>{new Date(session.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No quiz history yet</p>
                <p className="text-sm mt-2">Take a quiz to see your history!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    pink: 'text-pink-600 bg-pink-50',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
};

export default Progress;