import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  HeartIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { crossCulturalInteractionService } from '@/services/crossCulturalInteractionService'
import { useCultural } from '@/store'
import { formatCulturalIdentityNames } from '@/utils/culturalUtils'
import { clsx } from 'clsx'

interface CulturalBridgeBuilderProps {
  targetCultures: string[]
  onActivitySelect: (activity: string) => void
  onLearningSelect: (opportunity: string) => void
}

const CulturalBridgeBuilder: React.FC<CulturalBridgeBuilderProps> = ({
  targetCultures,
  onActivitySelect,
  onLearningSelect,
}) => {
  const { t } = useTranslation()
  const { userCulturalIdentities } = useCultural()
  const [suggestions, setSuggestions] = useState<{
    commonGround: string[]
    bridgeActivities: string[]
    learningOpportunities: string[]
    culturalGifts: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'common' | 'activities' | 'learning' | 'gifts'>('common')

  useEffect(() => {
    if (userCulturalIdentities.length > 0 && targetCultures.length > 0) {
      loadBridgeSuggestions()
    }
  }, [userCulturalIdentities, targetCultures])

  const loadBridgeSuggestions = async () => {
    setIsLoading(true)
    try {
      const bridgeSuggestions = await crossCulturalInteractionService.generateBridgeBuildingSuggestions(
        userCulturalIdentities,
        targetCultures
      )
      setSuggestions(bridgeSuggestions)
    } catch (error) {
      console.error('Error loading bridge suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const bridgeTabs = [
    {
      id: 'common' as const,
      label: t('cultural.bridge.commonGround'),
      icon: <HeartIcon className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'activities' as const,
      label: t('cultural.bridge.activities'),
      icon: <GlobeAltIcon className="w-5 h-5" />,
      color: 'text-cultural-600',
      bgColor: 'bg-cultural-50',
    },
    {
      id: 'learning' as const,
      label: t('cultural.bridge.learning'),
      icon: <AcademicCapIcon className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'gifts' as const,
      label: t('cultural.bridge.gifts'),
      icon: <GiftIcon className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const userCultureNames = formatCulturalIdentityNames(userCulturalIdentities)
  const targetCultureNames = formatCulturalIdentityNames(targetCultures)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-cultural-600" />
            <span>{t('cultural.bridge.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!suggestions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-cultural-600" />
            <span>{t('cultural.bridge.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('cultural.bridge.noSuggestions')}
            </h3>
            <p className="text-gray-600">
              {t('cultural.bridge.noSuggestionsDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'common':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('cultural.bridge.commonGroundDescription')}
            </p>
            <div className="grid gap-3">
              {suggestions.commonGround.map((element, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <HeartIcon className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">{element}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'activities':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('cultural.bridge.activitiesDescription')}
            </p>
            <div className="grid gap-3">
              {suggestions.bridgeActivities.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 bg-cultural-50 border border-cultural-200 rounded-lg hover:bg-cultural-100 transition-colors cursor-pointer"
                  onClick={() => onActivitySelect(activity)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="w-5 h-5 text-cultural-600" />
                      <span className="font-medium text-cultural-800">{activity}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('cultural.bridge.organize')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'learning':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('cultural.bridge.learningDescription')}
            </p>
            <div className="grid gap-3">
              {suggestions.learningOpportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => onLearningSelect(opportunity)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">{opportunity}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('cultural.bridge.learn')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'gifts':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('cultural.bridge.giftsDescription')}
            </p>
            <div className="grid gap-3">
              {suggestions.culturalGifts.map((gift, index) => (
                <div
                  key={index}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <GiftIcon className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">{gift}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6 text-cultural-600" />
          <span>{t('cultural.bridge.title')}</span>
        </CardTitle>
        <CardDescription>
          {t('cultural.bridge.subtitle', {
            userCultures: userCultureNames,
            targetCultures: targetCultureNames,
          })}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {bridgeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={clsx(
                  'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm',
                  selectedTab === tab.id
                    ? `border-cultural-500 ${tab.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Cultural Context Notice */}
        <div className="mt-6 p-4 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-ubuntu-600 mt-1" />
            <div>
              <h4 className="font-medium text-ubuntu-800 mb-1">
                {t('cultural.bridge.contextNotice.title')}
              </h4>
              <p className="text-sm text-ubuntu-700">
                {t('cultural.bridge.contextNotice.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="cultural"
            leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
            fullWidth
          >
            {t('cultural.bridge.startConversation')}
          </Button>
          <Button
            variant="outline"
            leftIcon={<AcademicCapIcon className="w-4 h-4" />}
            fullWidth
          >
            {t('cultural.bridge.exploreModules')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CulturalBridgeBuilder
