import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { 
  UserGroupIcon,
  MapPinIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import BasicInfoStep from './creation-steps/BasicInfoStep'
import CulturalContextStep from './creation-steps/CulturalContextStep'
import LocationStep from './creation-steps/LocationStep'
import PrivacySettingsStep from './creation-steps/PrivacySettingsStep'
import GuidelinesStep from './creation-steps/GuidelinesStep'
import ReviewStep from './creation-steps/ReviewStep'
import { communityManagementService } from '@/services/communityManagementService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { clsx } from 'clsx'

interface CommunityCreationWizardProps {
  onComplete: (communityId: string) => void
  onCancel: () => void
}

type CreationStep = 'basic-info' | 'cultural-context' | 'location' | 'privacy' | 'guidelines' | 'review'

interface CommunityFormData {
  // Basic Info
  name: string
  description: string
  type: 'cultural' | 'skill_based' | 'location_based' | 'interest_based' | 'mixed'
  categories: string[]
  languages: string[]
  
  // Cultural Context
  primaryCultures: string[]
  culturalTags: string[]
  culturalSensitivity: 'open' | 'respectful' | 'members_only'
  
  // Location
  location: {
    type: 'global' | 'country' | 'province' | 'city' | 'neighborhood'
    country?: string
    province?: string
    city?: string
  }
  
  // Privacy & Membership
  membershipType: 'open' | 'invite_only' | 'application_required' | 'verified_only'
  maxMembers?: number
  privacy: {
    visibility: 'public' | 'members_only' | 'invite_only'
    contentSharing: 'open' | 'members_only' | 'leaders_only'
    memberListVisible: boolean
    requireApproval: boolean
  }
  
  // Guidelines
  guidelines: {
    description: string
    rules: string[]
    culturalGuidelines: string[]
    consequences: string[]
  }
}

const CommunityCreationWizard: React.FC<CommunityCreationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<CreationStep>('basic-info')
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    type: 'cultural',
    categories: [],
    languages: ['en'],
    primaryCultures: [],
    culturalTags: [],
    culturalSensitivity: 'respectful',
    location: {
      type: 'province',
    },
    membershipType: 'open',
    privacy: {
      visibility: 'public',
      contentSharing: 'members_only',
      memberListVisible: true,
      requireApproval: false,
    },
    guidelines: {
      description: '',
      rules: [],
      culturalGuidelines: [],
      consequences: [],
    },
  })
  const [isCreating, setIsCreating] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<CreationStep>>(new Set())

  const creationSteps = [
    {
      id: 'basic-info' as const,
      title: t('communities.creation.steps.basicInfo.title'),
      description: t('communities.creation.steps.basicInfo.description'),
      icon: <UserGroupIcon className="w-6 h-6" />,
      required: true,
    },
    {
      id: 'cultural-context' as const,
      title: t('communities.creation.steps.culturalContext.title'),
      description: t('communities.creation.steps.culturalContext.description'),
      icon: <UserGroupIcon className="w-6 h-6" />,
      required: false,
    },
    {
      id: 'location' as const,
      title: t('communities.creation.steps.location.title'),
      description: t('communities.creation.steps.location.description'),
      icon: <MapPinIcon className="w-6 h-6" />,
      required: false,
    },
    {
      id: 'privacy' as const,
      title: t('communities.creation.steps.privacy.title'),
      description: t('communities.creation.steps.privacy.description'),
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      required: true,
    },
    {
      id: 'guidelines' as const,
      title: t('communities.creation.steps.guidelines.title'),
      description: t('communities.creation.steps.guidelines.description'),
      icon: <DocumentTextIcon className="w-6 h-6" />,
      required: true,
    },
    {
      id: 'review' as const,
      title: t('communities.creation.steps.review.title'),
      description: t('communities.creation.steps.review.description'),
      icon: <CheckCircleIcon className="w-6 h-6" />,
      required: true,
    },
  ]

  const currentStepIndex = creationSteps.findIndex(step => step.id === currentStep)
  const currentStepInfo = creationSteps[currentStepIndex]

  const updateFormData = (stepData: Partial<CommunityFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  const handleStepComplete = (stepData: Partial<CommunityFormData>) => {
    updateFormData(stepData)
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    
    // Move to next step if not the last one
    if (currentStepIndex < creationSteps.length - 1) {
      setCurrentStep(creationSteps[currentStepIndex + 1].id)
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(creationSteps[currentStepIndex - 1].id)
    }
  }

  const handleCreateCommunity = async () => {
    if (!user) return

    setIsCreating(true)
    try {
      const communityId = await communityManagementService.createCommunity(user.uid, formData)
      onComplete(communityId)
    } catch (error) {
      console.error('Error creating community:', error)
      // Handle error - show toast notification
    } finally {
      setIsCreating(false)
    }
  }

  const calculateProgress = () => {
    const totalSteps = creationSteps.length
    const completed = completedSteps.size
    return Math.round((completed / totalSteps) * 100)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <BasicInfoStep
            data={formData}
            onComplete={handleStepComplete}
          />
        )
      case 'cultural-context':
        return (
          <CulturalContextStep
            data={formData}
            onComplete={handleStepComplete}
          />
        )
      case 'location':
        return (
          <LocationStep
            data={formData}
            onComplete={handleStepComplete}
          />
        )
      case 'privacy':
        return (
          <PrivacySettingsStep
            data={formData}
            onComplete={handleStepComplete}
          />
        )
      case 'guidelines':
        return (
          <GuidelinesStep
            data={formData}
            onComplete={handleStepComplete}
          />
        )
      case 'review':
        return (
          <ReviewStep
            data={formData}
            onCreateCommunity={handleCreateCommunity}
            isCreating={isCreating}
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
                {t('communities.creation.title')}
              </CardTitle>
              <CardDescription>
                {t('communities.creation.subtitle')}
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
              <CardTitle className="text-lg">Creation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {creationSteps.map((step, index) => (
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
              {currentStep !== 'review' && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={currentStepIndex === 0 ? onCancel : handlePreviousStep}
                    leftIcon={currentStepIndex === 0 ? undefined : <ArrowLeftIcon className="w-4 h-4" />}
                  >
                    {currentStepIndex === 0 ? 'Cancel' : 'Previous'}
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {creationSteps.length}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStepIndex < creationSteps.length - 1) {
                        setCurrentStep(creationSteps[currentStepIndex + 1].id)
                      }
                    }}
                    rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    Skip for Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ubuntu Philosophy Notice */}
      <Card variant="ubuntu" className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <UserGroupIcon className="w-6 h-6 text-ubuntu-600 mt-1" />
            <div>
              <h4 className="font-medium text-ubuntu-800 mb-1">
                Ubuntu Philosophy in Community Building
              </h4>
              <p className="text-sm text-ubuntu-700">
                "I am because we are" - Your community should embody the spirit of Ubuntu by fostering 
                mutual respect, cultural understanding, and collective growth. Consider how your community 
                will bridge cultural divides and strengthen our Rainbow Nation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommunityCreationWizard
