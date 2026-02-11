import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import GapAnalysis from './pages/GapAnalysis';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import MockInterview from './pages/MockInterview';
import CareerRoadmap from './pages/CareerRoadmap';
import AIChat from './pages/AIChat';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/assessment"
        element={
          <PrivateRoute>
            <Layout>
              <Assessment />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/gap-analysis"
        element={
          <PrivateRoute>
            <Layout>
              <GapAnalysis />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <PrivateRoute>
            <Layout>
              <Recommendations />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* AI-Powered Features */}
      <Route
        path="/resume-analyzer"
        element={
          <PrivateRoute>
            <Layout>
              <ResumeAnalyzer />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/mock-interview"
        element={
          <PrivateRoute>
            <Layout>
              <MockInterview />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/career-roadmap"
        element={
          <PrivateRoute>
            <Layout>
              <CareerRoadmap />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <PrivateRoute>
            <Layout>
              <AIChat />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <PrivateRoute>
            <Layout>
              <Explore />
            </Layout>
          </PrivateRoute>
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
