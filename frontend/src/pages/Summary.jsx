import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';

const Summary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      setDocument(response.data.document);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await api.post(`/documents/${id}/summary`);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setError(error.response?.data?.error || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/documents')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Documents
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{document.filename}</h1>
            <p className="text-sm text-gray-500">
              Uploaded {new Date(document.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {!summary && !generating && (
          <button
            onClick={generateSummary}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Generate AI Summary & Notes
          </button>
        )}

        {generating && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Generating summary with AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Summary Display */}
      {summary && (
        <div className="space-y-6">
          {/* TL;DR */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">TL;DR</h2>
            <p className="text-gray-700 leading-relaxed">{summary.tldr}</p>
          </div>

          {/* Key Points */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Key Points</h2>
            <ul className="space-y-2">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Notes</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {summary.detailedNotes}
              </p>
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Simple Explanation (ELI5)
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary.simpleExplanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;