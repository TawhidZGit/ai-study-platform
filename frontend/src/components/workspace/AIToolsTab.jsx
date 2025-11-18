import { useState, useEffect } from 'react';
import { 
  Sparkles, BookOpen, GraduationCap, FileText, 
  Loader2, Trash2, Download, Eye, X 
} from 'lucide-react';
import api from '../../utils/api';

const AIToolsTab = ({ projectId }) => {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingContent, setViewingContent] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateType, setGenerateType] = useState(null);

  useEffect(() => {
    fetchGeneratedContent();
  }, [projectId]);

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
    setGenerating(true);
    setShowGenerateModal(false);

    try {
      let response;
      
      switch(type) {
        case 'quiz':
          response = await api.post(`/generation/${projectId}/quiz`, {
            numQuestions: options.numQuestions || 10,
            title: options.title
          });
          break;
        case 'flashcards':
          response = await api.post(`/generation/${projectId}/flashcards`, {
            numCards: options.numCards || 20,
            title: options.title
          });
          break;
        case 'summary':
          response = await api.post(`/generation/${projectId}/summary`, {
            title: options.title
          });
          break;
      }

      await fetchGeneratedContent();
      setViewingContent(response.data.content);
    } catch (error) {
      console.error('Generate error:', error);
      alert(error.response?.data?.error || 'Failed to generate content');
    } finally {
      setGenerating(false);
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

  // If viewing specific content
  if (viewingContent) {
    return (
      <ContentViewer 
        content={viewingContent} 
        onBack={() => setViewingContent(null)}
        onDelete={() => handleDelete(viewingContent.id)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Generate Buttons */}
      <div className="p-4 border-b space-y-2 flex-shrink-0">
        <button
          onClick={() => {
            setGenerateType('quiz');
            setShowGenerateModal(true);
          }}
          disabled={generating}
          className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <BookOpen className="h-5 w-5" />
          <span className="font-medium">Generate Quiz</span>
        </button>

        <button
          onClick={() => {
            setGenerateType('flashcards');
            setShowGenerateModal(true);
          }}
          disabled={generating}
          className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          <GraduationCap className="h-5 w-5" />
          <span className="font-medium">Generate Flashcards</span>
        </button>

        <button
          onClick={() => {
            setGenerateType('summary');
            setShowGenerateModal(true);
          }}
          disabled={generating}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium">Generate Summary</span>
        </button>

        {generating && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating with AI...
          </div>
        )}
      </div>

      {/* Generated Content List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : generatedContent.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No generated content yet</p>
            <p className="text-xs mt-2">Upload sources and generate content!</p>
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
      {showGenerateModal && (
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
const ContentCard = ({ content, onView, onDelete, onDownload }) => {
  const getIcon = () => {
    switch(content.content_type) {
      case 'quiz': return <BookOpen className="h-5 w-5 text-green-600" />;
      case 'flashcards': return <GraduationCap className="h-5 w-5 text-purple-600" />;
      case 'summary': return <FileText className="h-5 w-5 text-blue-600" />;
      default: return <Sparkles className="h-5 w-5 text-gray-600" />;
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

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-800 truncate">
              {content.title}
            </h3>
            <p className="text-xs text-gray-500 capitalize">
              {content.content_type} • {getCount()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onView}
          className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center gap-1"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
        <button
          onClick={onDownload}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
          title="Download JSON"
        >
          <Download className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Number of Questions (Quiz only) */}
          {type === 'quiz' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          )}

          {/* Number of Cards (Flashcards only) */}
          {type === 'flashcards' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cards
              </label>
              <select
                value={numCards}
                onChange={(e) => setNumCards(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Content Viewer Component
const ContentViewer = ({ content, onBack, onDelete }) => {
  const renderContent = () => {
    const data = content.data;

    if (content.content_type === 'quiz') {
      return (
        <div className="space-y-6">
          {data.questions?.map((q, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                {index + 1}. {q.question}
              </h3>
              <div className="space-y-2 mb-3">
                {q.options?.map((option, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded ${
                      i === q.correctAnswer
                        ? 'bg-green-100 border border-green-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (content.content_type === 'flashcards') {
      return (
        <div className="space-y-4">
          {data.cards?.map((card, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 p-4 border-b">
                <div className="text-xs text-gray-500 mb-1">Front</div>
                <div className="font-semibold text-gray-800">{card.front}</div>
              </div>
              <div className="bg-white p-4">
                <div className="text-xs text-gray-500 mb-1">Back</div>
                <div className="text-gray-700">{card.back}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (content.content_type === 'summary') {
      return (
        <div className="space-y-6">
          {/* TL;DR */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">TL;DR</h3>
            <p className="text-gray-800">{data.tldr}</p>
          </div>

          {/* Key Points */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Points</h3>
            <ul className="space-y-2">
              {data.keyPoints?.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detailed Notes</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{data.detailedNotes}</p>
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Simple Explanation (ELI5)</h3>
            <p className="text-gray-800">{data.simpleExplanation}</p>
          </div>
        </div>
      );
    }

    return <div>Unknown content type</div>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <X className="h-5 w-5" />
          <span className="font-medium">Close</span>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Title */}
      <div className="px-4 pt-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">{content.title}</h2>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          {content.content_type} • {new Date(content.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AIToolsTab;