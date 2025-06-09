import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CulturalIdentitySelector from '@/features/auth/components/CulturalIdentitySelector'
import WelcomeTour from '@/features/auth/components/WelcomeTour'
import { useCultural } from '@/store'
import { useAuth } from '@/features/auth/hooks/useAuth'

type OnboardingStep = 'cultural-identity' | 'welcome-tour' | 'complete'

const CulturalOnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('cultural-identity')
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([])
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setCulturalIdentities } = useCultural()
  const { user } = useAuth()

  const handleCulturalIdentityComplete = () => {
    // Save cultural identities to store
    setCulturalIdentities(selectedIdentities)
    
    // Move to welcome tour
    setCurrentStep('welcome-tour')
  }

  const handleSkipCulturalIdentity = () => {
    // Move to welcome tour without setting identities
    setCurrentStep('welcome-tour')
  }

  const handleWelcomeTourComplete = () => {
    // Mark onboarding as complete and navigate to home
    setCurrentStep('complete')
    navigate('/')
  }

  const handleSkipWelcomeTour = () => {
    // Skip tour and go directly to home
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cultural-50 via-white to-ubuntu-50">
      {/* Progress Indicator */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cultural-500 to-ubuntu-500 rounded-full" />
                <h1 className="text-xl font-bold text-cultural-gradient">
                  {t('app.name')}
                </h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentStep === 'cultural-identity' ? 'bg-cultural-500' : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full ${
                  currentStep === 'welcome-tour' ? 'bg-cultural-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm text-gray-600 ml-2">
                  Welcome Setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {currentStep === 'cultural-identity' && (
          <CulturalIdentitySelector
            selectedIdentities={selectedIdentities}
            onSelectionChange={setSelectedIdentities}
            onContinue={handleCulturalIdentityComplete}
            onSkip={handleSkipCulturalIdentity}
          />
        )}

        {currentStep === 'welcome-tour' && (
          <WelcomeTour
            onComplete={handleWelcomeTourComplete}
            onSkip={handleSkipWelcomeTour}
            userCulturalIdentities={selectedIdentities}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-600">
        <p>Welcome to Ubuntu Connect, {user?.displayName || 'friend'}!</p>
        <p className="mt-1">
          Let's set up your cultural journey • Building bridges across cultures
        </p>
      </footer>
    </div>
  )
}

export default CulturalOnboardingPage
