import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc,
  arrayUnion,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { culturalValidationService } from './culturalValidationService'

export interface MarketplaceListing {
  id: string
  listingType: 'skill_request' | 'skill_offering'
  userId: string
  skillId: string
  title: string
  description: string
  culturalContext: CulturalContext[]
  requirements: ListingRequirements
  offering: ListingOffering
  pricing: PricingStructure
  availability: AvailabilityWindow[]
  status: 'active' | 'paused' | 'fulfilled' | 'expired' | 'cancelled'
  views: number
  responses: number
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt: Timestamp
  featuredUntil?: Timestamp
}

export interface ListingRequirements {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  learningFormat: LearningFormat[]
  culturalPreferences: CulturalPreference[]
  languageRequirements: string[]
  timeCommitment: TimeCommitment
  sessionPreferences: SessionPreference
  additionalRequirements?: string
}

export interface ListingOffering {
  expertiseLevel: 'intermediate' | 'advanced' | 'expert' | 'master'
  teachingMethods: TeachingMethod[]
  culturalApproaches: CulturalApproach[]
  portfolioItems: PortfolioItem[]
  certifications: Certification[]
  packages: LearningPackage[]
  uniqueValue: string
  successStories: SuccessStory[]
}

export interface PricingStructure {
  baseRate: number // time credits per hour
  packagePricing: PackagePricing[]
  culturalExchangeRate?: number // discount for cultural knowledge sharing
  alternativeCompensation: AlternativeCompensation[]
  flexibilityOptions: PricingFlexibility
}

export interface KnowledgeExchange {
  id: string
  marketplaceListingId: string
  requesterId: string
  providerId: string
  skillId: string
  exchangeType: 'direct_hire' | 'negotiated' | 'cultural_exchange' | 'barter'
  agreement: ExchangeAgreement
  milestones: ExchangeMilestone[]
  communications: ExchangeMessage[]
  payments: PaymentTransaction[]
  culturalElements: CulturalExchangeElement[]
  status: 'proposed' | 'negotiating' | 'agreed' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  startDate: Timestamp
  expectedEndDate: Timestamp
  actualEndDate?: Timestamp
  satisfaction: MutualSatisfaction
}

export interface ExchangeAgreement {
  learningObjectives: string[]
  deliverables: Deliverable[]
  timeline: TimelineItem[]
  compensationTerms: CompensationTerms
  culturalGuidelines: CulturalGuideline[]
  cancellationPolicy: CancellationPolicy
  intellectualPropertyTerms: IPTerms
  disputeResolutionProcess: DisputeResolution
}

export interface CulturalKnowledgeVerification {
  knowledgeId: string
  culturalOrigin: string
  verificationStatus: 'pending' | 'verified' | 'questioned' | 'rejected'
  verifiers: CulturalVerifier[]
  verificationDate: Timestamp
  culturalContext: string
  traditionalKnowledgeRights: boolean
  communityApproval: boolean
  culturalSensitivityGuidelines: string[]
  appropriatenessRating: number // 1-10
}

export interface MarketplaceAnalytics {
  listingPerformance: ListingMetrics
  exchangeSuccess: ExchangeMetrics
  culturalDiversity: CulturalMetrics
  userEngagement: EngagementMetrics
  qualityIndicators: QualityMetrics
  economicImpact: EconomicMetrics
}

// Supporting interfaces
export interface CulturalContext {
  culture: string
  significance: string
  traditionalMethods: string[]
  modernAdaptations: string[]
}

export interface LearningFormat {
  format: 'online' | 'in_person' | 'hybrid' | 'self_paced' | 'group' | 'workshop'
  preference: number // 1-10
}

export interface CulturalPreference {
  culture: string
  interest: number // 1-10
  currentKnowledge: number // 1-10
  learningGoals: string[]
}

export interface TimeCommitment {
  hoursPerWeek: number
  totalDuration: number // weeks
  flexibility: 'rigid' | 'flexible' | 'very_flexible'
}

export interface SessionPreference {
  duration: number // minutes
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  groupSize: 'individual' | 'small_group' | 'large_group' | 'any'
}

export interface LearningPackage {
  id: string
  name: string
  description: string
  duration: number // hours
  price: number // time credits
  culturalElements: string[]
  outcomes: string[]
}

export interface PackagePricing {
  packageId: string
  originalPrice: number
  discountedPrice: number
  culturalBonus: boolean
}

export interface AlternativeCompensation {
  type: 'skill_exchange' | 'cultural_sharing' | 'community_service' | 'mentorship'
  description: string
  value: number // equivalent time credits
}

export interface PricingFlexibility {
  negotiable: boolean
  scholarshipAvailable: boolean
  culturalExchangeDiscount: number // percentage
  communityMemberDiscount: number // percentage
}

export interface AvailabilityWindow {
  startDate: Timestamp
  endDate: Timestamp
  timeSlots: TimeSlot[]
  culturalConsiderations: string[]
}

export interface TimeSlot {
  dayOfWeek: number // 0-6
  startTime: string // HH:MM
  endTime: string // HH:MM
  timeZone: string
}

class MarketplaceService {
  // Create marketplace listing
  async createMarketplaceListing(listing: Omit<MarketplaceListing, 'id' | 'views' | 'responses' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const listingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Validate cultural content if applicable
      if (listing.culturalContext && listing.culturalContext.length > 0) {
        const validation = await culturalValidationService.validateCulturalContent({
          id: listingId,
          title: listing.title,
          content: listing.description,
          type: 'marketplace_listing',
          culture: listing.culturalContext[0].culture,
          author: {
            userId: listing.userId,
            culturalCredibility: 'community_member',
          },
          verification: {
            status: 'pending',
            reviewedBy: [],
            reviewNotes: [],
            approvedAt: null,
          },
          engagement: {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            crossCulturalViews: 0,
          },
          createdAt: Timestamp.now(),
          lastModified: Timestamp.now(),
        })

        if (!validation.isValid && validation.requiresReview) {
          // Notify cultural representatives for review
          await this.notifyCulturalRepresentatives(
            listing.culturalContext.map(ctx => ctx.culture),
            listingId
          )
        }
      }

      const marketplaceListing: MarketplaceListing = {
        ...listing,
        id: listingId,
        views: 0,
        responses: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, 'marketplace-listings', listingId), marketplaceListing)

