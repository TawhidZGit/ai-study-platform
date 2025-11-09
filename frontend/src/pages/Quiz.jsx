import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';

const Quiz = () => {
  const { id, documentId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(!id); // If no ID, we're generating
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
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
      setAnswers(new Array(response.data.quiz.questions.length).fill(null));
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
      setAnswers(new Array(response.data.quiz.questions.length).fill(null));
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      if (!confirm('You haven\'t answered all questions. Submit anyway?')) {
        return;
      }
    }

    try {
      const response = await api.post(`/quizzes/${quiz.id}/submit`, { answers });
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating quiz with AI...</p>
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

  if (showResults) {
    return <QuizResults results={results} quiz={quiz} navigate={navigate} />;
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.filename}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{answers.filter(a => a !== null).length} answered</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[currentQuestion] === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const QuizResults = ({ results, quiz, navigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {results.percentage}%
          </div>
          <p className="text-gray-600 text-lg">
            {results.score} out of {results.totalQuestions} correct
          </p>
          <button
            onClick={() => navigate('/documents')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Documents
          </button>
        </div>

        {/* Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Review Answers</h2>
          
          {results.results.map((result, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                result.isCorrect ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {result.isCorrect ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Question {index + 1}: {result.question}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Your answer: </span>
                      <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {quiz.questions[index].options[result.userAnswer]}
                      </span>
                    </p>
                    {!result.isCorrect && (
                      <p>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">
                          {quiz.questions[index].options[result.correctAnswer]}
                        </span>
                      </p>
                    )}
                    <p className="text-gray-600 mt-3">
                      <span className="font-medium">Explanation: </span>
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;