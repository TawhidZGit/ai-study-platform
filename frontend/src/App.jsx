import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Summary from './pages/Summary';
import Quiz from './pages/Quiz';
import Flashcards from './pages/Flashcards';
import Progress from './pages/Progress';



const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documents" 
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documents/:id/summary" 
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route 
            path="/documents/:documentId/quiz" 
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documents/:documentId/flashcards" 
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/flashcards/:id" 
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;