import { useState } from 'react';
import { StickyNote, Sparkles, Loader2 } from 'lucide-react';
import NotesTab from './NotesTab';
import AIToolsTab from './AIToolsTab';

const NotesToolsPanel = ({ projectId, onNotesUpdate, isGenerating, setIsGenerating, generatingRef }) => {
  const [activeTab, setActiveTab] = useState('notes');
  
  return (
    <div className="h-full flex flex-col bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border-l border-white/60 dark:border-white/10 transition-colors">
      {/* Tabs Container - Glassy Pill Design */}
      <div className="p-3 border-b border-white/60 dark:border-white/10 flex-shrink-0">
        <div className="flex bg-white/40 dark:bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/50 dark:border-white/5">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'tools'
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Tools
            </div>
          </button>
        </div>
      </div>

      {/* Loading Banner - Soft Glassy Amber */}
      {isGenerating && (
        <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 flex items-center justify-center gap-2 flex-shrink-0 animate-in slide-in-from-top-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-500" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
            Generating content in background...
          </span>
        </div>
      )}

      {/* Tab Content - Transparent to let panel glass show through */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full w-full absolute inset-0 transition-opacity duration-300 ${activeTab === 'notes' ? 'z-10 opacity-100 visible' : 'z-0 opacity-0 invisible'}`}>
           <NotesTab projectId={projectId} onNotesUpdate={onNotesUpdate} />
        </div>
        
        <div className={`h-full w-full absolute inset-0 transition-opacity duration-300 ${activeTab === 'tools' ? 'z-10 opacity-100 visible' : 'z-0 opacity-0 invisible'}`}>
           <AIToolsTab 
            projectId={projectId} 
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            generatingRef={generatingRef}
          />
        </div>
      </div>
    </div>
  );
};

export default NotesToolsPanel;