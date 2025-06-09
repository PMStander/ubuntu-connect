import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  FunnelIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import CommunityCard from './CommunityCard'
import CommunityFilters from './CommunityFilters'
import CommunityRecommendations from './CommunityRecommendations'
import { communityDiscoveryService } from '@/services/communityDiscoveryService'
import { Community, CommunitySearch } from '@/types/community'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCultural } from '@/store'
import { useNetworkOptimization } from '@/hooks/useNetworkOptimization'
import { clsx } from 'clsx'

interface CommunityDiscoveryProps {
  onCommunitySelect: (community: Community) => void
}

type DiscoveryTab = 'recommended' | 'nearby' | 'cultural' | 'popular' | 'search'

const CommunityDiscovery: React.FC<CommunityDiscoveryProps> = ({
  onCommunitySelect,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { userCulturalIdentities } = useCultural()
  const { isSlowConnection } = useNetworkOptimization()
  
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('recommended')
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchFilters, setSearchFilters] = useState<CommunitySearch['filters']>({})
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const discoveryTabs = [
    {
      id: 'recommended' as const,
      label: t('communities.discovery.recommended'),
      icon: <SparklesIcon className="w-5 h-5" />,
      description: 'Personalized for you',
    },
    {
      id: 'nearby' as const,
      label: t('communities.discovery.nearby'),
      icon: <MapPinIcon className="w-5 h-5" />,
      description: 'In your area',
    },
    {
      id: 'cultural' as const,
      label: t('communities.discovery.cultural'),
      icon: <GlobeAltIcon className="w-5 h-5" />,
      description: 'Cultural matches',
    },
    {
      id: 'popular' as const,
      label: t('communities.discovery.popular'),
      icon: <UsersIcon className="w-5 h-5" />,
      description: 'Trending now',
    },
    {
      id: 'search' as const,
      label: t('communities.discovery.search'),
      icon: <MagnifyingGlassIcon className="w-5 h-5" />,
      description: 'Find specific',
    },
  ]

  useEffect(() => {
    loadCommunities()
  }, [activeTab, user])

  const loadCommunities = async (loadMore = false) => {
    if (!user) return

    setIsLoading(true)
    try {
      let newCommunities: Community[] = []
      const currentPage = loadMore ? page + 1 : 1

      switch (activeTab) {
        case 'recommended':
          const recommendations = await communityDiscoveryService.generateRecommendations(
            user.uid,
            user as any, // Type assertion for now
            20
          )
          newCommunities = await Promise.all(
            recommendations.map(async (rec) => {
              // Get community details - in real implementation, this would be optimized
              return { id: rec.communityId } as Community // Placeholder
            })
          )
          break

        case 'nearby':
          if (user.location) {
            newCommunities = await communityDiscoveryService.discoverByLocation(
              user.location,
              50, // 50km radius
              20
            )
          }
          break

        case 'cultural':
          newCommunities = await communityDiscoveryService.discoverByCulturalAffinity(
            userCulturalIdentities,
            user.location,
            20
          )
          break

        case 'popular':
          newCommunities = await communityDiscoveryService.discoverPopular(20)
          break

        case 'search':
          if (searchQuery || Object.keys(searchFilters).length > 0) {
            const searchParams: CommunitySearch = {
              query: searchQuery,
              filters: searchFilters,
              sort: { field: 'relevance', direction: 'desc' },
              pagination: { page: currentPage, limit: 20 },
            }
            const result = await communityDiscoveryService.searchCommunities(searchParams)
            newCommunities = result.communities
            setHasMore(result.hasMore)
          }
          break
      }

      if (loadMore) {
        setCommunities(prev => [...prev, ...newCommunities])
        setPage(currentPage)
      } else {
        setCommunities(newCommunities)
        setPage(1)
      }
    } catch (error) {
      console.error('Error loading communities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (activeTab !== 'search') {
      setActiveTab('search')
    }
    await loadCommunities()
  }

  const handleFilterChange = (newFilters: CommunitySearch['filters']) => {
    setSearchFilters(newFilters)
    if (activeTab === 'search') {
      loadCommunities()
    }
  }

  const handleLoadMore = () => {
    loadCommunities(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('communities.discovery.title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('communities.discovery.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder={t('communities.discovery.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-5 h-5" />}
              >
                {t('communities.discovery.filters')}
              </Button>
              <Button
                variant="cultural"
                onClick={handleSearch}
                isLoading={isLoading && activeTab === 'search'}
              >
                {t('communities.discovery.search')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <CommunityFilters
          filters={searchFilters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Discovery Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {discoveryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-cultural-500 text-cultural-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {!isSlowConnection && (
                <span className="hidden sm:inline text-xs text-gray-400">
                  {tab.description}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Recommendations Section (only for recommended tab) */}
      {activeTab === 'recommended' && user && (
        <CommunityRecommendations
          userId={user.uid}
          onCommunitySelect={onCommunitySelect}
        />
      )}

      {/* Communities Grid */}
      <div className="space-y-4">
        {isLoading && communities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64" />
              </div>
            ))}
          </div>
        ) : communities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onClick={() => onCommunitySelect(community)}
                  showDistance={activeTab === 'nearby'}
                  showCulturalMatch={activeTab === 'cultural'}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  isLoading={isLoading}
                >
                  {t('communities.discovery.loadMore')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('communities.discovery.noCommunities')}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'search' 
                  ? t('communities.discovery.noSearchResults')
                  : t('communities.discovery.noCommunitiesDescription')
                }
              </p>
              {activeTab === 'search' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchFilters({})
                    setActiveTab('recommended')
                  }}
                >
                  {t('communities.discovery.clearSearch')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cultural Context Info */}
      <Card variant="cultural">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <GlobeAltIcon className="w-6 h-6 text-cultural-600 mt-1" />
            <div>
              <h4 className="font-medium text-cultural-800 mb-1">
                {t('communities.discovery.culturalContext.title')}
              </h4>
              <p className="text-sm text-cultural-700">
                {t('communities.discovery.culturalContext.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommunityDiscovery
