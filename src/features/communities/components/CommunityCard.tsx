import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  UsersIcon,
  MapPinIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Card, { CardContent } from '@/components/ui/Card'
import { Community } from '@/types/community'
import { getCulturalIdentitiesByIds, formatCulturalIdentityNames } from '@/utils/culturalUtils'
import { clsx } from 'clsx'

interface CommunityCardProps {
  community: Community
  onClick: () => void
  showDistance?: boolean
  showCulturalMatch?: boolean
  distance?: number
  culturalMatchScore?: number
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onClick,
  showDistance = false,
  showCulturalMatch = false,
  distance,
  culturalMatchScore,
}) => {
  const { t } = useTranslation()

  const getActivityLevelColor = (level: Community['activityLevel']) => {
    const colors = {
      very_active: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      quiet: 'bg-gray-100 text-gray-800',
      inactive: 'bg-red-100 text-red-800',
    }
    return colors[level] || colors.moderate
  }

  const getActivityLevelText = (level: Community['activityLevel']) => {
    const texts = {
      very_active: t('communities.activity.veryActive'),
      active: t('communities.activity.active'),
      moderate: t('communities.activity.moderate'),
      quiet: t('communities.activity.quiet'),
      inactive: t('communities.activity.inactive'),
    }
    return texts[level] || texts.moderate
  }

  const getMembershipTypeIcon = (type: Community['membershipType']) => {
    switch (type) {
      case 'open':
        return <GlobeAltIcon className="w-4 h-4" />
      case 'invite_only':
      case 'application_required':
      case 'verified_only':
        return <LockClosedIcon className="w-4 h-4" />
      default:
        return <UsersIcon className="w-4 h-4" />
    }
  }

  const getMembershipTypeText = (type: Community['membershipType']) => {
    const texts = {
      open: t('communities.membership.open'),
      invite_only: t('communities.membership.inviteOnly'),
      application_required: t('communities.membership.applicationRequired'),
      verified_only: t('communities.membership.verifiedOnly'),
    }
    return texts[type] || texts.open
  }

  const getVerificationBadge = (status: Community['verificationStatus']) => {
    if (status === 'unverified') return null

    const badges = {
      community_verified: {
        icon: <CheckBadgeIcon className="w-4 h-4" />,
        color: 'text-blue-600',
        text: t('communities.verification.community'),
      },
      culturally_verified: {
        icon: <CheckBadgeIcon className="w-4 h-4" />,
        color: 'text-cultural-600',
        text: t('communities.verification.cultural'),
      },
      officially_verified: {
        icon: <CheckBadgeIcon className="w-4 h-4" />,
        color: 'text-green-600',
        text: t('communities.verification.official'),
      },
    }

    const badge = badges[status]
    if (!badge) return null

    return (
      <div className={clsx('flex items-center space-x-1', badge.color)} title={badge.text}>
        {badge.icon}
      </div>
    )
  }

  const culturalIdentityNames = formatCulturalIdentityNames(community.primaryCultures)

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {community.name}
                </h3>
                {getVerificationBadge(community.verificationStatus)}
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {community.description}
              </p>
            </div>
          </div>

          {/* Cultural Context */}
          {community.primaryCultures.length > 0 && (
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-4 h-4 text-cultural-500" />
              <span className="text-sm text-cultural-700 truncate">
                {culturalIdentityNames}
              </span>
            </div>
          )}

          {/* Location */}
          {community.location.province && (
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {community.location.city && `${community.location.city}, `}
                {community.location.province}
              </span>
              {showDistance && distance && (
                <span className="text-xs text-gray-500">
                  • {Math.round(distance)}km away
                </span>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Member Count */}
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {community.memberCount.toLocaleString()}
                </span>
              </div>

              {/* Membership Type */}
              <div className="flex items-center space-x-1 text-gray-500">
                {getMembershipTypeIcon(community.membershipType)}
                <span className="text-xs">
                  {getMembershipTypeText(community.membershipType)}
                </span>
              </div>
            </div>

            {/* Activity Level */}
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              getActivityLevelColor(community.activityLevel)
            )}>
              {getActivityLevelText(community.activityLevel)}
            </span>
          </div>

          {/* Cultural Match Score */}
          {showCulturalMatch && culturalMatchScore && culturalMatchScore > 0.5 && (
            <div className="flex items-center space-x-2 p-2 bg-cultural-50 rounded-lg">
              <SparklesIcon className="w-4 h-4 text-cultural-600" />
              <span className="text-sm text-cultural-700">
                {Math.round(culturalMatchScore * 100)}% cultural match
              </span>
            </div>
          )}

          {/* Categories */}
          {community.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {community.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
              {community.categories.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{community.categories.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Trust Score Indicator */}
          {community.trustScore > 80 && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckBadgeIcon className="w-4 h-4" />
              <span className="text-xs">Trusted Community</span>
            </div>
          )}

          {/* Cultural Sensitivity Notice */}
          {community.culturalSensitivity === 'members_only' && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Cultural content requires membership
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CommunityCard
