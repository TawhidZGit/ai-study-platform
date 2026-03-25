import { FileText, ChevronRight } from 'lucide-react';

const SourcesDock = ({ sources, onExpand, onSourceClick }) => {
  return (
    <div className="w-16 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-1 h-full flex-shrink-0 z-10 px-0 transition-colors">
      
      {/* Expand Button */}
      <div className="relative group w-full px-2 mb-2">
        <button
          onClick={onExpand}
          className="w-full h-12 flex items-center justify-center rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 active:scale-95 transition-all text-slate-500 dark:text-slate-400"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        {/* Custom Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Expand Sources
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 mb-2" />

      {/* Sources Icons */}
      {sources.length === 0 ? (
        <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold text-center px-1 mt-6 rotate-90 whitespace-nowrap select-none uppercase tracking-widest">
          No sources
        </div>
      ) : (
        <div className="flex flex-col w-full overflow-y-auto flex-1 no-scrollbar items-center px-2 space-y-2">
          {sources.map((source) => (
            <div key={source.id} className="relative group w-full">
              <button
                onClick={() => onSourceClick(source.id)}
                className="w-full h-14 flex flex-col items-center justify-center rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-sm active:scale-95 transition-all flex-shrink-0 overflow-hidden"
              >
                {/* Icon */}
                <FileText className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:-translate-y-1 transition-all duration-200" />
                
                {/* Tiny extension label */}
                <span className="absolute bottom-1.5 text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                  {source.file_type || 'TXT'}
                </span>
              </button>

              {/* Custom Tooltip for Source File */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all translate-x-1 group-hover:translate-x-0 max-w-[200px] truncate border border-slate-700 dark:border-slate-200">
                {source.filename}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesDock;