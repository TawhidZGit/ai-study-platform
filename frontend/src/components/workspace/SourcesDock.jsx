import { FileText, ChevronRight } from 'lucide-react';

const SourcesDock = ({ sources, onExpand, onSourceClick }) => {
  return (
    <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-2">
      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-200 transition text-gray-600 mb-2"
        title="Expand Sources"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-300 mb-2" />

      {/* Sources Icons */}
      {sources.length === 0 ? (
        <div className="text-gray-400 text-xs text-center px-1 mt-4">
          No sources
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 w-full px-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSourceClick(source.id)}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-lg hover:bg-blue-100 transition group relative"
              title={source.filename}
            >
              {/* Icon */}
              <FileText className="h-5 w-5 text-blue-600" />
              
              {/* File Extension Badge */}
              <span className="text-[10px] font-medium text-gray-600 mt-0.5 uppercase">
                {source.file_type || 'file'}
              </span>

              {/* Tooltip on Hover */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                {source.filename}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesDock;