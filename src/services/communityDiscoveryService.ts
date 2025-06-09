import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  GeoPoint,
  startAfter
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { Community, CommunitySearch, CommunityRecommendation } from '@/types/community'
import { User } from '@/types/user'
import { getCulturalIdentitiesByIds } from '@/utils/culturalUtils'

interface LocationCoordinates {
  latitude: number
  longitude: number
}

interface SouthAfricanLocation {
  province: string
  majorCities: string[]
  coordinates: LocationCoordinates
  culturalGroups: string[]
}

class CommunityDiscoveryService {
  // South African geographic and cultural data
  private readonly southAfricanLocations: SouthAfricanLocation[] = [
    {
      province: 'Western Cape',
      majorCities: ['Cape Town', 'Stellenbosch', 'George', 'Worcester'],
      coordinates: { latitude: -33.9249, longitude: 18.4241 },
      culturalGroups: ['afrikaans', 'english', 'coloured', 'xhosa'],
    },
    {
      province: 'Gauteng',
      majorCities: ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton'],
      coordinates: { latitude: -26.2041, longitude: 28.0473 },
      culturalGroups: ['english', 'afrikaans', 'zulu', 'sotho', 'tswana', 'indian'],
    },
    {
      province: 'KwaZulu-Natal',
      majorCities: ['Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay'],
      coordinates: { latitude: -29.8587, longitude: 31.0218 },
      culturalGroups: ['zulu', 'english', 'indian', 'afrikaans'],
    },
    {
      province: 'Eastern Cape',
      majorCities: ['Port Elizabeth', 'East London', 'Grahamstown', 'Uitenhage'],
      coordinates: { latitude: -33.9608, longitude: 25.6022 },
      culturalGroups: ['xhosa', 'english', 'afrikaans'],
    },
    {
      province: 'Limpopo',
      majorCities: ['Polokwane', 'Tzaneen', 'Thohoyandou', 'Giyani'],
      coordinates: { latitude: -23.9045, longitude: 29.4689 },
      culturalGroups: ['venda', 'tsonga', 'sotho', 'ndebele'],
    },
    {
      province: 'Mpumalanga',
      majorCities: ['Nelspruit', 'Witbank', 'Secunda', 'Standerton'],
      coordinates: { latitude: -25.4753, longitude: 30.9698 },
      culturalGroups: ['swazi', 'ndebele', 'zulu', 'tsonga'],
    },
    {
      province: 'North West',
      majorCities: ['Mahikeng', 'Rustenburg', 'Klerksdorp', 'Potchefstroom'],
      coordinates: { latitude: -25.8601, longitude: 25.6384 },
      culturalGroups: ['tswana', 'afrikaans', 'english'],
    },
    {
      province: 'Free State',
      majorCities: ['Bloemfontein', 'Welkom', 'Kroonstad', 'Bethlehem'],
      coordinates: { latitude: -29.1217, longitude: 26.2041 },
      culturalGroups: ['sotho', 'afrikaans', 'english'],
    },
    {
      province: 'Northern Cape',
      majorCities: ['Kimberley', 'Upington', 'Springbok', 'De Aar'],
      coordinates: { latitude: -28.7282, longitude: 24.7499 },
      culturalGroups: ['afrikaans', 'coloured', 'english', 'tswana'],
    },
  ]

  // Discover communities based on user location
  async discoverByLocation(
    userLocation: LocationCoordinates,
    radius: number = 50, // km
    limit: number = 20
  ): Promise<Community[]> {
    try {
      // Find communities within radius
      const q = query(
        collection(db, 'communities'),
        where('isActive', '==', true),
        where('privacy.visibility', 'in', ['public', 'members_only']),
        orderBy('memberCount', 'desc'),
        limit(limit)
      )

      const querySnapshot = await getDocs(q)
      const communities = querySnapshot.docs.map(doc => doc.data() as Community)

      // Filter by distance and sort by proximity
      const nearbyCommunitiesWithDistance = communities
        .map(community => ({
          community,
          distance: this.calculateDistance(userLocation, community.location.coordinates),
        }))
        .filter(item => item.distance <= radius)
        .sort((a, b) => a.distance - b.distance)

      return nearbyCommunitiesWithDistance.map(item => item.community)
    } catch (error) {
      console.error('Error discovering communities by location:', error)
      return []
    }
  }

