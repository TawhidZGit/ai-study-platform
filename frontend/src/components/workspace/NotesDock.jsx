import { StickyNote, Sparkles, ChevronLeft } from 'lucide-react';

const NotesDock = ({ notes, onExpand, onNoteClick }) => {
  return (
    <div className="w-16 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-4 gap-2">
      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-200 transition text-gray-600 mb-2"
        title="Expand Notes & Tools"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-300 mb-2" />

      {/* AI Tools Section */}
      <div className="mb-4">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-purple-100 transition group relative"
          title="AI Tools"
        >
          <Sparkles className="h-5 w-5 text-purple-600" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            AI Tools
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
          </div>
        </button>
      </div>

      {/* Notes Icons */}
      {notes.length === 0 ? (
        <div className="text-gray-400 text-xs text-center px-1 mt-4">
          No notes
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 w-full px-2">
          {notes.map((note, index) => (
            <button
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-lg hover:bg-yellow-100 transition group relative"
              title={note.title}
            >
              {/* Icon */}
              <StickyNote className="h-5 w-5 text-yellow-600" />
              
              {/* Note Number */}
              <span className="text-[10px] font-medium text-gray-600 mt-0.5">
                #{index + 1}
              </span>

              {/* Tooltip */}
              <div className="absolute right-full mr-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity max-w-[200px] truncate">
                {note.title}
                <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesDock;