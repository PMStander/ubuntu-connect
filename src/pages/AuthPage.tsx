import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RegistrationForm from '@/features/auth/components/RegistrationForm'
import LoginForm from '@/features/auth/components/LoginForm'
import LanguageSelector from '@/components/LanguageSelector'

type AuthMode = 'login' | 'register'

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('register')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleAuthSuccess = () => {
    // Navigate to cultural onboarding for new users, or home for returning users
    if (mode === 'register') {
      navigate('/onboarding/cultural')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cultural-50 via-white to-ubuntu-50 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cultural-500 to-ubuntu-500 rounded-full" />
          <h1 className="text-xl font-bold text-cultural-gradient">
            {t('app.name')}
          </h1>
        </div>
        <LanguageSelector />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {mode === 'register' ? (
            <RegistrationForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          ) : (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setMode('register')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-600">
        <p>{t('app.tagline')}</p>
        <p className="mt-1">
          Building bridges across cultures • Celebrating diversity • Ubuntu philosophy
        </p>
      </footer>

      {/* reCAPTCHA container for phone authentication */}
      <div id="recaptcha-container" />
    </div>
  )
}

export default AuthPage
