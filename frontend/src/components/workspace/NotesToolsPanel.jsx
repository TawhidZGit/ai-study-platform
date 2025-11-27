import { useState, useEffect } from 'react';
import { StickyNote, Sparkles, Loader2 } from 'lucide-react';
import NotesTab from './NotesTab';
import AIToolsTab from './AIToolsTab';

const NotesToolsPanel = ({ projectId, onNotesUpdate, isGenerating, setIsGenerating, generatingRef }) => {
  const [activeTab, setActiveTab] = useState('notes');
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 transition-colors">
      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'tools'
                ? 'border-violet-600 text-violet-600 bg-violet-50/30 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Tools
            </div>
          </button>
        </div>
      </div>

      {/* Loading Banner */}
      {isGenerating && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50 px-4 py-3 flex items-center justify-center gap-2 flex-shrink-0 animate-in slide-in-from-top-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-500" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
            Generating content in background...
          </span>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
        <div className={`h-full w-full absolute inset-0 ${activeTab === 'notes' ? 'z-10 visible' : 'z-0 invisible'}`}>
           <NotesTab projectId={projectId} onNotesUpdate={onNotesUpdate} />
        </div>
        
        <div className={`h-full w-full absolute inset-0 ${activeTab === 'tools' ? 'z-10 visible' : 'z-0 invisible'}`}>
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