import { useState, useEffect } from 'react';
import { StickyNote, Sparkles, Plus, Trash2, Loader2, Download } from 'lucide-react';
import api from '../../utils/api';
import NotesTab from './NotesTab';
import AIToolsTab from './AIToolsTab';

const NotesToolsPanel = ({ projectId, onNotesUpdate }) => {
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="border-b flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <StickyNote className="h-4 w-4 inline mr-2" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'tools'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="h-4 w-4 inline mr-2" />
            AI Tools
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'notes' ? (
          <NotesTab projectId={projectId} onNotesUpdate={onNotesUpdate} />
        ) : (
          <AIToolsTab projectId={projectId} />
        )}
      </div>
    </div>
  );
};

export default NotesToolsPanel;