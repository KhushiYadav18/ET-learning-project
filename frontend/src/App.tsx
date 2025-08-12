import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import LearningModule from './pages/LearningModule';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  // Initialize analytics tracking
  useEffect(() => {
    // Track initial page view
    if (window.analytics) {
      window.analytics.trackPageView(window.location.href);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AnalyticsProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route 
                  path="/learn/:courseId/:moduleId" 
                  element={
                    <PrivateRoute>
                      <LearningModule />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <PrivateRoute>
                      <Analytics />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </AnalyticsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
