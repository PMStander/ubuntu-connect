import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PlusIcon, XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { clsx } from 'clsx'

interface Skill {
  name: string
  level: 'beginner' | 'intermediate' | 'expert'
  culturalContext?: string
}

interface SkillsInterestsData {
  skills: Skill[]
  interests: string[]
}

interface SkillsInterestsStepProps {
  data: any
  onComplete: (data: any) => void
  onSkip: () => void
}

const skillCategories = [
  'Technology & Programming',
  'Arts & Crafts',
  'Music & Performance',
  'Languages',
  'Cooking & Food',
  'Traditional Crafts',
  'Business & Entrepreneurship',
  'Education & Teaching',
  'Healthcare & Wellness',
  'Agriculture & Farming',
  'Sports & Fitness',
  'Writing & Literature',
  'Photography & Media',
  'Community Leadership',
  'Cultural Preservation',
]

const commonInterests = [
  'Cultural Exchange',
  'Traditional Music',
  'Local History',
  'Community Service',
  'Language Learning',
  'Traditional Cooking',
  'Arts & Crafts',
  'Storytelling',
  'Environmental Conservation',
  'Youth Mentorship',
  'Cultural Events',
  'Heritage Sites',
  'Traditional Dance',
  'Community Gardens',
  'Social Justice',
]

const SkillsInterestsStep: React.FC<SkillsInterestsStepProps> = ({
  data,
  onComplete,
  onSkip,
}) => {
  const { t } = useTranslation()
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    data?.interests || []
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillsInterestsData>({
    defaultValues: {
      skills: data?.skills || [{ name: '', level: 'beginner', culturalContext: '' }],
      interests: data?.interests || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  })

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const onSubmit = (formData: SkillsInterestsData) => {
    const validSkills = formData.skills.filter(skill => skill.name.trim() !== '')
    onComplete({
      skills: validSkills,
      interests: selectedInterests,
    })
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Skills Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AcademicCapIcon className="w-6 h-6 text-cultural-600" />
            <h3 className="text-lg font-medium text-gray-900">Your Skills</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Share your skills to help others find you for collaboration and knowledge exchange.
          </p>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      label="Skill Name"
                      placeholder="e.g., Web Development, Traditional Beadwork"
                      {...register(`skills.${index}.name`)}
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Level
                    </label>
                    <select
                      {...register(`skills.${index}.level`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cultural-500 focus:border-cultural-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Input
                    label="Cultural Context (Optional)"
                    placeholder="How does this skill relate to your cultural background?"
                    {...register(`skills.${index}.culturalContext`)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', level: 'beginner', culturalContext: '' })}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Add Another Skill
            </Button>
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Interests</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select interests to help us recommend relevant communities and content.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {commonInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={clsx(
                  'p-3 text-sm rounded-lg border-2 transition-all text-left',
                  selectedInterests.includes(interest)
                    ? 'border-cultural-500 bg-cultural-50 text-cultural-800'
                    : 'border-gray-200 hover:border-cultural-300 text-gray-700'
                )}
              >
                {interest}
              </button>
            ))}
          </div>

          {selectedInterests.length > 0 && (
            <div className="mt-4 p-3 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
              <p className="text-sm text-ubuntu-800">
                <strong>Selected:</strong> {selectedInterests.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Cultural Skills Highlight */}
        <div className="p-4 bg-cultural-50 border border-cultural-200 rounded-lg">
          <h4 className="font-medium text-cultural-800 mb-2">🌟 Celebrate Cultural Skills</h4>
          <ul className="text-sm text-cultural-700 space-y-1">
            <li>• Traditional crafts, music, and art forms are highly valued</li>
            <li>• Language skills help bridge cultural divides</li>
            <li>• Cultural knowledge and storytelling are precious skills</li>
            <li>• Modern skills with cultural applications are especially welcome</li>
            <li>• Teaching and preserving culture is a vital community contribution</li>
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

export default SkillsInterestsStep
