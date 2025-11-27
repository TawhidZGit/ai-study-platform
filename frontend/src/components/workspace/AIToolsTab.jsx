import MarkdownRenderer from '../MarkdownRenderer';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, BrainCircuit, Layers, FileText, 
  Loader2, Trash2, Download, Eye, X, Maximize2, Minimize2, 
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  ChevronLeft, ChevronRight 
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

  // FIX: Robust listener for generation completion
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
      // Fetch handled by useEffect on isGenerating change
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
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 transition-colors">
      {/* Generate Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 space-y-2 flex-shrink-0 bg-white dark:bg-slate-900">
        <button
          onClick={() => {
            if (!isGenerating) {
              setGenerateType('quiz');
              setShowGenerateModal(true);
            }
          }}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#A167A5] text-white rounded-xl hover:bg-[#854F89] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <BrainCircuit className="h-5 w-5" />
          <span>Generate Quiz</span>
        </button>

        <button
          onClick={() => {
            if (!isGenerating) {
              setGenerateType('flashcards');
              setShowGenerateModal(true);
            }
          }}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 px-4 py-3 bg-violet-700 text-white rounded-xl hover:bg-violet-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Layers className="h-5 w-5" />
          <span>Generate Flashcards</span>
        </button>

        <button
          onClick={() => {
            if (!isGenerating) {
              setGenerateType('summary');
              setShowGenerateModal(true);
            }
          }}
          disabled={isGenerating}
          className="w-full flex items-center gap-3 px-4 py-3 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <FileText className="h-5 w-5" />
          <span>Generate Summary</span>
        </button>
      </div>

      {/* Generated Content List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-950">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-slate-500" />
          </div>
        ) : generatedContent.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-slate-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-slate-700" />
            <p className="text-sm font-medium">No generated content yet</p>
            <p className="text-xs mt-1">Upload sources and generate content!</p>
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
  const getIcon = () => {
    switch(content.content_type) {
      case 'quiz': return <BrainCircuit className="h-5 w-5 text-[#A167A5] dark:text-[#dcb0df]" />;
      case 'flashcards': return <Layers className="h-5 w-5 text-violet-800 dark:text-violet-400" />;
      case 'summary': return <FileText className="h-5 w-5 text-purple-800 dark:text-purple-400" />;
      default: return <Sparkles className="h-5 w-5 text-gray-600 dark:text-slate-400" />;
    }
  };

  const getCount = () => {
    const data = content.data;
    if (content.content_type === 'quiz') {
      return `${data.questions?.length || 0} questions`;
    } else if (content.content_type === 'flashcards') {
      return `${data.cards?.length || 0} cards`;
    }
    return '';
  };
  const count = getCount();

  return (
    <div 
      onClick={onView}
      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 hover:border-blue-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group cursor-pointer relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-medium text-sm text-gray-800 dark:text-slate-200 truncate">
              {content.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 capitalize mt-0.5">
              {content.content_type}{count && ` • ${count}`}
            </p>
          </div>
        </div>

        {/* Trash Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Generate Modal Component
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
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none text-gray-900 dark:text-slate-100 font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          {type === 'quiz' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none text-gray-900 dark:text-slate-100 font-medium"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Number of Cards
              </label>
              <select
                value={numCards}
                onChange={(e) => setNumCards(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none text-gray-900 dark:text-slate-100 font-medium"
              >
                <option value={10}>10 Cards</option>
                <option value={20}>20 Cards</option>
                <option value={30}>30 Cards</option>
                <option value={50}>50 Cards</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2.5 font-medium rounded-xl transition shadow-lg shadow-blue-500/20"
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
      <div className="h-full flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">{percentage}%</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8">
              You scored {score} out of {data.questions.length}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/30">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{score}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Correct</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-900/30">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{incorrect}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Incorrect</div>
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
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg transition font-medium"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizContent = () => {
    if (showResults) {
      return renderQuizResults();
    }

    const question = data.questions[currentIndex];
    const progress = ((currentIndex + 1) / data.questions.length) * 100;
    const isCorrect = selectedAnswer === question.correctAnswer;

    return (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900">
        {/* Progress */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
              Question {currentIndex + 1} of {data.questions.length}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-500">
              {userAnswers.filter(a => a !== null).length} answered
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-6 leading-relaxed">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              let bgColor = 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700';
              let borderColor = 'border-gray-300 dark:border-slate-700';
              let textColor = 'text-gray-800 dark:text-slate-200';
              
              if (isChecked) {
                if (index === question.correctAnswer) {
                  bgColor = 'bg-green-50 dark:bg-green-900/20';
                  borderColor = 'border-green-500 dark:border-green-600';
                  textColor = 'text-green-900 dark:text-green-300';
                } else if (index === selectedAnswer && !isCorrect) {
                  bgColor = 'bg-red-50 dark:bg-red-900/20';
                  borderColor = 'border-red-500 dark:border-red-600';
                  textColor = 'text-red-900 dark:text-red-300';
                }
              } else if (selectedAnswer === index) {
                bgColor = 'bg-indigo-50 dark:bg-indigo-900/20';
                borderColor = 'border-indigo-500 dark:border-indigo-500';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  disabled={isChecked}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${bgColor} ${borderColor} ${textColor} disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center font-semibold text-xs ${
                    isChecked && index === question.correctAnswer 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isChecked && index === selectedAnswer && !isCorrect
                      ? 'bg-red-500 border-red-500 text-white'
                      : selectedAnswer === index
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-sm">{option}</span>
                  {isChecked && index === question.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  )}
                  {isChecked && index === selectedAnswer && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isChecked && (
            <div className={`p-4 rounded-lg ${
              isCorrect 
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-900/30' 
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/30'
            }`}>
              <p className={`font-bold text-sm mb-2 ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <div className="text-sm text-gray-700 dark:text-slate-300 dark:[&_*]:!text-slate-300">
                <MarkdownRenderer content={question.explanation} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            onClick={handleQuizPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm text-gray-700 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {!isChecked ? (
            <button
              onClick={handleQuizCheck}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleQuizNext}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-lg transition font-medium text-sm"
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
      <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950">
        {/* Progress */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
              Card {currentIndex + 1} of {data.cards.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <button
            onClick={handleFlashcardPrevious}
            disabled={currentIndex === 0}
            className="absolute left-4 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition z-10 text-gray-600 dark:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div 
            className="w-full max-w-lg cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <div 
              className="relative w-full h-[300px]"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-slate-700"
                style={{
                  backfaceVisibility: 'hidden',
                  overflow: 'hidden'
                }}
              >
                <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wide flex-shrink-0">Question</div>
                
                <div className="flex-1 w-full overflow-y-auto px-2">
                  <div className="min-h-full flex flex-col items-center justify-center">
                    <div className="text-base font-medium text-gray-800 dark:text-slate-100 dark:[&_*]:!text-slate-100 leading-relaxed text-center">
                      <MarkdownRenderer content={card.front} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 flex-shrink-0">Click to reveal answer</p>
              </div>
              
              {/* Back */}
              <div 
                className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900/30 rounded-xl shadow-xl p-6 flex flex-col items-center justify-center text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  overflow: 'hidden'
                }}
              >
                <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wide flex-shrink-0">Answer</div>
                
                <div className="flex-1 w-full overflow-y-auto px-2">
                  <div className="min-h-full flex flex-col items-center justify-center">
                    <div className="text-base font-medium text-gray-800 dark:text-slate-300 dark:[&_*]:!text-slate-300 leading-relaxed text-center">
                      <MarkdownRenderer content={card.back} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 flex-shrink-0">Click to flip back</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleFlashcardNext}
            disabled={currentIndex === data.cards.length - 1}
            className="absolute right-4 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition z-10 text-gray-600 dark:text-slate-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Hint */}
        <div className="p-4 text-center text-xs text-gray-500 dark:text-slate-500 flex-shrink-0">
          Click card to flip • Use arrows to navigate
        </div>
      </div>
    );
  };

  const renderSummaryContent = () => {
    return (
      <div className="h-full overflow-y-auto p-4 bg-white dark:bg-slate-900">
        <div className="space-y-6">
          {/* TL;DR */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-blue-300 mb-2">TL;DR</h3>
            <div className="text-gray-800 dark:text-slate-200 dark:[&_*]:!text-slate-200">
              <MarkdownRenderer content={data.tldr} />
            </div>
          </div>

          {/* Key Points */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Key Points</h3>
            <ul className="space-y-2">
              {data.keyPoints?.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-slate-300 dark:[&_*]:!text-slate-300 pt-0.5 text-sm">
                    <MarkdownRenderer content={point} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Detailed Notes</h3>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 dark:[&_*]:!text-slate-300 dark:prose-invert">
              <MarkdownRenderer content={data.detailedNotes} />
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/30">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-green-300 mb-2">Simple Explanation (ELI5)</h3>
            <div className="text-gray-800 dark:text-slate-200 dark:[&_*]:!text-slate-200">
              <MarkdownRenderer content={data.simpleExplanation} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Expanded view using Portal to fix z-index header issue
  if (expanded) {
    return createPortal(
      <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
              <X className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{content.title}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">
                {content.content_type} • {new Date(content.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onExpand(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition" title="Minimize">
              <Minimize2 className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            </button>
            <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-950">
          {isQuiz ? renderQuizContent() : isFlashcards ? renderFlashcardsContent() : renderSummaryContent()}
        </div>
      </div>,
      document.body
    );
  }

  // Panel view
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition font-medium">
          <X className="h-5 w-5" />
          <span className="text-sm">Close</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onExpand(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-slate-400" title="Expand">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 truncate">{content.title}</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 capitalize mt-0.5">
          {content.content_type}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isQuiz ? renderQuizContent() : isFlashcards ? renderFlashcardsContent() : renderSummaryContent()}
      </div>
    </div>
  );
};

export default AIToolsTab;