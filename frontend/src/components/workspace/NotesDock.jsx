import { StickyNote, Sparkles, ChevronLeft } from 'lucide-react';

const NotesDock = ({ notes, onExpand, onNoteClick }) => {
  return (
    <div className="w-16 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border-l border-white/60 dark:border-white/10 flex flex-col items-center py-4 gap-1 h-full flex-shrink-0 z-10 px-0 transition-colors">
      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/80 dark:hover:bg-white/10 active:scale-90 transition-all text-slate-500 dark:text-slate-400 mb-2 shadow-sm border border-transparent hover:border-white/50 dark:hover:border-white/5"
        title="Expand Notes & Tools"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-200/60 dark:bg-white/10 mb-2" />

      {/* AI Tools Section */}
      <div className="mb-2 flex-shrink-0 w-full px-2">
        <button
          className="w-full h-12 rounded-xl flex items-center justify-center hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all group border border-transparent hover:border-white/50 dark:hover:border-white/5"
          title="AI Tools"
        >
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* Notes Icons */}
      {notes.length === 0 ? (
        <div className="text-slate-400 dark:text-slate-500 text-[10px] font-medium text-center px-1 mt-4 rotate-90 whitespace-nowrap select-none">
          No notes
        </div>
      ) : (
        <div className="flex flex-col w-full overflow-y-auto flex-1 no-scrollbar px-2 gap-1.5">
          {notes.map((note, index) => (
            <button
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              title={note.title}
              className="w-full h-12 rounded-xl flex flex-col items-center justify-center hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all group flex-shrink-0 border border-transparent hover:border-white/50 dark:hover:border-white/5 hover:shadow-sm"
            >
              {/* Icon */}
              <StickyNote className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform duration-200" />
              
              {/* Note Number */}
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
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