import { StickyNote, Sparkles, ChevronLeft } from 'lucide-react';

const NotesDock = ({ notes, onExpand, onNoteClick }) => {
  return (
    <div className="w-16 bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-1 h-full flex-shrink-0 z-10 px-0 transition-colors">
      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-full h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all text-slate-500 dark:text-slate-400 mb-2"
        title="Expand Notes & Tools"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 mb-2" />

      {/* AI Tools Section */}
      <div className="mb-2 flex-shrink-0 w-full">
        <button
          className="w-full h-14 flex items-center justify-center hover:bg-violet-50 dark:hover:bg-violet-900/20 active:scale-90 active:rounded-lg transition-all group"
          title="AI Tools"
        >
          <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* Notes Icons */}
      {notes.length === 0 ? (
        <div className="text-slate-300 dark:text-slate-600 text-[10px] font-medium text-center px-1 mt-4 rotate-90 whitespace-nowrap select-none">
          No notes
        </div>
      ) : (
        <div className="flex flex-col w-full overflow-y-auto flex-1 no-scrollbar">
          {notes.map((note, index) => (
            <button
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              title={note.title}
              className="w-full h-14 flex flex-col items-center justify-center hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm active:scale-90 active:rounded-lg transition-all group flex-shrink-0"
            >
              {/* Icon */}
              <StickyNote className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform duration-200" />
              
              {/* Note Number */}
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                #{index + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesDock;