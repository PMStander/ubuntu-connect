import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy load components for better performance
const AuthPage = React.lazy(() => import('@/pages/AuthPage'))
const HomePage = React.lazy(() => import('@/pages/HomePage'))
const CulturalOnboardingPage = React.lazy(() => import('@/pages/CulturalOnboardingPage'))
const CulturalKnowledgePage = React.lazy(() => import('@/pages/CulturalKnowledgePage'))
const KnowledgeExchangePage = React.lazy(() => import('@/pages/KnowledgeExchangePage'))
const CrossCulturalCollaborationPage = React.lazy(() => import('@/pages/CrossCulturalCollaborationPage'))
const AchievementShowcasePage = React.lazy(() => import('@/pages/AchievementShowcasePage'))

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const { i18n } = useTranslation()

  // Set document language for accessibility
  React.useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/auth"
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/onboarding/cultural"
                element={
                  <ProtectedRoute>
                    <CulturalOnboardingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cultural-knowledge"
                element={
                  <ProtectedRoute>
                    <CulturalKnowledgePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/knowledge-exchange"
                element={
                  <ProtectedRoute>
                    <KnowledgeExchangePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cross-cultural-collaboration"
                element={
                  <ProtectedRoute>
                    <CrossCulturalCollaborationPage userId="current-user-id" />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/achievement-showcase"
                element={
                  <ProtectedRoute>
                    <AchievementShowcasePage userId="current-user-id" userRole="community_member" />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
