import MarkdownRenderer from '../MarkdownRenderer';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, BrainCircuit, Layers, FileText, 
  Loader2, Trash2, Download, Eye, X, Maximize2, Minimize2, 
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';
import api from '../../utils/api';

const AIToolsTab = ({ projectId, isGenerating, setIsGenerating, generatingRef }) => {
  const [generatedContent, setGeneratedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingContent, setViewingContent] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateType, setGenerateType] = useState(null);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    fetchGeneratedContent();
  }, [projectId]);

  useEffect(() => {
    let timeoutId;
    if (!isGenerating) {
      timeoutId = setTimeout(() => {
        fetchGeneratedContent();
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [isGenerating]);

  const fetchGeneratedContent = async () => {
    try {
      const response = await api.get(`/generation/${projectId}`);
      setGeneratedContent(response.data.content);
    } catch (error) {
      console.error('Error fetching generated content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type, options = {}) => {
    if (generatingRef.current) {
      alert('Please wait for the current generation to complete');
      return;
    }

    generatingRef.current = true;
    setIsGenerating(true);
    setShowGenerateModal(false);

    try {
      switch(type) {
        case 'quiz':
          await api.post(`/generation/${projectId}/quiz`, {
            numQuestions: options.numQuestions || 10,
            title: options.title
          });
          break;
        case 'flashcards':
          await api.post(`/generation/${projectId}/flashcards`, {
            numCards: options.numCards || 20,
            title: options.title
          });
          break;
        case 'summary':
          await api.post(`/generation/${projectId}/summary`, {
            title: options.title
          });
          break;
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert(error.response?.data?.error || 'Failed to generate content');
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('Delete this generated content?')) return;

    try {
      await api.delete(`/generation/${contentId}`);
      setGeneratedContent(generatedContent.filter(c => c.id !== contentId));
      if (viewingContent?.id === contentId) {
        setViewingContent(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete content');
    }
  };

  const handleDownload = (content) => {
    const dataStr = JSON.stringify(content.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${content.title}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (viewingContent) {
    return (
      <ContentViewer 
        content={viewingContent} 
        onBack={() => {
          setViewingContent(null);
          setExpandedView(false);
        }}
        onDelete={() => handleDelete(viewingContent.id)}
        onExpand={setExpandedView}
        expanded={expandedView}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent transition-colors">
      {/* Generate Buttons - Glassy style */}
      <div className="p-4 border-b border-slate-200/50 dark:border-white/10 space-y-3 flex-shrink-0 bg-white/40 dark:bg-[#1A1A1A]/40 backdrop-blur-xl">
        <button
          onClick={() => {
            if (!isGenerating) {
              setGenerateType('quiz');
              setShowGenerateModal(true);
            }
          }}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgb(0,0,0,0.03)] group"
        >
          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Generate Quiz</span>
        </button>

        <button
          onClick={() => {
            if (!isGenerating) {
              setGenerateType('flashcards');
              setShowGenerateModal(true);
            }
          }}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgb(0,0,0,0.03)] group"
        >
          <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Generate Flashcards</span>
        </button>

        <button
          onClick={() => {
            if (!isGenerating) {
              setGenerateType('summary');
              setShowGenerateModal(true);
            }
          }}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgb(0,0,0,0.03)] group"
        >
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Generate Summary</span>
        </button>
      </div>

      {/* Generated Content List */}
      <div className="flex-1 overflow-y-auto p-4 bg-transparent">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : generatedContent.length === 0 ? (
          <div className="text-center py-12 bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-sm mt-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60 dark:border-white/10">
              <Sparkles className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No content yet</p>
            <p className="text-sm text-slate-500 mt-1">Generate AI materials to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onView={() => setViewingContent(content)}
                onDelete={() => handleDelete(content.id)}
                onDownload={() => handleDownload(content)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generate Options Modal */}
      {showGenerateModal && !isGenerating && (
        <GenerateModal
          type={generateType}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={(options) => handleGenerate(generateType, options)}
        />
      )}
    </div>
  );
};

// Content Card Component
const ContentCard = ({ content, onView, onDelete }) => {
  const getTypeConfig = () => {
    switch(content.content_type) {
      case 'quiz': return { icon: BrainCircuit, color: '#6366f1' }; // Indigo
      case 'flashcards': return { icon: Layers, color: '#a855f7' }; // Purple
      case 'summary': return { icon: FileText, color: '#10b981' }; // Emerald
      default: return { icon: Sparkles, color: '#64748b' }; // Slate
    }
  };

  const { icon: Icon, color } = getTypeConfig();
  const glowStyle = {
    background: `radial-gradient(circle at top left, ${color}30 0%, transparent 70%)`
  };

  const getCount = () => {
    const data = content.data;
    if (content.content_type === 'quiz') return `${data.questions?.length || 0} items`;
    if (content.content_type === 'flashcards') return `${data.cards?.length || 0} cards`;
    return '';
  };
  const count = getCount();

  return (
    <div 
      onClick={onView}
      className="group relative bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen transition-opacity group-hover:opacity-100" style={glowStyle} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2.5 bg-white/80 dark:bg-white/10 rounded-xl border border-white/50 dark:border-white/5 shadow-sm">
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
              {content.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-1">
              {content.content_type}{count && ` • ${count}`}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Generate Modal Component (Glassy matching ProjectModal)
const GenerateModal = ({ type, onClose, onGenerate }) => {
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [numCards, setNumCards] = useState(20);

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = { title };
    if (type === 'quiz') options.numQuestions = numQuestions;
    if (type === 'flashcards') options.numCards = numCards;
    onGenerate(options);
  };

  const getTitle = () => {
    switch(type) {
      case 'quiz': return 'Generate Quiz';
      case 'flashcards': return 'Generate Flashcards';
      case 'summary': return 'Generate Summary';
      default: return 'Generate Content';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/60 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200/50 dark:border-white/5">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{getTitle()}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`}
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {type === 'quiz' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all outline-none text-slate-700 dark:text-slate-200"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          )}

          {type === 'flashcards' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Number of Cards
              </label>
              <select
                value={numCards}
                onChange={(e) => setNumCards(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all outline-none text-slate-700 dark:text-slate-200"
              >
                <option value={10}>10 Cards</option>
                <option value={20}>20 Cards</option>
                <option value={30}>30 Cards</option>
                <option value={50}>50 Cards</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContentViewer = ({ content, onBack, onDelete, onExpand, expanded }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const isQuiz = content.content_type === 'quiz';
  const isFlashcards = content.content_type === 'flashcards';
  const data = content.data;

  useEffect(() => {
    if (isQuiz && userAnswers.length === 0) {
      setUserAnswers(new Array(data.questions?.length || 0).fill(null));
    }
  }, [isQuiz, data.questions?.length]);

  const handleQuizAnswer = (answerIndex) => {
    if (!isChecked) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleQuizCheck = () => {
    if (selectedAnswer === null) return;
    setIsChecked(true);
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = selectedAnswer;
    setUserAnswers(newAnswers);
  };

  const handleQuizNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(userAnswers[currentIndex + 1]);
      setIsChecked(userAnswers[currentIndex + 1] !== null);
    } else {
      setShowResults(true);
    }
  };

  const handleQuizPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(userAnswers[currentIndex - 1]);
      setIsChecked(userAnswers[currentIndex - 1] !== null);
    }
  };

  const handleFlashcardNext = () => {
    if (currentIndex < data.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleFlashcardPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const renderQuizResults = () => {
    const score = userAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === data.questions[idx].correctAnswer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / data.questions.length) * 100);
    const incorrect = data.questions.length - score;

    return (
      <div className="h-full flex items-center justify-center p-8 bg-transparent">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center border border-white/60 dark:border-white/10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              <span className="text-3xl font-bold text-white">{percentage}%</span>
            </div>
            
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Quiz Complete!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              You scored {score} out of {data.questions.length}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{score}</div>
                <div className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">Correct</div>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-200/50 dark:border-rose-800/30">
                <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">{incorrect}</div>
                <div className="text-xs font-medium text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wider">Incorrect</div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setCurrentIndex(0);
                setUserAnswers(new Array(data.questions.length).fill(null));
                setSelectedAnswer(null);
                setIsChecked(false);
              }}
              className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 transition-all font-semibold text-sm shadow-md"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizContent = () => {
    if (showResults) return renderQuizResults();

    const question = data.questions[currentIndex];
    const progress = ((currentIndex + 1) / data.questions.length) * 100;
    const isCorrect = selectedAnswer === question.correctAnswer;

    return (
      <div className="h-full flex flex-col bg-transparent">
        {/* Progress */}
        <div className="p-5 border-b border-slate-200/50 dark:border-white/5 flex-shrink-0 bg-white/30 dark:bg-[#1A1A1A]/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Question {currentIndex + 1} of {data.questions.length}
            </span>
            <span className="text-xs text-slate-500 bg-white/50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-white/50 dark:border-white/5">
              {userAnswers.filter(a => a !== null).length} answered
            </span>
          </div>
          <div className="h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-8 leading-relaxed">
            {question.question}
          </h3>

          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              let bgColor = 'bg-white/60 dark:bg-[#1A1A1A]/40 hover:bg-white/90 dark:hover:bg-white/10';
              let borderColor = 'border-white/60 dark:border-white/10';
              let textColor = 'text-slate-700 dark:text-slate-300';
              
              if (isChecked) {
                if (index === question.correctAnswer) {
                  bgColor = 'bg-emerald-50/80 dark:bg-emerald-900/20';
                  borderColor = 'border-emerald-500/50 dark:border-emerald-500/50';
                  textColor = 'text-emerald-900 dark:text-emerald-300 font-medium';
                } else if (index === selectedAnswer && !isCorrect) {
                  bgColor = 'bg-rose-50/80 dark:bg-rose-900/20';
                  borderColor = 'border-rose-500/50 dark:border-rose-500/50';
                  textColor = 'text-rose-900 dark:text-rose-300 font-medium';
                }
              } else if (selectedAnswer === index) {
                bgColor = 'bg-indigo-50/80 dark:bg-indigo-900/20';
                borderColor = 'border-indigo-500/50 dark:border-indigo-500/50';
                textColor = 'text-indigo-900 dark:text-indigo-200 font-medium';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  disabled={isChecked}
                  className={`w-full text-left p-4 rounded-2xl border backdrop-blur-sm transition-all ${bgColor} ${borderColor} ${textColor} disabled:cursor-not-allowed flex items-center gap-3 shadow-sm`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                    isChecked && index === question.correctAnswer 
                      ? 'bg-emerald-500 text-white' 
                      : isChecked && index === selectedAnswer && !isCorrect
                      ? 'bg-rose-500 text-white'
                      : selectedAnswer === index
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-sm">{option}</span>
                  {isChecked && index === question.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  )}
                  {isChecked && index === selectedAnswer && !isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isChecked && (
            <div className={`p-5 rounded-2xl backdrop-blur-md ${
              isCorrect 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30' 
                : 'bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/50 dark:border-rose-800/30'
            }`}>
              <p className={`font-semibold text-sm mb-2 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <div className="text-sm text-slate-700 dark:text-slate-300 dark:[&_*]:!text-slate-300 leading-relaxed">
                <MarkdownRenderer content={question.explanation} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between flex-shrink-0 bg-white/30 dark:bg-[#1A1A1A]/20 backdrop-blur-md">
          <button
            onClick={handleQuizPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {!isChecked ? (
            <button
              onClick={handleQuizCheck}
              disabled={selectedAnswer === null}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all font-semibold text-sm shadow-md"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleQuizNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white rounded-full hover:scale-105 transition-all font-semibold text-sm shadow-md shadow-indigo-500/20"
            >
              {currentIndex === data.questions.length - 1 ? 'View Results' : 'Next Question'}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFlashcardsContent = () => {
    const card = data.cards[currentIndex];
    const progress = ((currentIndex + 1) / data.cards.length) * 100;

    return (
      <div className="h-full flex flex-col bg-transparent">
        <div className="p-5 border-b border-slate-200/50 dark:border-white/5 flex-shrink-0 bg-white/30 dark:bg-[#1A1A1A]/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Card {currentIndex + 1} of {data.cards.length}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative">
          <button
            onClick={handleFlashcardPrevious}
            disabled={currentIndex === 0}
            className="absolute left-6 w-12 h-12 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div 
            className="w-full max-w-lg cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <div 
              className="relative w-full h-[340px]"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 w-full h-full bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 flex flex-col items-center justify-center text-center border border-white/60 dark:border-white/10 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow"
                style={{ backfaceVisibility: 'hidden', overflow: 'hidden' }}
              >
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-4 uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-500/20">Question</div>
                <div className="flex-1 w-full overflow-y-auto px-2 flex flex-col items-center justify-center">
                  <div className="text-lg font-medium text-slate-800 dark:text-slate-100 dark:[&_*]:!text-slate-100 leading-relaxed">
                    <MarkdownRenderer content={card.front} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 flex-shrink-0 font-medium">Click card to reveal answer</p>
              </div>
              
              {/* Back */}
              <div 
                className="absolute inset-0 w-full h-full bg-purple-50/90 dark:bg-purple-900/20 backdrop-blur-2xl border-2 border-purple-200/50 dark:border-purple-500/30 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', overflow: 'hidden' }}
              >
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-4 uppercase tracking-widest bg-white/50 dark:bg-purple-500/20 px-3 py-1 rounded-full">Answer</div>
                <div className="flex-1 w-full overflow-y-auto px-2 flex flex-col items-center justify-center">
                  <div className="text-base font-medium text-slate-800 dark:text-slate-200 dark:[&_*]:!text-slate-200 leading-relaxed">
                    <MarkdownRenderer content={card.back} />
                  </div>
                </div>
                <p className="text-xs text-purple-400 dark:text-purple-400/70 mt-4 flex-shrink-0 font-medium">Click to flip back</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleFlashcardNext}
            disabled={currentIndex === data.cards.length - 1}
            className="absolute right-6 w-12 h-12 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderSummaryContent = () => {
    return (
      <div className="h-full overflow-y-auto p-6 bg-transparent">
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* TL;DR */}
          <div className="bg-blue-50/80 dark:bg-blue-900/10 backdrop-blur-md rounded-3xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-sm">
            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">TL;DR</h3>
            <div className="text-slate-800 dark:text-slate-200 dark:[&_*]:!text-slate-200 text-sm leading-relaxed">
              <MarkdownRenderer content={data.tldr} />
            </div>
          </div>

          {/* Key Points */}
          <div className="bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Key Takeaways
            </h3>
            <ul className="space-y-4">
              {data.keyPoints?.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold border border-slate-200/50 dark:border-white/5">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 dark:[&_*]:!text-slate-300 text-sm leading-relaxed pt-0.5">
                    <MarkdownRenderer content={point} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Notes */}
          <div className="bg-white/60 dark:bg-[#1A1A1A]/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Detailed Notes
            </h3>
            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none dark:[&_*]:!text-slate-300">
              <MarkdownRenderer content={data.detailedNotes} />
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="bg-emerald-50/80 dark:bg-emerald-900/10 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm">
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">Explain Like I'm 5</h3>
            <div className="text-slate-800 dark:text-slate-200 dark:[&_*]:!text-slate-200 text-sm leading-relaxed">
              <MarkdownRenderer content={data.simpleExplanation} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Expanded view using Portal
  if (expanded) {
    return createPortal(
      <div className="fixed inset-0 bg-slate-50/90 dark:bg-[#09090B]/90 backdrop-blur-2xl z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-[#1A1A1A]/40">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{content.title}</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize mt-0.5 flex items-center gap-2">
                <span className="bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded-md border border-white/50 dark:border-white/5">{content.content_type}</span>
                {new Date(content.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onExpand(false)} 
              className="w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300 shadow-sm"
              title="Minimize"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-transparent">
          {isQuiz ? renderQuizContent() : isFlashcards ? renderFlashcardsContent() : renderSummaryContent()}
        </div>
      </div>,
      document.body
    );
  }

  // Panel view
  return (
    <div className="h-full flex flex-col bg-white/30 dark:bg-[#1A1A1A]/30 backdrop-blur-xl border-l border-slate-200/50 dark:border-white/10">
      <div className="p-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white/40 dark:bg-[#1A1A1A]/40">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-300 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onExpand(true)} 
            className="p-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300 shadow-sm"
            title="Expand"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">{content.title}</h2>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize mt-1.5 inline-block bg-white/50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-white/50 dark:border-white/5">
          {content.content_type}
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {isQuiz ? renderQuizContent() : isFlashcards ? renderFlashcardsContent() : renderSummaryContent()}
      </div>
    </div>
  );
};

export default AIToolsTab;