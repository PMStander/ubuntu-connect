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
import { CulturalHeritageContent } from './culturalHeritageService'

export interface ContentRecommendation {
  id: string
  userId: string
  contentId: string
  contentType: 'heritage' | 'learning_path' | 'project' | 'story' | 'community'
  recommendationType: 'cultural_interest' | 'learning_goal' | 'trending' | 'bridge_building' | 'similar_users'
  score: number // 0-100
  reasoning: {
    primaryFactors: string[]
    culturalRelevance: string[]
    learningOpportunities: string[]
    bridgeBuildingPotential: string[]
  }
  culturalSensitivity: {
    appropriateForUser: boolean
    requiresContext: boolean
    culturalPreparation?: string[]
    respectfulApproach: string[]
  }
  createdAt: Timestamp
  expiresAt: Timestamp
  status: 'pending' | 'viewed' | 'engaged' | 'dismissed' | 'expired'
}

export interface TrendingTopic {
  id: string
  topic: string
  culturalGroup?: string
  region?: string
  type: 'heritage' | 'tradition' | 'event' | 'discussion' | 'learning'
  engagement: {
    views: number
    interactions: number
    shares: number
    culturalParticipation: Record<string, number> // culture -> participation count
  }
  trendMetrics: {
    growthRate: number // percentage
    peakTime: Timestamp
    duration: number // hours
    crossCulturalAppeal: number // 0-100
  }
  content: {
    relatedContentIds: string[]
    keyTopics: string[]
    culturalContext: string
    sensitivityLevel: 'low' | 'medium' | 'high'
  }
  moderation: {
    verified: boolean
    culturallyAppropriate: boolean
    reviewedBy: string[]
    warnings?: string[]
  }
  createdAt: Timestamp
  lastUpdated: Timestamp
}

export interface PersonalizedDashboard {
  userId: string
  culturalLearningProgress: {
    [cultureId: string]: {
      level: number // 0-100
      completedPaths: string[]
      currentPaths: string[]
      achievements: string[]
      nextRecommendations: string[]
    }
  }
  contentInteractions: {
    viewedContent: string[]
    likedContent: string[]
    sharedContent: string[]
    createdContent: string[]
    bookmarkedContent: string[]
  }
  bridgeBuildingMetrics: {
    crossCulturalConnections: number
    culturalBridgeScore: number // 0-100
    mentorshipParticipation: number
    collaborativeProjects: number
    communityContributions: number
  }
  recommendations: {
    dailyRecommendations: ContentRecommendation[]
    weeklyGoals: string[]
    culturalChallenges: string[]
    learningOpportunities: string[]
  }
  preferences: {
    contentTypes: string[]
    culturalInterests: string[]
    learningGoals: string[]
    notificationSettings: Record<string, boolean>
  }
  lastUpdated: Timestamp
}

export interface ContentModerationResult {
  contentId: string
  moderationType: 'ai_initial' | 'community_review' | 'cultural_representative' | 'expert_review'
  result: 'approved' | 'rejected' | 'needs_revision' | 'needs_cultural_review'
  concerns: string[]
  recommendations: string[]
  culturalSensitivity: {
    appropriationRisk: number // 0-100
    culturalAccuracy: number // 0-100
    respectfulPresentation: number // 0-100
    communityBenefit: number // 0-100
  }
  moderatorId?: string
  moderatedAt: Timestamp
  reviewNotes?: string
}

