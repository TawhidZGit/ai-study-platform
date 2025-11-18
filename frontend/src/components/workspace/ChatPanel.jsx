import { MessageCircle } from 'lucide-react';

const ChatPanel = ({ projectId }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Chat with AI</h2>
        <p className="text-sm text-gray-600">Ask questions about your sources</p>
      </div>

      {/* Chat Area - Coming Soon */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-600 mb-2">Chat Coming Soon</p>
          <p className="text-sm text-gray-500">Upload sources first, then chat with AI</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Ask a question... (coming soon)"
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default ChatPanel;