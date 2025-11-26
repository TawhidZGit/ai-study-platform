import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2, TrendingUp } from 'lucide-react';

const Flashcards = () => {
  const { id, documentId } = useParams();
  const navigate = useNavigate();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [dueCards, setDueCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(!id);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFlashcardSet();
      fetchDueCards();
      fetchStats();
    } else if (documentId) {
      generateFlashcards();
    }
  }, [id, documentId]);

  const fetchFlashcardSet = async () => {
    try {
      const response = await api.get(`/flashcards/${id}`);
      setFlashcardSet(response.data.flashcardSet);
    } catch (error) {
      console.error('Error fetching flashcard set:', error);
      setError('Failed to load flashcard set');
    } finally {
      setLoading(false);
    }
  };

  const fetchDueCards = async () => {
    try {
      const response = await api.get(`/flashcards/${id}/due`);
      setDueCards(response.data.dueCards);
      if (response.data.dueCards.length === 0) {
        setShowStats(true);
      }
    } catch (error) {
      console.error('Error fetching due cards:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/flashcards/${id}/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateFlashcards = async () => {
    try {
      const response = await api.post(`/flashcards/generate/${documentId}`, {
        numCards: 20
      });
      setFlashcardSet(response.data.flashcardSet);
      navigate(`/flashcards/${response.data.flashcardSet.id}`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Failed to generate flashcards');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReview = async (difficulty) => {
    const currentCard = dueCards[currentCardIndex];
    
    try {
      await api.post(`/flashcards/${id}/review`, {
        cardIndex: currentCard.cardIndex,
        difficulty
      });

      if (currentCardIndex < dueCards.length - 1) {
        handleNext();
      } else {
        await fetchStats();
        setShowStats(true);
      }
    } catch (error) {
      console.error('Error recording review:', error);
      setError('Failed to record review');
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Generating flashcards with AI...</p>
          <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/documents')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  if (showStats || dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Documents
          </button>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {dueCards.length === 0 ? "You're all caught up!" : "Study Session Complete!"}
            </h1>
            
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total_cards}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.learning_cards}</div>
                  <div className="text-sm text-gray-600 mt-1">Learning</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.new_cards}</div>
                  <div className="text-sm text-gray-600 mt-1">New</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round(parseFloat(stats.avg_reviews) || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Avg Reviews</div>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/documents')}
              className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / dueCards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Documents
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{flashcardSet.filename}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Card {currentCardIndex + 1} of {dueCards.length}</span>
            <span>Reviewed: {currentCard.timesReviewed} times</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard Container */}
        <div className="relative mb-8" style={{ perspective: '1000px', minHeight: '400px' }}>
          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Flashcard */}
          <div 
            className="flashcard-container cursor-pointer"
            onClick={handleFlip}
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '400px'
            }}
          >
            {/* Front */}
            <div 
              className="flashcard-face bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: 'hidden',
                position: 'absolute',
                width: '100%',
                minHeight: '400px'
              }}
            >
              <div className="text-sm font-medium text-blue-600 mb-6 uppercase tracking-wide">Question</div>
              <p className="text-2xl text-gray-800 font-medium leading-relaxed mb-8">{currentCard.front}</p>
              <p className="text-sm text-gray-400 mt-auto">Click to reveal answer</p>
            </div>
            
            {/* Back */}
            <div 
              className="flashcard-face bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                position: 'absolute',
                width: '100%',
                minHeight: '400px'
              }}
            >
              <div className="text-sm font-medium text-blue-200 mb-6 uppercase tracking-wide">Answer</div>
              <p className="text-2xl text-white font-medium leading-relaxed mb-8">{currentCard.back}</p>
              <p className="text-sm text-blue-200 mt-auto">Click to flip back</p>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentCardIndex === dueCards.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Review Buttons */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-3 animate-fade-in">
            <button
              onClick={() => handleReview('again')}
              className="py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold shadow-md transition"
            >
              Again
              <div className="text-xs opacity-80 mt-1">1 day</div>
            </button>
            <button
              onClick={() => handleReview('hard')}
              className="py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-md transition"
            >
              Hard
              <div className="text-xs opacity-80 mt-1">2 days</div>
            </button>
            <button
              onClick={() => handleReview('good')}
              className="py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-md transition"
            >
              Good
              <div className="text-xs opacity-80 mt-1">4 days</div>
            </button>
            <button
              onClick={() => handleReview('easy')}
              className="py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md transition"
            >
              Easy
              <div className="text-xs opacity-80 mt-1">7 days</div>
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Click card to flip • Use arrow buttons to navigate</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Flashcards;