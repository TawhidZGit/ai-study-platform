import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const Quiz = () => {
  const { id, documentId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(!id);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchQuiz();
    } else if (documentId) {
      generateQuiz();
    }
  }, [id, documentId]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      setQuiz(response.data.quiz);
      setUserAnswers(new Array(response.data.quiz.questions.length).fill(null));
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      const response = await api.post(`/quizzes/generate/${documentId}`, {
        numQuestions: 10
      });
      setQuiz(response.data.quiz);
      setUserAnswers(new Array(response.data.quiz.questions.length).fill(null));
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!isChecked) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    
    setIsChecked(true);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1]);
      setIsChecked(userAnswers[currentQuestion + 1] !== null);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1]);
      setIsChecked(userAnswers[currentQuestion - 1] !== null);
    }
  };

  const submitQuiz = async () => {
    try {
      await api.post(`/quizzes/${quiz.id}/submit`, { answers: userAnswers });
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Generating quiz with AI...</p>
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
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = userAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === quiz.questions[idx].correctAnswer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-800 mb-2">{percentage}%</h1>
            <p className="text-xl text-gray-600 mb-8">
              You got {score} out of {quiz.questions.length} questions correct!
            </p>
            <button
              onClick={() => navigate('/documents')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Documents
        </button>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{quiz.filename}</h1>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-6">
            {question.options.map((option, index) => {
              let bgColor = 'bg-white hover:bg-gray-50';
              let borderColor = 'border-gray-300';
              let textColor = 'text-gray-800';
              
              if (isChecked) {
                if (index === question.correctAnswer) {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-500';
                  textColor = 'text-green-900';
                } else if (index === selectedAnswer && !isCorrect) {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-500';
                  textColor = 'text-red-900';
                }
              } else if (selectedAnswer === index) {
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-500';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isChecked}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${bgColor} ${borderColor} ${textColor} disabled:cursor-not-allowed flex items-center gap-3`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm ${
                    isChecked && index === question.correctAnswer 
                      ? 'bg-green-500 text-white border-green-500' 
                      : isChecked && index === selectedAnswer && !isCorrect
                      ? 'bg-red-500 text-white border-red-500'
                      : selectedAnswer === index
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {isChecked && index === question.correctAnswer && (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  )}
                  {isChecked && index === selectedAnswer && !isCorrect && (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isChecked && (
            <div className={`p-5 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <p className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous
          </button>

          {!isChecked ? (
            <button
              onClick={handleCheck}
              disabled={selectedAnswer === null}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md"
            >
              {currentQuestion === quiz.questions.length - 1 ? 'View Results' : 'Next Question'}
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;