  // Discover communities based on cultural affinity
  async discoverByCulturalAffinity(
    userCultures: string[],
    userLocation?: LocationCoordinates,
    limit: number = 20
  ): Promise<Community[]> {
    try {
      if (userCultures.length === 0) {
        return this.discoverPopular(limit)
      }

      // Find communities that match user's cultural identities
      const q = query(
        collection(db, 'communities'),
        where('isActive', '==', true),
        where('primaryCultures', 'array-contains-any', userCultures),
        orderBy('analytics.diversityScore', 'desc'),
        limit(limit * 2) // Get more to filter and sort
      )

      const querySnapshot = await getDocs(q)
      const communities = querySnapshot.docs.map(doc => doc.data() as Community)

      // Calculate cultural affinity scores
      const communitiesWithAffinity = communities.map(community => ({
        community,
        affinityScore: this.calculateCulturalAffinity(userCultures, community),
        distance: userLocation && community.location.coordinates 
          ? this.calculateDistance(userLocation, community.location.coordinates)
          : Infinity,
      }))

      // Sort by affinity score and distance
      return communitiesWithAffinity
        .sort((a, b) => {
          if (Math.abs(a.affinityScore - b.affinityScore) < 0.1) {
            return a.distance - b.distance // If affinity is similar, prefer closer
          }
          return b.affinityScore - a.affinityScore // Higher affinity first
        })
        .slice(0, limit)
        .map(item => item.community)
    } catch (error) {
      console.error('Error discovering communities by cultural affinity:', error)
      return []
    }
  }

  // Search communities with filters
  async searchCommunities(searchParams: CommunitySearch): Promise<{
    communities: Community[]
    totalCount: number
    hasMore: boolean
  }> {
    try {
      let q = query(collection(db, 'communities'), where('isActive', '==', true))

      // Apply filters
      if (searchParams.filters.type && searchParams.filters.type.length > 0) {
        q = query(q, where('type', 'in', searchParams.filters.type))
      }

      if (searchParams.filters.cultures && searchParams.filters.cultures.length > 0) {
        q = query(q, where('primaryCultures', 'array-contains-any', searchParams.filters.cultures))
      }

      if (searchParams.filters.membershipType && searchParams.filters.membershipType.length > 0) {
        q = query(q, where('membershipType', 'in', searchParams.filters.membershipType))
      }

      if (searchParams.filters.verificationStatus && searchParams.filters.verificationStatus.length > 0) {
        q = query(q, where('verificationStatus', 'in', searchParams.filters.verificationStatus))
      }

      // Apply sorting
      const sortField = this.mapSortField(searchParams.sort.field)
      q = query(q, orderBy(sortField, searchParams.sort.direction))

      // Apply pagination
      q = query(q, limit(searchParams.pagination.limit))

      const querySnapshot = await getDocs(q)
      const communities = querySnapshot.docs.map(doc => doc.data() as Community)

      // Apply text search if query provided
      let filteredCommunities = communities
      if (searchParams.query) {
        filteredCommunities = this.filterByTextSearch(communities, searchParams.query)
      }

      // Apply location filter if provided
      if (searchParams.filters.location) {
        filteredCommunities = this.filterByLocation(filteredCommunities, searchParams.filters.location)
      }

      // Apply member count range filter
      if (searchParams.filters.memberCountRange) {
        filteredCommunities = this.filterByMemberCount(
          filteredCommunities, 
          searchParams.filters.memberCountRange
        )
      }

      const startIndex = (searchParams.pagination.page - 1) * searchParams.pagination.limit
      const endIndex = startIndex + searchParams.pagination.limit
      const paginatedCommunities = filteredCommunities.slice(startIndex, endIndex)

      return {
        communities: paginatedCommunities,
        totalCount: filteredCommunities.length,
        hasMore: endIndex < filteredCommunities.length,
      }
    } catch (error) {
      console.error('Error searching communities:', error)
      return { communities: [], totalCount: 0, hasMore: false }
    }
  }

