import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from './components/common/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestions from './pages/AdminQuestions';
import AdminQuestionEditor from './pages/AdminQuestionEditor';
import LearnerDashboard from './pages/LearnerDashboard';
import CodeWorkspace from './pages/CodeWorkspace';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <Loader size="lg" text="Loading..." fullScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPassword />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/questions"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminQuestions />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/questions/:id"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminQuestionEditor />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Learner Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <LearnerDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/workspace/:questionId"
          element={
            isAuthenticated ? (
              <CodeWorkspace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch All */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
