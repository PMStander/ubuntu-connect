import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CameraIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { clsx } from 'clsx'

interface ProfileImageStepProps {
  data: any
  onComplete: (data: any) => void
  onSkip: () => void
}

const ProfileImageStep: React.FC<ProfileImageStepProps> = ({
  data,
  onComplete,
  onSkip,
}) => {
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState<string | null>(data?.profileImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploading(true)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setSelectedImage(result)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleContinue = () => {
    onComplete({ profileImage: selectedImage })
  }

  return (
    <div className="space-y-6">
      {/* Image Upload Area */}
      <div className="text-center">
        <div className="relative inline-block">
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-cultural-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
              <UserCircleIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="profile-image-input"
          />
          <label
            htmlFor="profile-image-input"
            className={clsx(
              'inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            {isUploading ? 'Processing...' : selectedImage ? 'Change Photo' : 'Upload Photo'}
          </label>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>

      {/* Cultural Sensitivity Guidelines */}
      <div className="p-4 bg-cultural-50 border border-cultural-200 rounded-lg">
        <h4 className="font-medium text-cultural-800 mb-2">📸 Photo Guidelines</h4>
        <ul className="text-sm text-cultural-700 space-y-1">
          <li>• Choose a clear, recent photo that represents you well</li>
          <li>• Ensure your face is visible and well-lit</li>
          <li>• Cultural attire and traditional dress are welcome and celebrated</li>
          <li>• Avoid photos with inappropriate content or offensive symbols</li>
          <li>• Your photo helps build trust in our community</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">🔒 Privacy & Safety</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your profile photo visibility is controlled by your privacy settings</li>
          <li>• You can change or remove your photo anytime</li>
          <li>• Photos are stored securely and not shared with third parties</li>
          <li>• Report any misuse of photos to our moderation team</li>
        </ul>
      </div>

      {/* Benefits of Profile Photo */}
      <div className="p-4 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
        <h4 className="font-medium text-ubuntu-800 mb-2">✨ Why Add a Photo?</h4>
        <ul className="text-sm text-ubuntu-700 space-y-1">
          <li>• Increases trust and connection with community members</li>
          <li>• Makes your profile more engaging and personal</li>
          <li>• Helps others recognize you at cultural events</li>
          <li>• Celebrates the diversity of our Rainbow Nation</li>
          <li>• Improves your chances of meaningful connections</li>
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
          type="button"
          variant="cultural"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default ProfileImageStep
