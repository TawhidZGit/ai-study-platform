import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Loader2, RotateCw, TrendingUp } from 'lucide-react';

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
      
      // Redirect to the study page
      navigate(`/flashcards/${response.data.flashcardSet.id}`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Failed to generate flashcards');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleReview = async (difficulty) => {
    const currentCard = dueCards[currentCardIndex];
    
    try {
      await api.post(`/flashcards/${id}/review`, {
        cardIndex: currentCard.cardIndex,
        difficulty
      });

      // Move to next card
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // Finished all cards
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating flashcards with AI...</p>
          <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
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
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Card {currentCardIndex + 1} of {dueCards.length}</span>
            <span>Reviewed: {currentCard.timesReviewed} times</span>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div 
          className="relative h-96 mb-6 cursor-pointer perspective"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
            {/* Front */}
            <div className="flashcard-face flashcard-front">
              <div className="bg-white rounded-lg shadow-xl p-8 h-full flex flex-col items-center justify-center">
                <p className="text-xl text-gray-800 text-center">{currentCard.front}</p>
                <p className="text-sm text-gray-500 mt-6">Click to reveal answer</p>
              </div>
            </div>
            
            {/* Back */}
            <div className="flashcard-face flashcard-back">
              <div className="bg-blue-600 rounded-lg shadow-xl p-8 h-full flex flex-col items-center justify-center">
                <p className="text-xl text-white text-center">{currentCard.back}</p>
                <p className="text-sm text-blue-200 mt-6">Click to flip back</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review Buttons */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('again'); }}
              className="py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Again<br/>
              <span className="text-xs">1 day</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('hard'); }}
              className="py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              Hard<br/>
              <span className="text-xs">2 days</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('good'); }}
              className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Good<br/>
              <span className="text-xs">4 days</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReview('easy'); }}
              className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Easy<br/>
              <span className="text-xs">7 days</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        
        .flashcard {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flashcard.flipped {
          transform: rotateY(180deg);
        }
        
        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }
        
        .flashcard-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;