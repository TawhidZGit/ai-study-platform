import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-slate-800 dark:text-slate-200 font-sans relative overflow-hidden transition-colors duration-300 flex items-center justify-center p-4">
      
      {/* Ambient Painted Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-rose-400/20 dark:bg-rose-800/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-3xl shadow-xl p-10 w-full max-w-md border border-white/60 dark:border-white/10 text-center">
        
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ghost className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
        </div>
        
        <div className="text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">404</div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Lost in the void
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          The page you're looking for has vanished into the ether or never existed at all.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all text-sm font-semibold shadow-lg shadow-slate-900/20 dark:shadow-white/10"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;