import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCultural } from '@/store'
import { getCulturalIdentitiesByIds, formatCulturalIdentityNames } from '@/utils/culturalUtils'

interface BasicInfoData {
  bio: string
}

interface BasicInfoStepProps {
  data: any
  onComplete: (data: any) => void
  onSkip: () => void
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onComplete,
  onSkip,
}) => {
  const { t } = useTranslation()
  const { userCulturalIdentities } = useCultural()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BasicInfoData>({
    defaultValues: {
      bio: data?.bio || '',
    },
  })

  const bioValue = watch('bio')
  const bioLength = bioValue?.length || 0
  const maxBioLength = 500

  const onSubmit = (formData: BasicInfoData) => {
    onComplete({ bio: formData.bio })
  }

  const culturalIdentityNames = formatCulturalIdentityNames(userCulturalIdentities)

  return (
    <div className="space-y-6">
      {/* Cultural Identity Summary */}
      {userCulturalIdentities.length > 0 && (
        <div className="p-4 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
          <h4 className="font-medium text-ubuntu-800 mb-2">Your Cultural Identities</h4>
          <p className="text-ubuntu-700">{culturalIdentityNames}</p>
          <p className="text-sm text-ubuntu-600 mt-1">
            These will help us connect you with relevant communities and content.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bio Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us about yourself
          </label>
          <textarea
            {...register('bio', {
              maxLength: {
                value: maxBioLength,
                message: `Bio must be less than ${maxBioLength} characters`,
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cultural-500 focus:border-cultural-500"
            rows={6}
            placeholder="Share your story, interests, what makes you unique, and how you'd like to contribute to cross-cultural understanding..."
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              Share your background, interests, and what you hope to gain from Ubuntu Connect
            </div>
            <div className={`text-sm ${
              bioLength > maxBioLength * 0.9 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {bioLength}/{maxBioLength}
            </div>
          </div>
          {errors.bio && (
            <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Cultural Context Tips */}
        <div className="p-4 bg-cultural-50 border border-cultural-200 rounded-lg">
          <h4 className="font-medium text-cultural-800 mb-2">💡 Profile Tips</h4>
          <ul className="text-sm text-cultural-700 space-y-1">
            <li>• Share what cultural traditions or values are important to you</li>
            <li>• Mention languages you speak or are learning</li>
            <li>• Describe your interests in cross-cultural collaboration</li>
            <li>• Include any skills you'd like to share or learn</li>
            <li>• Be authentic - diversity of perspectives strengthens our community</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
          >
            Skip for Now
          </Button>
          
          <Button
            type="submit"
            variant="cultural"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BasicInfoStep