  // Generate personalized community recommendations
  async generateRecommendations(
    userId: string,
    userProfile: User,
    limit: number = 10
  ): Promise<CommunityRecommendation[]> {
    try {
      const recommendations: CommunityRecommendation[] = []

      // Get user's current communities to avoid recommending them
      const userCommunities = await this.getUserCommunities(userId)
      const userCommunityIds = new Set(userCommunities.map(c => c.id))

      // Get potential communities
      const [
        culturalMatches,
        locationMatches,
        skillMatches,
        popularCommunities,
      ] = await Promise.all([
        this.discoverByCulturalAffinity(userProfile.profile.culturalIdentities),
        userProfile.profile.location 
          ? this.discoverByLocation(userProfile.profile.location, 100)
          : [],
        this.discoverBySkills(userProfile.skills || {}),
        this.discoverPopular(20),
      ])

      // Combine and deduplicate communities
      const allCommunities = new Map<string, Community>()
      
      culturalMatches.forEach(c => allCommunities.set(c.id, c))
      locationMatches.forEach(c => allCommunities.set(c.id, c))
      skillMatches.forEach(c => allCommunities.set(c.id, c))
      popularCommunities.forEach(c => allCommunities.set(c.id, c))

      // Generate recommendations for each community
      for (const community of allCommunities.values()) {
        if (userCommunityIds.has(community.id)) continue

        const recommendation = this.calculateRecommendationScore(
          userProfile,
          community,
          culturalMatches.includes(community),
          locationMatches.includes(community),
          skillMatches.includes(community)
        )

        if (recommendation.score > 0.3) { // Minimum threshold
          recommendations.push(recommendation)
        }
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  // Get popular/trending communities
  async discoverPopular(limit: number = 20): Promise<Community[]> {
    try {
      const q = query(
        collection(db, 'communities'),
        where('isActive', '==', true),
        where('privacy.visibility', '==', 'public'),
        orderBy('analytics.engagementRate', 'desc'),
        limit(limit)
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as Community)
    } catch (error) {
      console.error('Error discovering popular communities:', error)
      return []
    }
  }

  // Private helper methods
  private calculateDistance(
    point1: LocationCoordinates,
    point2?: LocationCoordinates
  ): number {
    if (!point2) return Infinity

    const R = 6371 // Earth's radius in km
    const dLat = this.toRadians(point2.latitude - point1.latitude)
    const dLon = this.toRadians(point2.longitude - point1.longitude)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * 
      Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private calculateCulturalAffinity(
    userCultures: string[],
    community: Community
  ): number {
    if (userCultures.length === 0 || community.primaryCultures.length === 0) {
      return 0
    }

    const intersection = userCultures.filter(culture => 
      community.primaryCultures.includes(culture)
    )
    
    const union = new Set([...userCultures, ...community.primaryCultures])
    
    // Jaccard similarity with bonus for exact matches
    const jaccardSimilarity = intersection.length / union.size
    const exactMatchBonus = intersection.length / userCultures.length * 0.3
    
    return Math.min(jaccardSimilarity + exactMatchBonus, 1.0)
  }

  private async discoverBySkills(userSkills: Record<string, any>): Promise<Community[]> {
    // This would match communities based on user skills
    // For now, return empty array - would be implemented based on skill matching logic
    return []
  }

  private async getUserCommunities(userId: string): Promise<Community[]> {
    try {
      const q = query(
        collection(db, 'community-members'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      )

      const querySnapshot = await getDocs(q)
      const membershipData = querySnapshot.docs.map(doc => doc.data())

      // Get community details
      const communities: Community[] = []
      for (const membership of membershipData) {
        const communityDoc = await getDoc(doc(db, 'communities', membership.communityId))
        if (communityDoc.exists()) {
          communities.push(communityDoc.data() as Community)
        }
      }

      return communities
    } catch (error) {
      console.error('Error getting user communities:', error)
      return []
    }
  }

  private calculateRecommendationScore(
    userProfile: User,
    community: Community,
    isCulturalMatch: boolean,
    isLocationMatch: boolean,
    isSkillMatch: boolean
  ): CommunityRecommendation {
    const reasons: CommunityRecommendation['reasons'] = []
    let totalScore = 0

    // Cultural affinity (40% weight)
    if (isCulturalMatch) {
      const culturalScore = this.calculateCulturalAffinity(
        userProfile.profile.culturalIdentities,
        community
      )
      totalScore += culturalScore * 0.4
      reasons.push({
        type: 'cultural_match',
        weight: 0.4,
        description: `Matches your cultural interests in ${community.primaryCultures.join(', ')}`,
      })
    }

    // Location proximity (25% weight)
    if (isLocationMatch && userProfile.profile.location && community.location.coordinates) {
      const distance = this.calculateDistance(userProfile.profile.location, community.location.coordinates)
      const locationScore = Math.max(0, 1 - distance / 100) // Normalize to 0-1 over 100km
      totalScore += locationScore * 0.25
      reasons.push({
        type: 'location_proximity',
        weight: 0.25,
        description: `Located ${Math.round(distance)}km from you`,
      })
    }

    // Community activity and size (20% weight)
    const activityScore = this.getActivityScore(community.activityLevel)
    const sizeScore = Math.min(community.memberCount / 1000, 1) // Normalize to 0-1
    const communityScore = (activityScore + sizeScore) / 2
    totalScore += communityScore * 0.2

    // Diversity benefit (15% weight)
    const diversityBenefit = this.calculateDiversityBenefit(userProfile, community)
    totalScore += diversityBenefit * 0.15
    if (diversityBenefit > 0.5) {
      reasons.push({
        type: 'cultural_match',
        weight: 0.15,
        description: 'Would expand your cultural connections',
      })
    }

    return {
      communityId: community.id,
      userId: userProfile.id,
      score: Math.min(totalScore, 1.0),
      reasons,
      culturalAffinityScore: isCulturalMatch ? this.calculateCulturalAffinity(
        userProfile.profile.culturalIdentities,
        community
      ) : 0,
      culturalDiversityBenefit: diversityBenefit,
      generatedAt: new Date() as any,
      algorithm: 'cultural_affinity_v1',
      viewed: false,
      dismissed: false,
    }
  }

  private getActivityScore(activityLevel: Community['activityLevel']): number {
    const scores = {
      very_active: 1.0,
      active: 0.8,
      moderate: 0.6,
      quiet: 0.4,
      inactive: 0.1,
    }
    return scores[activityLevel] || 0.5
  }

  private calculateDiversityBenefit(userProfile: User, community: Community): number {
    const userCultures = new Set(userProfile.profile.culturalIdentities)
    const communityCultures = new Set(community.primaryCultures)
    
    // Calculate how many new cultures the user would be exposed to
    const newCultures = Array.from(communityCultures).filter(culture => !userCultures.has(culture))
    
    return Math.min(newCultures.length / 3, 1.0) // Normalize to 0-1
  }

  private mapSortField(field: CommunitySearch['sort']['field']): string {
    const mapping = {
      relevance: 'analytics.engagementRate',
      memberCount: 'memberCount',
      activityLevel: 'analytics.engagementRate',
      createdAt: 'createdAt',
      distance: 'memberCount', // Fallback since distance is calculated client-side
      culturalMatch: 'analytics.diversityScore',
    }
    return mapping[field] || 'analytics.engagementRate'
  }

  private filterByTextSearch(communities: Community[], query: string): Community[] {
    const searchTerms = query.toLowerCase().split(' ')
    
    return communities.filter(community => {
      const searchableText = [
        community.name,
        community.description,
        ...community.culturalTags,
        ...community.categories,
        community.location.province,
        community.location.city,
      ].join(' ').toLowerCase()

      return searchTerms.every(term => searchableText.includes(term))
    })
  }

  private filterByLocation(
    communities: Community[], 
    locationFilter: CommunitySearch['filters']['location']
  ): Community[] {
    return communities.filter(community => {
      if (locationFilter?.province && community.location.province !== locationFilter.province) {
        return false
      }
      if (locationFilter?.city && community.location.city !== locationFilter.city) {
        return false
      }
      // Radius filtering would be implemented here if user location is provided
      return true
    })
  }

  private filterByMemberCount(
    communities: Community[],
    range: { min?: number; max?: number }
  ): Community[] {
    return communities.filter(community => {
      if (range.min && community.memberCount < range.min) return false
      if (range.max && community.memberCount > range.max) return false
      return true
    })
  }
}

export const communityDiscoveryService = new CommunityDiscoveryService()
