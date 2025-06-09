import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SparklesIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import CommunityCard from './CommunityCard'
import { communityDiscoveryService } from '@/services/communityDiscoveryService'
import { Community, CommunityRecommendation } from '@/types/community'
import { clsx } from 'clsx'

interface CommunityRecommendationsProps {
  userId: string
  onCommunitySelect: (community: Community) => void
  limit?: number
}

const CommunityRecommendations: React.FC<CommunityRecommendationsProps> = ({
  userId,
  onCommunitySelect,
  limit = 6,
}) => {
  const { t } = useTranslation()
  const [recommendations, setRecommendations] = useState<CommunityRecommendation[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRecommendations()
  }, [userId])

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, we would get the full user profile
      const userProfile = { id: userId } as any // Placeholder
      
      const recs = await communityDiscoveryService.generateRecommendations(
        userId,
        userProfile,
        limit
      )
      
      setRecommendations(recs)
      
      // Load community details for each recommendation
      // In a real implementation, this would be optimized with batch loading
      const communityDetails: Community[] = []
      for (const rec of recs) {
        // Placeholder - would fetch actual community data
        const community: Community = {
          id: rec.communityId,
          name: `Community ${rec.communityId}`,
          description: 'A vibrant community focused on cultural exchange',
          type: 'cultural',
          primaryCultures: ['zulu', 'english'],
          culturalTags: ['traditional', 'modern'],
          culturalSensitivity: 'respectful',
          location: {
            type: 'province',
            province: 'Gauteng',
            city: 'Johannesburg',
          },
          membershipType: 'open',
          memberCount: Math.floor(Math.random() * 1000) + 50,
          leaders: [],
          categories: ['culture', 'education'],
          languages: ['en', 'zu'],
          activityLevel: 'active',
          verificationStatus: 'community_verified',
          trustScore: 85,
          privacy: {
            visibility: 'public',
            contentSharing: 'members_only',
            memberListVisible: true,
            requireApproval: false,
          },
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          createdBy: 'creator-id',
          isActive: true,
          analytics: {
            totalPosts: 150,
            totalEvents: 12,
            engagementRate: 0.75,
            diversityScore: 0.8,
            crossCulturalConnections: 45,
            retentionRate: 0.85,
          },
          guidelines: {
            description: 'Community guidelines',
            rules: [],
            culturalGuidelines: [],
            consequences: [],
            lastUpdated: new Date() as any,
          },
        }
        communityDetails.push(community)
      }
      
      setCommunities(communityDetails)
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]))
    // In a real implementation, this would also update the backend
  }

  const getRecommendationReasons = (recommendation: CommunityRecommendation) => {
    return recommendation.reasons
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 2) // Show top 2 reasons
  }

  const getRecommendationStrengthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getRecommendationStrengthText = (score: number) => {
    if (score >= 0.8) return t('communities.recommendations.strength.excellent')
    if (score >= 0.6) return t('communities.recommendations.strength.good')
    if (score >= 0.4) return t('communities.recommendations.strength.fair')
    return t('communities.recommendations.strength.low')
  }

  const visibleRecommendations = recommendations.filter(
    rec => !dismissedRecommendations.has(rec.communityId)
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-cultural-600" />
            <span>{t('communities.recommendations.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (visibleRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-cultural-600" />
            <span>{t('communities.recommendations.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('communities.recommendations.noRecommendations')}
            </h3>
            <p className="text-gray-600">
              {t('communities.recommendations.noRecommendationsDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-cultural-600" />
          <span>{t('communities.recommendations.title')}</span>
          <span className="text-sm font-normal text-gray-500">
            ({visibleRecommendations.length} {t('communities.recommendations.suggestions')})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleRecommendations.map((recommendation, index) => {
            const community = communities.find(c => c.id === recommendation.communityId)
            if (!community) return null

            const reasons = getRecommendationReasons(recommendation)

            return (
              <div key={recommendation.communityId} className="relative">
                {/* Recommendation Strength Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getRecommendationStrengthColor(recommendation.score)
                    )}>
                      {Math.round(recommendation.score * 100)}% {getRecommendationStrengthText(recommendation.score)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissRecommendation(recommendation.communityId)}
                      className="p-1 h-6 w-6"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Community Card */}
                <div className="pr-24">
                  <CommunityCard
                    community={community}
                    onClick={() => onCommunitySelect(community)}
                    showCulturalMatch={true}
                    culturalMatchScore={recommendation.culturalAffinityScore}
                  />
                </div>

                {/* Recommendation Reasons */}
                <div className="mt-2 p-3 bg-cultural-50 rounded-lg">
                  <h5 className="text-sm font-medium text-cultural-800 mb-2">
                    {t('communities.recommendations.whyRecommended')}
                  </h5>
                  <div className="space-y-1">
                    {reasons.map((reason, reasonIndex) => (
                      <div key={reasonIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cultural-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-cultural-700">
                          {reason.description}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cultural Diversity Benefit */}
                  {recommendation.culturalDiversityBenefit > 0.5 && (
                    <div className="mt-2 p-2 bg-ubuntu-50 border border-ubuntu-200 rounded">
                      <span className="text-xs text-ubuntu-700">
                        🌍 {t('communities.recommendations.diversityBenefit')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* View More Button */}
        {recommendations.length > limit && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              leftIcon={<EyeIcon className="w-4 h-4" />}
            >
              {t('communities.recommendations.viewMore')}
            </Button>
          </div>
        )}

        {/* Recommendation Info */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 {t('communities.recommendations.info')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityRecommendations
