import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

const HomePage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout, userDisplayName } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cultural-50 via-white to-ubuntu-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cultural-500 to-ubuntu-500 rounded-full" />
              <h1 className="text-xl font-bold text-cultural-gradient">
                {t('app.name')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {userDisplayName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Ubuntu Connect
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('app.tagline')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="cultural" hover>
              <CardHeader>
                <CardTitle>Cultural Heritage</CardTitle>
                <CardDescription>
                  Document and preserve South African cultural heritage for future generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/cultural-knowledge')}
                >
                  Explore Heritage
                </Button>
              </CardContent>
            </Card>

            <Card variant="cultural" hover>
              <CardHeader>
                <CardTitle>Knowledge Sharing</CardTitle>
                <CardDescription>
                  Share skills and learn from mentors across cultural boundaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/cultural-knowledge')}
                >
                  Share & Learn
                </Button>
              </CardContent>
            </Card>

            <Card variant="cultural" hover>
              <CardHeader>
                <CardTitle>Content Discovery</CardTitle>
                <CardDescription>
                  Discover personalized cultural content and trending topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/cultural-knowledge')}
                >
                  Discover Content
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User Profile Summary */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Complete your profile to get the most out of Ubuntu Connect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Verification</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    user?.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cultural Profile</span>
                  <Button variant="outline" size="sm">
                    Complete Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default HomePage
