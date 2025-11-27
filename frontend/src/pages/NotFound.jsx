import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-indigo-600 dark:text-indigo-500 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-lg shadow-indigo-500/20 font-medium"
          >
            <Home className="h-5 w-5" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;