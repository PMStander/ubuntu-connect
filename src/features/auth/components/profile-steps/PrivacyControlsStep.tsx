import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  UsersIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'

interface PrivacySettings {
  profileVisibility: 'public' | 'communities' | 'private'
  culturalIdentityVisible: boolean
  skillsVisible: boolean
  locationSharing: boolean
  analyticsOptIn: boolean
}

interface PrivacyControlsStepProps {
  data: any
  onComplete: (data: any) => void
  onFinish: () => void
}

const PrivacyControlsStep: React.FC<PrivacyControlsStepProps> = ({
  data,
  onComplete,
  onFinish,
}) => {
  const { t } = useTranslation()
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: data?.privacy?.profileVisibility || 'communities',
    culturalIdentityVisible: data?.privacy?.culturalIdentityVisible ?? false,
    skillsVisible: data?.privacy?.skillsVisible ?? true,
    locationSharing: data?.privacy?.locationSharing ?? true,
    analyticsOptIn: data?.privacy?.analyticsOptIn ?? false,
  })

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handleComplete = () => {
    onComplete({ privacy })
    onFinish()
  }

  const visibilityOptions = [
    {
      value: 'private' as const,
      label: 'Private',
      description: 'Only you can see your profile',
      icon: <LockClosedIcon className="w-5 h-5" />,
      color: 'red',
    },
    {
      value: 'communities' as const,
      label: 'Community Members',
      description: 'Only members of your communities can see your profile',
      icon: <UsersIcon className="w-5 h-5" />,
      color: 'cultural',
    },
    {
      value: 'public' as const,
      label: 'Public',
      description: 'Anyone on Ubuntu Connect can see your profile',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      color: 'ubuntu',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Profile Visibility */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-6 h-6 text-cultural-600 mr-2" />
          Profile Visibility
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose who can see your profile information.
        </p>

        <div className="space-y-3">
          {visibilityOptions.map((option) => (
            <div
              key={option.value}
              className={clsx(
                'p-4 border-2 rounded-lg cursor-pointer transition-all',
                privacy.profileVisibility === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => handlePrivacyChange('profileVisibility', option.value)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={privacy.profileVisibility === option.value}
                    onChange={() => handlePrivacyChange('profileVisibility', option.value)}
                    className={`h-4 w-4 text-${option.color}-600 focus:ring-${option.color}-500`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-${option.color}-600`}>{option.icon}</span>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specific Privacy Controls */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Specific Privacy Controls</h3>
        <div className="space-y-4">
          {/* Cultural Identity Visibility */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Cultural Identity Visibility</span>
                <span className="text-sm text-gray-500">(Recommended: Off)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Show your selected cultural identities on your profile
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePrivacyChange('culturalIdentityVisible', !privacy.culturalIdentityVisible)}
              className={clsx(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cultural-500 focus:ring-offset-2',
                privacy.culturalIdentityVisible ? 'bg-cultural-600' : 'bg-gray-200'
              )}
            >
              <span
                className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  privacy.culturalIdentityVisible ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Skills Visibility */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Skills & Interests Visibility</span>
                <span className="text-sm text-gray-500">(Recommended: On)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Show your skills and interests for collaboration matching
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePrivacyChange('skillsVisible', !privacy.skillsVisible)}
              className={clsx(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cultural-500 focus:ring-offset-2',
                privacy.skillsVisible ? 'bg-cultural-600' : 'bg-gray-200'
              )}
            >
              <span
                className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  privacy.skillsVisible ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Location Sharing */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Location Sharing</span>
                <span className="text-sm text-gray-500">(Recommended: On)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Share your location for local community discovery
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePrivacyChange('locationSharing', !privacy.locationSharing)}
              className={clsx(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cultural-500 focus:ring-offset-2',
                privacy.locationSharing ? 'bg-cultural-600' : 'bg-gray-200'
              )}
            >
              <span
                className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  privacy.locationSharing ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Analytics Opt-in */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Cultural Analytics</span>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Help improve cross-cultural understanding through anonymized analytics
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePrivacyChange('analyticsOptIn', !privacy.analyticsOptIn)}
              className={clsx(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cultural-500 focus:ring-offset-2',
                privacy.analyticsOptIn ? 'bg-cultural-600' : 'bg-gray-200'
              )}
            >
              <span
                className={clsx(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  privacy.analyticsOptIn ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* POPIA Compliance Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">🔒 Your Privacy Rights (POPIA)</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You can change these settings anytime in your account preferences</li>
          <li>• You have the right to access, correct, or delete your personal information</li>
          <li>• We never share your data with third parties without explicit consent</li>
          <li>• Cultural identity data is treated with special sensitivity</li>
          <li>• You can request a full data export or account deletion anytime</li>
        </ul>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button
          type="button"
          variant="cultural"
          size="lg"
          onClick={handleComplete}
        >
          Complete Profile Setup
        </Button>
      </div>
    </div>
  )
}

export default PrivacyControlsStep
