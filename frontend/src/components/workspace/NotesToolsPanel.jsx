import { StickyNote, Sparkles } from 'lucide-react';

const NotesToolsPanel = ({ projectId }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 border-b-2 border-blue-600">
            Notes
          </button>
          <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
            AI Tools
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <StickyNote className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600 mb-2">Notes Coming Soon</p>
          <p className="text-sm text-gray-500">Take notes and generate AI content</p>
        </div>
      </div>
    </div>
  );
};

export default NotesToolsPanel;