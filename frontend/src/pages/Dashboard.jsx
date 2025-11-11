import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Brain, BookOpen, GraduationCap, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/overview');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const features = [
    {
      icon: <FileText className="h-12 w-12" />,
      title: 'Documents',
      description: 'Upload and manage your study materials',
      action: () => navigate('/documents'),
      color: 'blue',
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: 'AI Summaries',
      description: 'Generate smart summaries and notes',
      action: () => navigate('/documents'),
      color: 'purple',
    },
    {
      icon: <BookOpen className="h-12 w-12" />,
      title: 'Quizzes',
      description: 'Test your knowledge with AI-generated quizzes',
      action: () => navigate('/documents'),
      color: 'green',
    },
    {
      icon: <GraduationCap className="h-12 w-12" />,
      title: 'Flashcards',
      description: 'Study with spaced repetition',
      action: () => navigate('/documents'),
      color: 'orange',
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: 'Progress',
      description: 'Track your study statistics',
      action: () => navigate('/progress'),
      color: 'indigo',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">AI Study Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600 mb-8">
          Your AI-powered study assistant
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={feature.action}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-left group`}
            >
              <div className={`text-${feature.color}-600 mb-4 group-hover:scale-110 transition`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats?.totalDocuments || 0}
              </div>
              <div className="text-gray-600 text-sm mt-1">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats?.totalQuizzes || 0}
              </div>
              <div className="text-gray-600 text-sm mt-1">Quizzes Taken</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats?.totalFlashcardSets || 0}
              </div>
              <div className="text-gray-600 text-sm mt-1">Flashcard Sets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats?.averageQuizScore || 0}%
              </div>
              <div className="text-gray-600 text-sm mt-1">Avg Quiz Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">
                {stats?.totalFlashcardsReviewed || 0}
              </div>
              <div className="text-gray-600 text-sm mt-1">Cards Reviewed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;