import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider }         from './context/ThemeContext';
import { LoadingPage }           from './components/UI';
import { Layout }                from './components/Layout';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Projects       from './pages/Projects';
import ProjectDetail  from './pages/ProjectDetail';
import Tasks          from './pages/Tasks';
import Profile        from './pages/Profile';

// ── Protected Route ───────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user)   return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

// ── Public Route (redirect if logged in) ──
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
};

// ── App Routes ────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={
      <PublicRoute><Login /></PublicRoute>
    } />
    <Route path="/register" element={
      <PublicRoute><Register /></PublicRoute>
    } />

    {/* Protected */}
    <Route path="/dashboard" element={
      <ProtectedRoute><Dashboard /></ProtectedRoute>
    } />
    <Route path="/projects" element={
      <ProtectedRoute><Projects /></ProtectedRoute>
    } />
    <Route path="/projects/:id" element={
      <ProtectedRoute><ProjectDetail /></ProtectedRoute>
    } />
    <Route path="/tasks" element={
      <ProtectedRoute><Tasks /></ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute><Profile /></ProtectedRoute>
    } />

    {/* Default Redirect */}
    <Route path="/"  element={<Navigate to="/dashboard" replace />} />
    <Route path="*"  element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

// ── Root App ──────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color:      '#f9fafb',
                fontSize:   '14px',
              },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}