      return listingId
    } catch (error) {
      console.error('Error creating marketplace listing:', error)
      throw new Error('Failed to create marketplace listing')
    }
  }

  // Search marketplace listings
  async searchMarketplaceListings(
    searchQuery: {
      query?: string
      category?: string
      culturalContext?: string
      priceRange?: { min: number; max: number }
      location?: string
      availability?: string
      ratingMin?: number
      listingType?: 'skill_request' | 'skill_offering'
    },
    limit_count: number = 20
  ): Promise<MarketplaceListing[]> {
    try {
      let q = query(
        collection(db, 'marketplace-listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      )

      // Apply filters
      if (searchQuery.listingType) {
        q = query(q, where('listingType', '==', searchQuery.listingType))
      }

      const snapshot = await getDocs(q)
      let listings = snapshot.docs.map(doc => doc.data() as MarketplaceListing)

      // Apply additional filters
      if (searchQuery.query) {
        const queryLower = searchQuery.query.toLowerCase()
        listings = listings.filter(listing =>
          listing.title.toLowerCase().includes(queryLower) ||
          listing.description.toLowerCase().includes(queryLower)
        )
      }

      if (searchQuery.culturalContext) {
        listings = listings.filter(listing =>
          listing.culturalContext.some(ctx => ctx.culture === searchQuery.culturalContext)
        )
      }

      if (searchQuery.priceRange) {
        listings = listings.filter(listing =>
          listing.pricing.baseRate >= searchQuery.priceRange!.min &&
          listing.pricing.baseRate <= searchQuery.priceRange!.max
        )
      }

      return listings
    } catch (error) {
      console.error('Error searching marketplace listings:', error)
      throw new Error('Failed to search marketplace listings')
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userId: string, limit_count: number = 10): Promise<MarketplaceListing[]> {
    try {
      // Get user's skill profile to understand interests
      const userProfile = await this.getUserSkillProfile(userId)
      if (!userProfile) {
        // Return general popular listings if no profile
        return this.getPopularListings(limit_count)
      }

      // Find listings that match user's learning goals
      const recommendations: MarketplaceListing[] = []

      for (const learningGoal of userProfile.skillsToLearn) {
        const skillListings = await this.searchMarketplaceListings({
          query: learningGoal.skillName,
          listingType: 'skill_offering',
        }, 5)

        recommendations.push(...skillListings)
      }

      // Find listings that match user's cultural interests
      const culturalInterests = userProfile.skillsToLearn.flatMap(goal => 
        goal.culturalPreferences?.map(pref => pref.culture) || []
      )

      for (const culture of culturalInterests) {
        const culturalListings = await this.searchMarketplaceListings({
          culturalContext: culture,
        }, 3)

        recommendations.push(...culturalListings)
      }

      // Remove duplicates and sort by relevance
      const uniqueRecommendations = recommendations.filter((listing, index, self) =>
        index === self.findIndex(l => l.id === listing.id)
      )

      return uniqueRecommendations.slice(0, limit_count)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      throw new Error('Failed to get personalized recommendations')
    }
  }

  // Initiate knowledge exchange
  async initiateKnowledgeExchange(
    listingId: string,
    requesterId: string,
    proposalMessage: string,
    proposedTerms: Partial<ExchangeAgreement>
  ): Promise<string> {
    try {
      const exchangeId = `exchange-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Get listing details
      const listingDoc = await getDoc(doc(db, 'marketplace-listings', listingId))
      if (!listingDoc.exists()) {
        throw new Error('Listing not found')
      }

      const listing = listingDoc.data() as MarketplaceListing
      
      const knowledgeExchange: KnowledgeExchange = {
        id: exchangeId,
        marketplaceListingId: listingId,
        requesterId,
        providerId: listing.userId,
        skillId: listing.skillId,
        exchangeType: 'negotiated',
        agreement: {
          learningObjectives: proposedTerms.learningObjectives || [],
          deliverables: proposedTerms.deliverables || [],
          timeline: proposedTerms.timeline || [],
          compensationTerms: proposedTerms.compensationTerms || {
            type: 'time_credits',
            amount: listing.pricing.baseRate,
            schedule: 'per_session',
          },
          culturalGuidelines: proposedTerms.culturalGuidelines || [],
          cancellationPolicy: proposedTerms.cancellationPolicy || {
            noticePeriod: 24, // hours
            refundPolicy: 'partial',
          },
          intellectualPropertyTerms: proposedTerms.intellectualPropertyTerms || {
            ownershipRights: 'shared',
            attributionRequired: true,
          },
          disputeResolutionProcess: proposedTerms.disputeResolutionProcess || {
            steps: ['direct_negotiation', 'mediation', 'arbitration'],
            culturalMediationAvailable: true,
          },
        },
        milestones: [],
        communications: [{
          id: `msg-${Date.now()}`,
          senderId: requesterId,
          message: proposalMessage,
          timestamp: Timestamp.now(),
          type: 'proposal',
        }],
        payments: [],
        culturalElements: listing.culturalContext.map(ctx => ({
          culture: ctx.culture,
          significance: ctx.significance,
          learningObjectives: [`Understand ${ctx.culture} cultural context`],
          respectGuidelines: ['Approach with cultural humility', 'Ask questions respectfully'],
        })),
        status: 'proposed',
        startDate: Timestamp.now(),
        expectedEndDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
        satisfaction: {
          requesterRating: 0,
          providerRating: 0,
          culturalRespectRating: 0,
          learningOutcomeRating: 0,
          overallSatisfaction: 0,
        },
      }

      await setDoc(doc(db, 'knowledge-exchanges', exchangeId), knowledgeExchange)

      // Update listing response count
      await updateDoc(doc(db, 'marketplace-listings', listingId), {
        responses: listing.responses + 1,
        updatedAt: Timestamp.now(),
      })

      return exchangeId
    } catch (error) {
      console.error('Error initiating knowledge exchange:', error)
      throw new Error('Failed to initiate knowledge exchange')
    }
  }

  // Update knowledge exchange status
  async updateKnowledgeExchangeStatus(
    exchangeId: string,
    status: KnowledgeExchange['status'],
    notes?: string
  ): Promise<void> {
    try {
      const exchangeRef = doc(db, 'knowledge-exchanges', exchangeId)
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      }

      if (status === 'agreed') {
        updateData.startDate = Timestamp.now()
      } else if (status === 'completed') {
        updateData.actualEndDate = Timestamp.now()
      }

      if (notes) {
        updateData.statusNotes = notes
      }

      await updateDoc(exchangeRef, updateData)
    } catch (error) {
      console.error('Error updating knowledge exchange status:', error)
      throw new Error('Failed to update knowledge exchange status')
    }
  }

  // Get user's marketplace listings
  async getUserMarketplaceListings(userId: string): Promise<MarketplaceListing[]> {
    try {
      const q = query(
        collection(db, 'marketplace-listings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as MarketplaceListing)
    } catch (error) {
      console.error('Error getting user marketplace listings:', error)
      throw new Error('Failed to get user marketplace listings')
    }
  }

  // Get user's knowledge exchanges
  async getUserKnowledgeExchanges(userId: string, role?: 'requester' | 'provider'): Promise<KnowledgeExchange[]> {
    try {
      let q
      
      if (role === 'requester') {
        q = query(
          collection(db, 'knowledge-exchanges'),
          where('requesterId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      } else if (role === 'provider') {
        q = query(
          collection(db, 'knowledge-exchanges'),
          where('providerId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      } else {
        // Get both requester and provider exchanges
        const requesterQuery = query(
          collection(db, 'knowledge-exchanges'),
          where('requesterId', '==', userId),
          orderBy('createdAt', 'desc')
        )
        
        const providerQuery = query(
          collection(db, 'knowledge-exchanges'),
          where('providerId', '==', userId),
          orderBy('createdAt', 'desc')
        )

        const [requesterSnapshot, providerSnapshot] = await Promise.all([
          getDocs(requesterQuery),
          getDocs(providerQuery)
        ])

        const requesterExchanges = requesterSnapshot.docs.map(doc => doc.data() as KnowledgeExchange)
        const providerExchanges = providerSnapshot.docs.map(doc => doc.data() as KnowledgeExchange)

        return [...requesterExchanges, ...providerExchanges]
          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as KnowledgeExchange)
    } catch (error) {
      console.error('Error getting user knowledge exchanges:', error)
      throw new Error('Failed to get user knowledge exchanges')
    }
  }

  // Get featured listings
  async getFeaturedListings(limit_count: number = 10): Promise<MarketplaceListing[]> {
    try {
      const q = query(
        collection(db, 'marketplace-listings'),
        where('status', '==', 'active'),
        where('featuredUntil', '>', Timestamp.now()),
        orderBy('featuredUntil', 'desc'),
        limit(limit_count)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as MarketplaceListing)
    } catch (error) {
      console.error('Error getting featured listings:', error)
      throw new Error('Failed to get featured listings')
    }
  }

  // Get popular listings
  async getPopularListings(limit_count: number = 10): Promise<MarketplaceListing[]> {
    try {
      const q = query(
        collection(db, 'marketplace-listings'),
        where('status', '==', 'active'),
        orderBy('views', 'desc'),
        limit(limit_count)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as MarketplaceListing)
    } catch (error) {
      console.error('Error getting popular listings:', error)
      throw new Error('Failed to get popular listings')
    }
  }

  // Increment listing views
  async incrementListingViews(listingId: string): Promise<void> {
    try {
      const listingRef = doc(db, 'marketplace-listings', listingId)
      const listingDoc = await getDoc(listingRef)
      
      if (listingDoc.exists()) {
        const currentViews = listingDoc.data().views || 0
        await updateDoc(listingRef, {
          views: currentViews + 1,
          updatedAt: Timestamp.now(),
        })
      }
    } catch (error) {
      console.error('Error incrementing listing views:', error)
      // Don't throw error for view tracking
    }
  }

  // Private helper methods
  private async getUserSkillProfile(userId: string): Promise<any> {
    try {
      const q = query(
        collection(db, 'skill-profiles'),
        where('userId', '==', userId),
        limit(1)
      )

      const snapshot = await getDocs(q)
      return snapshot.empty ? null : snapshot.docs[0].data()
    } catch (error) {
      console.error('Error getting user skill profile:', error)
      return null
    }
  }

  private async notifyCulturalRepresentatives(cultures: string[], listingId: string): Promise<void> {
    // TODO: Implement notification system for cultural representatives
    console.log(`Notifying cultural representatives for cultures: ${cultures.join(', ')} about listing: ${listingId}`)
  }
}

export const marketplaceService = new MarketplaceService()
