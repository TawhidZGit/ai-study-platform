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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

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
      <div className="h-full flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] overflow-hidden transition-colors duration-300">
      
      {/* Ambient Painted Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-800/10 blur-[100px] pointer-events-none" />

      {/* Glassy Header */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-[#1A1A1A]/60 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 shadow-[0_4px_30px_rgb(0,0,0,0.05)] z-20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-xl shadow-sm">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Assistant</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Synthesize your sources</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Custom Glassy Mode Dropdown */}
          <div className="relative" ref={modeDropdownRef}>
            <button
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md border border-white/60 dark:border-white/5 hover:bg-white/80 dark:hover:bg-[#222]/50 rounded-full transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                {currentMode && <currentMode.icon className="h-3.5 w-3.5 text-indigo-500" />}
                <span>{currentMode?.label}</span>
              </div>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModeDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-60 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 dark:border-white/10 py-2 z-50 overflow-hidden">
                <div className="px-5 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Select AI Mode
                </div>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition flex items-start gap-3 ${
                      mode === m.id ? 'bg-indigo-50/50 dark:bg-slate-800/40' : ''
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-xl border border-white/50 dark:border-white/5 ${
                      mode === m.id ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-slate-200' : 'bg-white dark:bg-black/20 text-slate-400'
                    }`}>
                      <m.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold flex items-center gap-2 ${
                        mode === m.id ? 'text-indigo-600 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'
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
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white/60 dark:hover:bg-rose-500/10 rounded-full transition-all border border-transparent hover:border-white/60 dark:hover:border-white/5"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 relative z-10">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-sm p-10 max-w-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Start a Conversation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your AI assistant is ready. Upload sources to the space and ask questions to begin!
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => {
              const isNewDay = index === 0 || 
                new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

              return (
                <div key={message.id}>
                  {isNewDay && (
                    <div className="flex justify-center my-8">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/60 dark:border-white/5 uppercase tracking-wider shadow-sm">
                        {formatDateSeparator(message.created_at)}
                      </span>
                    </div>
                  )}
                  <ChatMessage message={message} userInitials={getUserInitials()} />
                </div>
              );
            })}
            
            {loading && (
              <div className="flex items-start gap-4 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm rounded-3xl rounded-tl-sm p-4 inline-block">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm font-medium">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    Synthesizing...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Glassy Input Area */}
      <div className="p-4 md:p-6 bg-white/40 dark:bg-[#1A1A1A]/60 backdrop-blur-2xl border-t border-white/60 dark:border-white/10 flex-shrink-0 z-20">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentMode?.label}...`}
            disabled={loading}
            rows={1}
            className="flex-1 px-5 py-3.5 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] text-sm transition-all"
            style={{ minHeight: '52px', maxHeight: '150px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          {/* Universal slate-700 background for Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="h-[52px] w-[52px] flex items-center justify-center bg-slate-700 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-700/20 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex-shrink-0"
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
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Universal slate-800 background for User Profile */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1 z-10 ${
        isUser 
          ? 'bg-slate-800 text-white' 
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
      }`}>
        {isUser ? (
          <span className="text-xs font-bold">{userInitials}</span>
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left p-5 shadow-sm text-sm leading-relaxed ${
          isUser 
            // Universal slate-800 background for User Message Bubble
            ? 'bg-slate-800 text-white rounded-3xl rounded-tr-sm shadow-md border border-transparent dark:border-white/5' 
            : 'bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap font-medium">
              {message.content}
            </p>
          ) : (
            <div className={`
              prose prose-sm max-w-none prose-slate dark:prose-invert 
              text-slate-800 dark:text-slate-200 
              dark:[&_*]:text-slate-200
              dark:[&_code]:!bg-slate-800/80 
              dark:[&_code]:!text-slate-200 
              dark:[&_code]:!px-1.5 
              dark:[&_code]:!py-0.5 
              dark:[&_code]:!rounded-md 
              [&_code]:font-normal
              dark:[&_pre]:!bg-[#111]
              dark:[&_pre]:!border 
              dark:[&_pre]:!border-white/10
            `}>
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;