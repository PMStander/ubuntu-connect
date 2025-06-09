import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MapPinIcon, GlobeAltIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { clsx } from 'clsx'

interface LocationData {
  province: string
  city: string
  shareLocation: boolean
  precision: 'exact' | 'city' | 'province'
}

interface LocationStepProps {
  data: any
  onComplete: (data: any) => void
  onSkip: () => void
}

const southAfricanProvinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
]

const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onComplete,
  onSkip,
}) => {
  const { t } = useTranslation()
  const [shareLocation, setShareLocation] = useState(data?.location?.shareLocation ?? true)
  const [precision, setPrecision] = useState<'exact' | 'city' | 'province'>(
    data?.location?.precision ?? 'city'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationData>({
    defaultValues: {
      province: data?.location?.province || '',
      city: data?.location?.city || '',
      shareLocation,
      precision,
    },
  })

  const onSubmit = (formData: LocationData) => {
    onComplete({
      location: {
        ...formData,
        shareLocation,
        precision,
      },
    })
  }

  const precisionOptions = [
    {
      value: 'province' as const,
      label: 'Province Only',
      description: 'Show only your province (e.g., "Gauteng")',
      icon: <GlobeAltIcon className="w-5 h-5" />,
    },
    {
      value: 'city' as const,
      label: 'City Level',
      description: 'Show your city and province (e.g., "Johannesburg, Gauteng")',
      icon: <MapPinIcon className="w-5 h-5" />,
    },
    {
      value: 'exact' as const,
      label: 'Exact Location',
      description: 'Share precise location for nearby community matching',
      icon: <MapPinIcon className="w-5 h-5" />,
    },
  ]

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Sharing Toggle */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="shareLocation"
              checked={shareLocation}
              onChange={(e) => setShareLocation(e.target.checked)}
              className="mt-1 h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="shareLocation" className="font-medium text-blue-800">
                Share my location with the community
              </label>
              <p className="text-sm text-blue-700 mt-1">
                This helps us connect you with nearby communities and local cultural events.
                You can change this setting anytime.
              </p>
            </div>
          </div>
        </div>

        {shareLocation && (
          <>
            {/* Province Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <select
                {...register('province', {
                  required: shareLocation ? 'Province is required' : false,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cultural-500 focus:border-cultural-500"
              >
                <option value="">Select your province</option>
                {southAfricanProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-sm text-red-600 mt-1">{errors.province.message}</p>
              )}
            </div>

            {/* City Input */}
            <Input
              label="City/Town"
              placeholder="e.g., Johannesburg, Cape Town, Durban"
              error={errors.city?.message}
              {...register('city', {
                required: shareLocation ? 'City is required' : false,
              })}
            />

            {/* Privacy Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Location Privacy Level
              </label>
              <div className="space-y-3">
                {precisionOptions.map((option) => (
                  <div
                    key={option.value}
                    className={clsx(
                      'p-4 border-2 rounded-lg cursor-pointer transition-all',
                      precision === option.value
                        ? 'border-cultural-500 bg-cultural-50'
                        : 'border-gray-200 hover:border-cultural-300'
                    )}
                    onClick={() => setPrecision(option.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="radio"
                          name="precision"
                          value={option.value}
                          checked={precision === option.value}
                          onChange={() => setPrecision(option.value)}
                          className="h-4 w-4 text-cultural-600 focus:ring-cultural-500"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-cultural-600">{option.icon}</span>
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!shareLocation && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <EyeSlashIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              Location sharing is disabled. You can still join communities manually.
            </p>
          </div>
        )}

        {/* Benefits of Location Sharing */}
        <div className="p-4 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
          <h4 className="font-medium text-ubuntu-800 mb-2">Benefits of Location Sharing</h4>
          <ul className="text-sm text-ubuntu-700 space-y-1">
            <li>• Discover local cultural events and gatherings</li>
            <li>• Connect with nearby community members</li>
            <li>• Find location-based collaboration opportunities</li>
            <li>• Get recommendations for cultural sites and activities</li>
            <li>• Join regional cultural preservation projects</li>
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

export default LocationStep
