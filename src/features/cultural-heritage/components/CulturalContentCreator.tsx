import React, { useState, useRef } from 'react'
import { Timestamp } from 'firebase/firestore'
import { culturalHeritageService, CulturalHeritageContent, MediaFile } from '../../../services/culturalHeritageService'
import { useAuth } from '../../auth/hooks/useAuth'

interface CulturalContentCreatorProps {
  onContentCreated?: (contentId: string) => void
  onCancel?: () => void
}

export const CulturalContentCreator: React.FC<CulturalContentCreatorProps> = ({
  onContentCreated,
  onCancel,
}) => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'story' as CulturalHeritageContent['type'],
    culturalGroup: [] as string[],
    region: '',
    provenance: '',
    culturalSignificance: 'public' as CulturalHeritageContent['metadata']['culturalSignificance'],
    tags: [] as string[],
    language: 'en',
  })

  const [mediaFiles, setMediaFiles] = useState<{
    images: File[]
    videos: File[]
    audio: File[]
    documents: File[]
  }>({
    images: [],
    videos: [],
    audio: [],
    documents: [],
  })

  const fileInputRefs = {
    images: useRef<HTMLInputElement>(null),
    videos: useRef<HTMLInputElement>(null),
    audio: useRef<HTMLInputElement>(null),
    documents: useRef<HTMLInputElement>(null),
  }

  const culturalGroups = [
    'zulu', 'xhosa', 'afrikaans', 'english', 'sotho', 'tswana', 
    'tsonga', 'swati', 'venda', 'ndebele', 'coloured'
  ]

  const contentTypes = [
    { value: 'story', label: 'Story/Oral Tradition' },
    { value: 'tradition', label: 'Cultural Tradition' },
    { value: 'artifact', label: 'Cultural Artifact' },
    { value: 'recipe', label: 'Traditional Recipe' },
    { value: 'music', label: 'Music/Song' },
    { value: 'dance', label: 'Dance/Performance' },
    { value: 'language', label: 'Language/Dialect' },
    { value: 'history', label: 'Historical Account' },
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelection = (mediaType: keyof typeof mediaFiles, files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    setMediaFiles(prev => ({
      ...prev,
      [mediaType]: [...prev[mediaType], ...fileArray],
    }))
  }

  const removeFile = (mediaType: keyof typeof mediaFiles, index: number) => {
    setMediaFiles(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Create the heritage content
      const contentData: Omit<CulturalHeritageContent, 'id' | 'engagement'> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        culturalGroup: formData.culturalGroup,
        region: formData.region,
        media: {
          images: [],
          videos: [],
          audio: [],
          documents: [],
        },
        metadata: {
          creator: user.uid,
          contributors: [],
          dateCreated: Timestamp.now(),
          lastModified: Timestamp.now(),
          provenance: formData.provenance,
          culturalSignificance: formData.culturalSignificance,
          tags: formData.tags,
          language: formData.language,
          region: formData.region,
        },
        validation: {
          status: 'draft',
          reviewedBy: [],
          reviewNotes: [],
          communityEndorsements: 0,
          accuracyScore: 0,
        },
        preservation: {
          archivalQuality: true,
          backupLocations: [],
          digitalPreservationMetadata: {},
          culturalContextPreserved: true,
        },
      }

      const contentId = await culturalHeritageService.createHeritageContent(contentData)

      // Upload media files
      const mediaTypes = Object.keys(mediaFiles) as Array<keyof typeof mediaFiles>
      for (const mediaType of mediaTypes) {
        const files = mediaFiles[mediaType]
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setUploadProgress(prev => ({ ...prev, [`${mediaType}-${i}`]: 0 }))
          
          try {
            await culturalHeritageService.uploadMediaFile(file, contentId, mediaType)
            setUploadProgress(prev => ({ ...prev, [`${mediaType}-${i}`]: 100 }))
          } catch (error) {
            console.error(`Error uploading ${mediaType} file:`, error)
          }
        }
      }

      onContentCreated?.(contentId)
    } catch (error) {
      console.error('Error creating cultural content:', error)
      alert('Failed to create cultural content. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Group(s) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {culturalGroups.map(group => (
                  <label key={group} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.culturalGroup.includes(group)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('culturalGroup', [...formData.culturalGroup, group])
                        } else {
                          handleInputChange('culturalGroup', formData.culturalGroup.filter(g => g !== group))
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Provide a detailed description of this cultural content"
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Cultural Context</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Significance
              </label>
              <select
                value={formData.culturalSignificance}
                onChange={(e) => handleInputChange('culturalSignificance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="public">Public - Can be shared openly</option>
                <option value="community_only">Community Only - Restricted to cultural community</option>
                <option value="sacred">Sacred - Requires special permissions</option>
                <option value="restricted">Restricted - Limited access</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source/Provenance *
              </label>
              <textarea
                value={formData.provenance}
                onChange={(e) => handleInputChange('provenance', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the source and historical context of this content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="tradition, heritage, history, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">Zulu</option>
                <option value="xh">Xhosa</option>
                <option value="st">Sotho</option>
                <option value="tn">Tswana</option>
                <option value="ts">Tsonga</option>
                <option value="ss">Swati</option>
                <option value="ve">Venda</option>
                <option value="nr">Ndebele</option>
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Media Files</h3>
            
            {Object.entries(fileInputRefs).map(([mediaType, ref]) => (
              <div key={mediaType} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium capitalize">{mediaType}</h4>
                  <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                  >
                    Add {mediaType}
                  </button>
                </div>
                
                <input
                  ref={ref}
                  type="file"
                  multiple
                  accept={
                    mediaType === 'images' ? 'image/*' :
                    mediaType === 'videos' ? 'video/*' :
                    mediaType === 'audio' ? 'audio/*' :
                    '.pdf,.doc,.docx,.txt'
                  }
                  onChange={(e) => handleFileSelection(mediaType as keyof typeof mediaFiles, e.target.files)}
                  className="hidden"
                />
                
                <div className="space-y-2">
                  {mediaFiles[mediaType as keyof typeof mediaFiles].map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(mediaType as keyof typeof mediaFiles, index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Cultural Heritage</h2>
        <p className="text-gray-600">
          Contribute to preserving and sharing South African cultural heritage with respect and authenticity.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              disabled={!formData.title || !formData.description || formData.culturalGroup.length === 0}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.description || formData.culturalGroup.length === 0}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Content'}
            </button>
          )}
        </div>
      </div>

      {/* Cultural Sensitivity Notice */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
        <h4 className="font-medium text-orange-800 mb-2">Cultural Sensitivity Guidelines</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Ensure you have the right to share this cultural content</li>
          <li>• Respect sacred and sensitive cultural information</li>
          <li>• Provide accurate historical and cultural context</li>
          <li>• Content will be reviewed by cultural representatives</li>
          <li>• Follow Ubuntu principles of mutual respect and community benefit</li>
        </ul>
      </div>
    </div>
  )
}

export default CulturalContentCreator
