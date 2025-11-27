import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Loader2, Trash2, Sparkles, 
  ChevronDown, BookOpen, BrainCircuit, Lightbulb, FileText, Check 
} from 'lucide-react';
import api from '../../utils/api';
import MarkdownRenderer from '../MarkdownRenderer';
import { useAuth } from '../../context/AuthContext';

const ChatPanel = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Dropdown States
  const [mode, setMode] = useState('study');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const modeDropdownRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  const MODES = [
    { id: 'study', label: 'Study Mode', icon: BookOpen, desc: 'General Q&A' },
    { id: 'quiz', label: 'Quiz Me', icon: BrainCircuit, desc: 'Test your knowledge' },
    { id: 'explain', label: 'Explain', icon: Lightbulb, desc: 'Simple explanations' },
    { id: 'summarize', label: 'Summarize', icon: FileText, desc: 'Key takeaways' },
  ];

  const currentMode = MODES.find(m => m.id === mode);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const words = user.name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    fetchChatHistory();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target)) {
        setIsModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await api.get(`/chat/${projectId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper for date separators
  const formatDateSeparator = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessageContent = input.trim();
    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`;
    const tempUserMsg = {
      id: tempId,
      role: 'user',
      content: userMessageContent,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post(`/chat/${projectId}`, {
        message: userMessageContent,
        mode: mode
      });

      setMessages(prev => {
        const updatedMessages = prev.map(msg => {
          if (msg.id === tempId) {
            return response.data.userMessage;
          }
          return msg;
        });

        return [...updatedMessages, response.data.assistantMessage];
      });

      inputRef.current?.focus();
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (!confirm('Clear all chat history?')) return;

    try {
      await api.delete(`/chat/${projectId}`);
      setMessages([]);
    } catch (error) {
      console.error('Clear chat error:', error);
      alert('Failed to clear chat');
    }
  };

  if (loadingHistory) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Assistant</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions about your sources</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Custom Mode Dropdown */}
          <div className="relative" ref={modeDropdownRef}>
            <button
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all text-xs font-semibold text-slate-600 dark:text-slate-300 min-w-[140px] justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                {currentMode && <currentMode.icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                <span>{currentMode?.label}</span>
              </div>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select AI Mode
                </div>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start gap-3 ${
                      mode === m.id ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${
                      mode === m.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <m.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium flex items-center gap-2 ${
                        mode === m.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {m.label}
                        {mode === m.id && <Check className="h-3 w-3" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-indigo-300 dark:text-indigo-700" />
              </div>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Start a Conversation</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upload sources and ask questions to begin!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isNewDay = index === 0 || 
                new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

              return (
                <div key={message.id}>
                  {isNewDay && (
                    <div className="flex justify-center my-6">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                        {formatDateSeparator(message.created_at)}
                      </span>
                    </div>
                  )}
                  <ChatMessage message={message} userInitials={getUserInitials()} />
                </div>
              );
            })}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl rounded-tl-none p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your message to ${currentMode?.label}...`}
            disabled={loading}
            rows={1}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none shadow-inner text-sm transition-all"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, userInitials }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
        isUser ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        {isUser ? (
          <span className="text-white text-xs font-bold">{userInitials}</span>
        ) : (
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        )}
      </div>

     <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
          isUser 
            ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-tr-sm' 
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            // CHANGED: Forced very light grey (#e5e7eb) for dark mode AI text
            <div className="prose prose-sm max-w-none prose-slate dark:prose-invert text-slate-700 dark:text-slate-300 dark:[&_*]:!text-slate-300">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>
        {/* Timestamps removed */}
      </div>
    </div>
  );
};

export default ChatPanel;