class ContentDiscoveryService {
  // Generate personalized content recommendations
  async generatePersonalizedRecommendations(userId: string, limit_count: number = 10): Promise<ContentRecommendation[]> {
    try {
      // Get user profile and preferences
      const userDashboard = await this.getPersonalizedDashboard(userId)
      if (!userDashboard) {
        throw new Error('User dashboard not found')
      }

      const recommendations: ContentRecommendation[] = []

      // Cultural interest-based recommendations
      for (const culture of userDashboard.preferences.culturalInterests) {
        const culturalContent = await this.getContentByCulture(culture, 3)
        
        for (const content of culturalContent) {
          const recommendation = await this.createContentRecommendation(
            userId,
            content.id,
            'heritage',
            'cultural_interest',
            culture
          )
          recommendations.push(recommendation)
        }
      }

      // Learning goal-based recommendations
      const learningRecommendations = await this.generateLearningRecommendations(userId, userDashboard)
      recommendations.push(...learningRecommendations)

      // Trending content recommendations
      const trendingRecommendations = await this.generateTrendingRecommendations(userId, 3)
      recommendations.push(...trendingRecommendations)

      // Bridge-building opportunities
      const bridgeRecommendations = await this.generateBridgeBuildingRecommendations(userId, 2)
      recommendations.push(...bridgeRecommendations)

      // Sort by score and return top recommendations
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit_count)

      // Save recommendations to user dashboard
      await this.saveRecommendationsToUser(userId, sortedRecommendations)

      return sortedRecommendations
    } catch (error) {
      console.error('Error generating personalized recommendations:', error)
      throw new Error('Failed to generate personalized recommendations')
    }
  }

  // Discover trending cultural topics
  async discoverTrendingTopics(region?: string, culturalGroup?: string): Promise<TrendingTopic[]> {
    try {
      let q = query(
        collection(db, 'trending-topics'),
        where('moderation.verified', '==', true),
        orderBy('trendMetrics.growthRate', 'desc'),
        limit(20)
      )

      if (region) {
        q = query(q, where('region', '==', region))
      }

      if (culturalGroup) {
        q = query(q, where('culturalGroup', '==', culturalGroup))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as TrendingTopic)
    } catch (error) {
      console.error('Error discovering trending topics:', error)
      throw new Error('Failed to discover trending topics')
    }
  }

  // Moderate content for cultural sensitivity
  async moderateContent(
    contentId: string, 
    contentType: string, 
    content: any
  ): Promise<ContentModerationResult> {
    try {
      // AI-based initial moderation
      const aiModeration = await this.performAIModeration(content)
      
      // Cultural sensitivity analysis
      const culturalAnalysis = await this.analyzeCulturalSensitivity(content)
      
      // Determine if cultural representative review is needed
      const needsCulturalReview = 
        aiModeration.culturalSensitivity.appropriationRisk > 30 ||
        culturalAnalysis.requiresReview ||
        content.metadata?.culturalSignificance === 'sacred'

      const moderationResult: ContentModerationResult = {
        contentId,
        moderationType: 'ai_initial',
        result: needsCulturalReview ? 'needs_cultural_review' : 
                aiModeration.isValid ? 'approved' : 'needs_revision',
        concerns: aiModeration.concerns,
        recommendations: aiModeration.recommendations,
        culturalSensitivity: {
          appropriationRisk: aiModeration.culturalSensitivity.appropriationRisk,
          culturalAccuracy: culturalAnalysis.accuracyScore,
          respectfulPresentation: aiModeration.culturalSensitivity.respectfulPresentation,
          communityBenefit: this.calculateCommunityBenefit(content),
        },
        moderatedAt: Timestamp.now(),
      }

      // Save moderation result
      await setDoc(doc(db, 'content-moderation', contentId), moderationResult)

      // If needs cultural review, notify representatives
      if (needsCulturalReview) {
        await this.notifyCulturalRepresentatives(content.culturalGroup || [], contentId)
      }

      return moderationResult
    } catch (error) {
      console.error('Error moderating content:', error)
      throw new Error('Failed to moderate content')
    }
  }

  // Get or create personalized dashboard
  async getPersonalizedDashboard(userId: string): Promise<PersonalizedDashboard | null> {
    try {
      const docRef = doc(db, 'personalized-dashboards', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as PersonalizedDashboard
      }
      
      // Create default dashboard if doesn't exist
      const defaultDashboard: PersonalizedDashboard = {
        userId,
        culturalLearningProgress: {},
        contentInteractions: {
          viewedContent: [],
          likedContent: [],
          sharedContent: [],
          createdContent: [],
          bookmarkedContent: [],
        },
        bridgeBuildingMetrics: {
          crossCulturalConnections: 0,
          culturalBridgeScore: 0,
          mentorshipParticipation: 0,
          collaborativeProjects: 0,
          communityContributions: 0,
        },
        recommendations: {
          dailyRecommendations: [],
          weeklyGoals: [],
          culturalChallenges: [],
          learningOpportunities: [],
        },
        preferences: {
          contentTypes: ['heritage', 'story', 'tradition'],
          culturalInterests: [],
          learningGoals: [],
          notificationSettings: {},
        },
        lastUpdated: Timestamp.now(),
      }

      await setDoc(docRef, defaultDashboard)
      return defaultDashboard
    } catch (error) {
      console.error('Error getting personalized dashboard:', error)
      throw new Error('Failed to get personalized dashboard')
    }
  }

  // Update content interaction
  async updateContentInteraction(
    userId: string, 
    contentId: string, 
    interactionType: 'view' | 'like' | 'share' | 'bookmark' | 'comment'
  ): Promise<void> {
    try {
      const dashboardRef = doc(db, 'personalized-dashboards', userId)
      
      const updateField = `contentInteractions.${interactionType === 'view' ? 'viewedContent' :
                          interactionType === 'like' ? 'likedContent' :
                          interactionType === 'share' ? 'sharedContent' :
                          'bookmarkedContent'}`

      await updateDoc(dashboardRef, {
        [updateField]: arrayUnion(contentId),
        lastUpdated: Timestamp.now(),
      })

      // Update content engagement metrics
      await this.updateContentEngagement(contentId, interactionType)
    } catch (error) {
      console.error('Error updating content interaction:', error)
      throw new Error('Failed to update content interaction')
    }
  }

  // Verify content accuracy
  async verifyContentAccuracy(
    contentId: string, 
    verifierId: string, 
    accuracyScore: number, 
    notes?: string
  ): Promise<void> {
    try {
      const verificationRef = doc(db, 'content-verifications', `${contentId}-${verifierId}`)
      
      await setDoc(verificationRef, {
        contentId,
        verifierId,
        accuracyScore,
        notes: notes || '',
        verifiedAt: Timestamp.now(),
        verifierType: 'cultural_representative', // TODO: Determine from user role
      })

      // Update content's overall accuracy score
      await this.updateContentAccuracyScore(contentId)
    } catch (error) {
      console.error('Error verifying content accuracy:', error)
      throw new Error('Failed to verify content accuracy')
    }
  }

  // Private helper methods
  private async getContentByCulture(culture: string, limit_count: number): Promise<CulturalHeritageContent[]> {
    try {
      const q = query(
        collection(db, 'cultural-heritage'),
        where('culturalGroup', 'array-contains', culture),
        where('validation.status', '==', 'approved'),
        orderBy('engagement.views', 'desc'),
        limit(limit_count)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as CulturalHeritageContent)
    } catch (error) {
      console.error('Error getting content by culture:', error)
      return []
    }
  }

  private async createContentRecommendation(
    userId: string,
    contentId: string,
    contentType: string,
    recommendationType: string,
    culturalContext?: string
  ): Promise<ContentRecommendation> {
    const recommendationId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: recommendationId,
      userId,
      contentId,
      contentType: contentType as any,
      recommendationType: recommendationType as any,
      score: Math.floor(Math.random() * 40) + 60, // 60-100 range
      reasoning: {
        primaryFactors: [`Matches your interest in ${culturalContext}`],
        culturalRelevance: [`Related to ${culturalContext} culture`],
        learningOpportunities: ['Cultural understanding', 'Cross-cultural awareness'],
        bridgeBuildingPotential: ['Connect with community members'],
      },
      culturalSensitivity: {
        appropriateForUser: true,
        requiresContext: false,
        respectfulApproach: ['Approach with openness and respect'],
      },
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
      status: 'pending',
    }
  }

  private async performAIModeration(content: any): Promise<any> {
    // Simplified AI moderation - in production, integrate with actual AI service
    return {
      isValid: true,
      concerns: [],
      recommendations: [],
      culturalSensitivity: {
        appropriationRisk: Math.floor(Math.random() * 30), // 0-30 range for approved content
        respectfulPresentation: Math.floor(Math.random() * 20) + 80, // 80-100 range
      },
    }
  }

  private async analyzeCulturalSensitivity(content: any): Promise<any> {
    return culturalValidationService.validateCulturalContent(content)
  }

  private calculateCommunityBenefit(content: any): number {
    // Calculate based on educational value, cultural preservation, etc.
    return Math.floor(Math.random() * 20) + 80 // 80-100 range
  }

  private async generateLearningRecommendations(userId: string, dashboard: PersonalizedDashboard): Promise<ContentRecommendation[]> {
    // TODO: Implement learning-based recommendations
    return []
  }

  private async generateTrendingRecommendations(userId: string, limit_count: number): Promise<ContentRecommendation[]> {
    // TODO: Implement trending-based recommendations
    return []
  }

  private async generateBridgeBuildingRecommendations(userId: string, limit_count: number): Promise<ContentRecommendation[]> {
    // TODO: Implement bridge-building recommendations
    return []
  }

  private async saveRecommendationsToUser(userId: string, recommendations: ContentRecommendation[]): Promise<void> {
    const dashboardRef = doc(db, 'personalized-dashboards', userId)
    await updateDoc(dashboardRef, {
      'recommendations.dailyRecommendations': recommendations,
      lastUpdated: Timestamp.now(),
    })
  }

  private async updateContentEngagement(contentId: string, interactionType: string): Promise<void> {
    // TODO: Update content engagement metrics
  }

  private async updateContentAccuracyScore(contentId: string): Promise<void> {
    // TODO: Calculate and update overall accuracy score
  }

  private async notifyCulturalRepresentatives(culturalGroups: string[], contentId: string): Promise<void> {
    // TODO: Implement notification system
    console.log(`Notifying cultural representatives for ${culturalGroups.join(', ')} about content ${contentId}`)
  }
}

export const contentDiscoveryService = new ContentDiscoveryService()
