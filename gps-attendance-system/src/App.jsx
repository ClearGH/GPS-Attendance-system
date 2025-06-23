import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Components
import LoginPage from './components/LoginPage'
import StudentDashboard from './components/StudentDashboard'
import InstructorDashboard from './components/InstructorDashboard'
import AdminDashboard from './components/AdminDashboard'
import CheckInPage from './components/CheckInPage'

// Context for authentication
import { AuthProvider, useAuth } from './hooks/useAuth'

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Main App Component
function AppContent() {
  const { user } = useAuth()
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <LoginPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                {user?.role === 'student' && <StudentDashboard />}
                {user?.role === 'instructor' && <InstructorDashboard />}
                {user?.role === 'admin' && <AdminDashboard />}
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/checkin" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CheckInPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

