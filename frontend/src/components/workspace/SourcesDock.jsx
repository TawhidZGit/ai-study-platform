import { FileText, ChevronRight } from 'lucide-react';

const SourcesDock = ({ sources, onExpand, onSourceClick }) => {
  return (
    <div className="w-16 bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border-r border-white/60 dark:border-white/10 flex flex-col items-center py-6 gap-3 h-full flex-shrink-0 z-20 px-0 transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 shadow-sm border border-white/60 dark:border-white/5 active:scale-90 transition-all text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
        title="Expand Sources"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-200/60 dark:bg-white/10 mb-2" />

      {/* Sources Icons */}
      {sources.length === 0 ? (
        <div className="text-slate-400/70 dark:text-slate-500/70 text-[10px] font-bold uppercase tracking-[0.2em] text-center px-1 mt-8 rotate-90 whitespace-nowrap select-none">
          No sources
        </div>
      ) : (
        <div className="flex flex-col w-full items-center overflow-y-auto flex-1 no-scrollbar gap-3 px-2 pt-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSourceClick(source.id)}
              title={source.filename}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/40 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-white/10 border border-white/50 dark:border-white/5 hover:border-indigo-300/50 dark:hover:border-indigo-500/30 hover:shadow-lg active:scale-95 transition-all group flex-shrink-0 relative"
            >
              {/* Icon */}
              <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
              
              {/* Floating Tooltip/Label */}
              <span className="absolute left-14 bg-white/90 dark:bg-[#222]/90 backdrop-blur-md text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none border border-white/50 dark:border-white/10 shadow-xl whitespace-nowrap z-50">
                {source.filename}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesDock;