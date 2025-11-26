import { FileText, ChevronRight } from 'lucide-react';

const SourcesDock = ({ sources, onExpand, onSourceClick }) => {
  return (
    <div className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-1 h-full flex-shrink-0 z-10 px-0">
      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-full h-12 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-all text-slate-500 mb-2"
        title="Expand Sources"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-200 mb-2" />

      {/* Sources Icons */}
      {sources.length === 0 ? (
        <div className="text-slate-300 text-[10px] font-medium text-center px-1 mt-4 rotate-90 whitespace-nowrap select-none">
          No sources
        </div>
      ) : (
        <div className="flex flex-col w-full overflow-y-auto flex-1 no-scrollbar">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSourceClick(source.id)}
              title={source.filename}
              className="w-full h-14 flex flex-col items-center justify-center hover:bg-white hover:shadow-sm active:scale-90 active:rounded-lg transition-all group flex-shrink-0"
            >
              {/* Icon */}
              <FileText className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform duration-200" />
              
              {/* Tiny extension label */}
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                {source.file_type || 'PDF'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesDock;