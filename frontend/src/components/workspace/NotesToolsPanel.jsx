import { useState, useEffect } from 'react';
import { StickyNote, Sparkles, Loader2 } from 'lucide-react';
import NotesTab from './NotesTab';
import AIToolsTab from './AIToolsTab';

const NotesToolsPanel = ({ projectId, onNotesUpdate, isGenerating, setIsGenerating, generatingRef }) => {
  const [activeTab, setActiveTab] = useState('notes');
  
  // FIX: Removed the useEffect that forced activeTab to 'tools'
  // Users can now switch tabs freely during generation

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="border-b border-slate-200 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
                ? 'border-violet-600 text-violet-600 bg-violet-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Tools
            </div>
          </button>
        </div>
      </div>

      {/* Loading Banner - Persists across tabs */}
      {isGenerating && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-center gap-2 flex-shrink-0 animate-in slide-in-from-top-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          <span className="text-xs font-semibold text-amber-800">
            Generating content in background...
          </span>
        </div>
      )}

      {/* Tab Content - Using CSS visibility to keep components mounted */}
      <div className="flex-1 overflow-hidden bg-slate-50 relative">
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