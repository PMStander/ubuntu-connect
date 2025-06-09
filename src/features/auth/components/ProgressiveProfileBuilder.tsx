import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  UserIcon, 
  MapPinIcon, 
  CameraIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import BasicInfoStep from './profile-steps/BasicInfoStep'
import LocationStep from './profile-steps/LocationStep'
import ProfileImageStep from './profile-steps/ProfileImageStep'
import SkillsInterestsStep from './profile-steps/SkillsInterestsStep'
import PrivacyControlsStep from './profile-steps/PrivacyControlsStep'
import { clsx } from 'clsx'

interface ProfileData {
  bio: string
  location: {
    province: string
    city: string
    shareLocation: boolean
    precision: 'exact' | 'city' | 'province'
  }
  profileImage: string | null
  skills: {
    name: string
    level: 'beginner' | 'intermediate' | 'expert'
    culturalContext?: string
  }[]
  interests: string[]
  privacy: {
    profileVisibility: 'public' | 'communities' | 'private'
    culturalIdentityVisible: boolean
    skillsVisible: boolean
    locationSharing: boolean
    analyticsOptIn: boolean
  }
}

interface ProgressiveProfileBuilderProps {
  onComplete: (data: ProfileData) => void
  onSave: (data: Partial<ProfileData>) => void
  initialData?: Partial<ProfileData>
}

type ProfileStep = 'basic-info' | 'location' | 'profile-image' | 'skills-interests' | 'privacy-controls'

const profileSteps: {
  id: ProfileStep
  title: string
  description: string
  icon: React.ReactNode
  required: boolean
}[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about yourself and your cultural background',
    icon: <UserIcon className="w-6 h-6" />,
    required: false,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Share your location to connect with nearby communities',
    icon: <MapPinIcon className="w-6 h-6" />,
    required: false,
  },
  {
    id: 'profile-image',
    title: 'Profile Image',
    description: 'Add a profile picture to personalize your account',
    icon: <CameraIcon className="w-6 h-6" />,
    required: false,
  },
  {
    id: 'skills-interests',
    title: 'Skills & Interests',
    description: 'Share your skills and interests for better matching',
    icon: <AcademicCapIcon className="w-6 h-6" />,
    required: false,
  },
  {
    id: 'privacy-controls',
    title: 'Privacy Settings',
    description: 'Control who can see your information',
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    required: true,
  },
]

const ProgressiveProfileBuilder: React.FC<ProgressiveProfileBuilderProps> = ({
  onComplete,
  onSave,
  initialData = {},
}) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState<ProfileStep>('basic-info')
  const [profileData, setProfileData] = useState<Partial<ProfileData>>(initialData)
  const [completedSteps, setCompletedSteps] = useState<Set<ProfileStep>>(new Set())

  const currentStepIndex = profileSteps.findIndex(step => step.id === currentStep)
  const currentStepInfo = profileSteps[currentStepIndex]

  const updateProfileData = (stepData: Partial<ProfileData>) => {
    const updatedData = { ...profileData, ...stepData }
    setProfileData(updatedData)
    onSave(updatedData)
  }

  const handleStepComplete = (stepData: Partial<ProfileData>) => {
    updateProfileData(stepData)
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    
    // Move to next step if not the last one
    if (currentStepIndex < profileSteps.length - 1) {
      setCurrentStep(profileSteps[currentStepIndex + 1].id)
    }
  }

  const handleSkipStep = () => {
    if (currentStepIndex < profileSteps.length - 1) {
      setCurrentStep(profileSteps[currentStepIndex + 1].id)
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(profileSteps[currentStepIndex - 1].id)
    }
  }

  const handleFinishProfile = () => {
    onComplete(profileData as ProfileData)
  }

  const calculateProgress = () => {
    const totalSteps = profileSteps.length
    const completed = completedSteps.size
    return Math.round((completed / totalSteps) * 100)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <BasicInfoStep
            data={profileData}
            onComplete={handleStepComplete}
            onSkip={handleSkipStep}
          />
        )
      case 'location':
        return (
          <LocationStep
            data={profileData}
            onComplete={handleStepComplete}
            onSkip={handleSkipStep}
          />
        )
      case 'profile-image':
        return (
          <ProfileImageStep
            data={profileData}
            onComplete={handleStepComplete}
            onSkip={handleSkipStep}
          />
        )
      case 'skills-interests':
        return (
          <SkillsInterestsStep
            data={profileData}
            onComplete={handleStepComplete}
            onSkip={handleSkipStep}
          />
        )
      case 'privacy-controls':
        return (
          <PrivacyControlsStep
            data={profileData}
            onComplete={handleStepComplete}
            onFinish={handleFinishProfile}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card variant="cultural" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-cultural-gradient">
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                Build your cultural profile progressively - you can always come back later
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cultural-600">
                {calculateProgress()}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-gradient-to-r from-cultural-500 to-ubuntu-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {profileSteps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={clsx(
                      'w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors',
                      currentStep === step.id
                        ? 'bg-cultural-100 text-cultural-800 border border-cultural-300'
                        : 'hover:bg-gray-50 text-gray-700',
                      completedSteps.has(step.id) && 'bg-green-50 text-green-800'
                    )}
                  >
                    <div className={clsx(
                      'flex-shrink-0',
                      completedSteps.has(step.id) ? 'text-green-600' : 'text-gray-400'
                    )}>
                      {completedSteps.has(step.id) ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{step.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {step.required ? 'Required' : 'Optional'}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Current Step Content */}
        <div className="lg:col-span-3">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="text-cultural-600">
                  {currentStepInfo.icon}
                </div>
                <div>
                  <CardTitle>{currentStepInfo.title}</CardTitle>
                  <CardDescription>{currentStepInfo.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderCurrentStep()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStepIndex === 0}
                >
                  Previous
                </Button>
                
                <div className="text-sm text-gray-600">
                  Step {currentStepIndex + 1} of {profileSteps.length}
                </div>
                
                {currentStep === 'privacy-controls' ? (
                  <Button
                    variant="cultural"
                    onClick={handleFinishProfile}
                  >
                    Complete Profile
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleSkipStep}
                  >
                    Skip for Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProgressiveProfileBuilder
