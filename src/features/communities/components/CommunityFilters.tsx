import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CommunitySearch } from '@/types/community'
import { SOUTH_AFRICAN_CULTURES } from '@/utils/culturalUtils'
import { clsx } from 'clsx'

interface CommunityFiltersProps {
  filters: CommunitySearch['filters']
  onFiltersChange: (filters: CommunitySearch['filters']) => void
  onClose: () => void
}

const CommunityFilters: React.FC<CommunityFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState<CommunitySearch['filters']>(filters)

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

  const communityTypes = [
    { value: 'cultural', label: t('communities.types.cultural') },
    { value: 'skill_based', label: t('communities.types.skillBased') },
    { value: 'location_based', label: t('communities.types.locationBased') },
    { value: 'interest_based', label: t('communities.types.interestBased') },
    { value: 'mixed', label: t('communities.types.mixed') },
  ]

  const membershipTypes = [
    { value: 'open', label: t('communities.membership.open') },
    { value: 'invite_only', label: t('communities.membership.inviteOnly') },
    { value: 'application_required', label: t('communities.membership.applicationRequired') },
    { value: 'verified_only', label: t('communities.membership.verifiedOnly') },
  ]

  const verificationStatuses = [
    { value: 'unverified', label: t('communities.verification.unverified') },
    { value: 'community_verified', label: t('communities.verification.community') },
    { value: 'culturally_verified', label: t('communities.verification.cultural') },
    { value: 'officially_verified', label: t('communities.verification.official') },
  ]

  const activityLevels = [
    { value: 'very_active', label: t('communities.activity.veryActive') },
    { value: 'active', label: t('communities.activity.active') },
    { value: 'moderate', label: t('communities.activity.moderate') },
    { value: 'quiet', label: t('communities.activity.quiet') },
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'af', label: 'Afrikaans' },
    { value: 'zu', label: 'IsiZulu' },
    { value: 'xh', label: 'IsiXhosa' },
    { value: 'st', label: 'Sesotho' },
    { value: 'tn', label: 'Setswana' },
    { value: 'ts', label: 'Xitsonga' },
    { value: 've', label: 'Tshivenda' },
    { value: 'ss', label: 'SiSwati' },
    { value: 'nr', label: 'IsiNdebele' },
    { value: 'nso', label: 'Sepedi' },
  ]

  const categories = [
    'Arts & Culture',
    'Business & Entrepreneurship',
    'Education & Learning',
    'Health & Wellness',
    'Technology',
    'Sports & Recreation',
    'Community Service',
    'Environment',
    'Food & Cooking',
    'Music & Performance',
    'Traditional Crafts',
    'Language Exchange',
    'Youth Development',
    'Senior Support',
    'Family & Parenting',
  ]

  const handleArrayFilterChange = (
    filterKey: keyof CommunitySearch['filters'],
    value: string,
    checked: boolean
  ) => {
    const currentArray = (localFilters[filterKey] as string[]) || []
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    setLocalFilters(prev => ({
      ...prev,
      [filterKey]: newArray.length > 0 ? newArray : undefined,
    }))
  }

  const handleLocationChange = (field: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value || undefined,
      },
    }))
  }

  const handleMemberCountChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined
    setLocalFilters(prev => ({
      ...prev,
      memberCountRange: {
        ...prev.memberCountRange,
        [field]: numValue,
      },
    }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const clearFilters = () => {
    setLocalFilters({})
    onFiltersChange({})
    onClose()
  }

  const getActiveFilterCount = () => {
    let count = 0
    Object.values(localFilters).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++
      else if (value && typeof value === 'object' && Object.keys(value).length > 0) count++
      else if (value) count++
    })
    return count
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5" />
            <span>{t('communities.filters.title')}</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-cultural-100 text-cultural-800 text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Community Type */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.type')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {communityTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.type || []).includes(type.value as any)}
                  onChange={(e) => handleArrayFilterChange('type', type.value, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cultural Identities */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.cultures')}
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {SOUTH_AFRICAN_CULTURES.map((culture) => (
              <label key={culture.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.cultures || []).includes(culture.id)}
                  onChange={(e) => handleArrayFilterChange('cultures', culture.id, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{culture.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.location')}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('communities.filters.province')}
              </label>
              <select
                value={localFilters.location?.province || ''}
                onChange={(e) => handleLocationChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cultural-500 focus:border-cultural-500"
              >
                <option value="">{t('communities.filters.allProvinces')}</option>
                {southAfricanProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={t('communities.filters.city')}
              placeholder={t('communities.filters.cityPlaceholder')}
              value={localFilters.location?.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
            />
          </div>
        </div>

        {/* Member Count Range */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.memberCount')}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('communities.filters.minMembers')}
              type="number"
              placeholder="0"
              value={localFilters.memberCountRange?.min?.toString() || ''}
              onChange={(e) => handleMemberCountChange('min', e.target.value)}
            />
            <Input
              label={t('communities.filters.maxMembers')}
              type="number"
              placeholder="No limit"
              value={localFilters.memberCountRange?.max?.toString() || ''}
              onChange={(e) => handleMemberCountChange('max', e.target.value)}
            />
          </div>
        </div>

        {/* Membership Type */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.membershipType')}
          </h4>
          <div className="space-y-2">
            {membershipTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.membershipType || []).includes(type.value as any)}
                  onChange={(e) => handleArrayFilterChange('membershipType', type.value, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.languages')}
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {languages.map((language) => (
              <label key={language.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.languages || []).includes(language.value)}
                  onChange={(e) => handleArrayFilterChange('languages', language.value, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{language.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.categories')}
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.categories || []).includes(category)}
                  onChange={(e) => handleArrayFilterChange('categories', category, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.verification')}
          </h4>
          <div className="space-y-2">
            {verificationStatuses.map((status) => (
              <label key={status.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.verificationStatus || []).includes(status.value as any)}
                  onChange={(e) => handleArrayFilterChange('verificationStatus', status.value, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            {t('communities.filters.activityLevel')}
          </h4>
          <div className="space-y-2">
            {activityLevels.map((level) => (
              <label key={level.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(localFilters.activityLevel || []).includes(level.value as any)}
                  onChange={(e) => handleArrayFilterChange('activityLevel', level.value, e.target.checked)}
                  className="h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={clearFilters} fullWidth>
            {t('communities.filters.clear')}
          </Button>
          <Button variant="cultural" onClick={applyFilters} fullWidth>
            {t('communities.filters.apply')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityFilters
