import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/projects');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-slate-800 dark:text-slate-200 font-sans relative overflow-hidden transition-colors duration-300 flex items-center justify-center p-4">
      
      {/* Ambient Painted Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-purple-400/20 dark:bg-purple-800/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[40%] h-[40%] rounded-full bg-sky-300/30 dark:bg-sky-900/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full bg-rose-200/20 dark:bg-rose-900/20 blur-[140px] pointer-events-none" />

      {/* Floating Theme Toggle (Glassy) */}
      <div className="absolute top-6 right-6 z-50 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 p-1 rounded-full shadow-sm">
        <ThemeToggle />
      </div>

      {/* Frosted Glass Login Modal */}
      <div className="relative z-10 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/60 dark:border-white/10 overflow-hidden">
        
        <div className="flex flex-col items-center mb-8">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              SynthLearn
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            Welcome back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Log in to continue to your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all placeholder:text-slate-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;