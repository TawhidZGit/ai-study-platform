import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Welcome to your AI Study Platform dashboard! Features coming soon:
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>📄 Upload documents</li>
            <li>📝 Generate AI summaries and notes</li>
            <li>❓ Create quizzes automatically</li>
            <li>🎴 Generate flashcards</li>
            <li>📊 Track your progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;