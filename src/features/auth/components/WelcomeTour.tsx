import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  MapIcon, 
  UsersIcon, 
  AcademicCapIcon, 
  HandRaisedIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

interface WelcomeTourProps {
  onComplete: () => void
  onSkip: () => void
  userCulturalIdentities: string[]
}

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  culturalContext?: string
}

const WelcomeTour: React.FC<WelcomeTourProps> = ({
  onComplete,
  onSkip,
  userCulturalIdentities,
}) => {
  const { t } = useTranslation()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const tourSteps: TourStep[] = [
    {
      id: 'platform-overview',
      title: 'Welcome to Ubuntu Connect',
      description: 'A platform that celebrates South African cultural diversity while building bridges between communities.',
      icon: <HandRaisedIcon className="w-12 h-12 text-cultural-500" />,
      features: [
        'Connect with people from all 11 official language groups',
        'Share and learn about different cultural traditions',
        'Collaborate on projects that unite communities',
        'Respect and celebrate our Rainbow Nation heritage'
      ],
      culturalContext: userCulturalIdentities.length > 0 
        ? `We see you've selected ${userCulturalIdentities.length} cultural ${userCulturalIdentities.length === 1 ? 'identity' : 'identities'}. This will help us connect you with relevant communities and content.`
        : 'You can always add your cultural identities later to get personalized recommendations.'
    },
    {
      id: 'cultural-discovery',
      title: 'Discover Cultural Heritage',
      description: 'Explore the rich tapestry of South African cultures through interactive maps, stories, and traditions.',
      icon: <MapIcon className="w-12 h-12 text-ubuntu-500" />,
      features: [
        'Interactive cultural map of South Africa',
        'Traditional stories and historical content',
        'Language learning opportunities',
        'Cultural events and celebrations'
      ],
      culturalContext: 'Every culture has unique wisdom to share. Ubuntu Connect helps preserve and share this knowledge respectfully.'
    },
    {
      id: 'community-features',
      title: 'Join Diverse Communities',
      description: 'Find communities based on location, interests, or cultural background. Build meaningful cross-cultural connections.',
      icon: <UsersIcon className="w-12 h-12 text-cultural-500" />,
      features: [
        'Location-based community discovery',
        'Cross-cultural collaboration projects',
        'Skill sharing and mentorship',
        'Cultural exchange programs'
      ],
      culturalContext: 'Ubuntu philosophy teaches us "I am because we are." Together, we are stronger and more creative.'
    },
    {
      id: 'knowledge-exchange',
      title: 'Share Knowledge & Skills',
      description: 'Exchange skills, mentor others, and learn from diverse perspectives in our knowledge marketplace.',
      icon: <AcademicCapIcon className="w-12 h-12 text-ubuntu-500" />,
      features: [
        'Skill-based matching system',
        'Time banking for fair exchange',
        'Cultural context in learning',
        'Recognition and achievements'
      ],
      culturalContext: 'Every person has valuable knowledge. Ubuntu Connect helps you share your gifts and learn from others.'
    }
  ]

  const currentStep = tourSteps[currentStepIndex]
  const isLastStep = currentStepIndex === tourSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto" variant="cultural">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {currentStep.icon}
            <div>
              <CardTitle className="text-2xl text-cultural-gradient">
                {currentStep.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {currentStepIndex + 1} of {tourSteps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cultural-500 to-ubuntu-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / tourSteps.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              {currentStep.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cultural-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cultural Context */}
          {currentStep.culturalContext && (
            <div className="p-4 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
              <p className="text-ubuntu-800 text-sm">
                <span className="font-medium">Cultural Insight:</span> {currentStep.culturalContext}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={onSkip}
              >
                Skip Tour
              </Button>
              
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                >
                  Previous
                </Button>
              )}
            </div>

            <Button
              variant="cultural"
              size="lg"
              onClick={handleNext}
              rightIcon={!isLastStep ? <ArrowRightIcon className="w-4 h-4" /> : undefined}
            >
              {isLastStep ? 'Start Your Journey' : 'Next'}
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 pt-4">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentStepIndex
                    ? 'bg-cultural-500'
                    : index < currentStepIndex
                    ? 'bg-ubuntu-400'
                    : 'bg-gray-300'
                }`}
                onClick={() => setCurrentStepIndex(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WelcomeTour
