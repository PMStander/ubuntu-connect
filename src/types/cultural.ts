import { Timestamp } from 'firebase/firestore'

export interface CulturalContent {
  id: string
  culture: string // Cultural group identifier
  type: 'history' | 'tradition' | 'language' | 'recipe' | 'story' | 'achievement'
  title: string
  content: string
  media: {
    images: string[] // Firebase Storage URLs
    videos: string[]
    audio: string[]
    documents: string[]
  }
  author: {
    userId: string
    culturalCredibility: 'community_member' | 'cultural_expert' | 'academic'
    verifiedBy?: string // Cultural representative who verified
  }
  verification: {
    status: 'pending' | 'approved' | 'needs_revision' | 'rejected'
    reviewedBy?: string
    reviewDate?: Timestamp
    notes?: string
    culturalAccuracy: number // 1-5 rating from cultural representatives
  }
  engagement: {
    views: number
    likes: number
    shares: number
    comments: number
    crossCulturalViews: number // Views from other cultural groups
  }
  translations: {
    [languageCode: string]: {
      title: string
      content: string
      translatedBy: 'human' | 'ai'
      quality: 'high' | 'medium' | 'low'
      culturalContextPreserved: boolean
    }
  }
}

export interface CulturalRegion {
  id: string
  name: string
  description: string
  coordinates: {
    latitude: number
    longitude: number
  }[]
  culturalGroups: string[]
  languages: string[]
  traditions: string[]
  historicalSignificance: string
}

export interface CulturalIdentityOption {
  id: string
  name: string
  description: string
  region?: string
  languages: string[]
  traditions: string[]
  connectionTypes: ('heritage' | 'interest' | 'learning' | 'family' | 'community')[]
}

export interface CrossCulturalInteraction {
  id: string
  userId: string
  type: 'message' | 'collaboration' | 'content_view' | 'community_join' | 'skill_exchange'
  sourceCulture: string
  targetCulture: string
  context: string
  timestamp: Timestamp
  diversityScore: number // Contribution to user's diversity score
  bridgeBuilding: boolean // Whether this interaction builds cultural bridges
}

export interface CulturalAnalytics {
  userId: string
  totalInteractions: number
  diversityScore: number // 0-100 cultural diversity engagement
  bridgeConnections: number // Successful cross-cultural connections made
  culturalLearningProgress: Record<string, number> // Learning progress per culture
  culturalContributions: {
    contentSubmitted: number
    contentApproved: number
    communityEndorsements: number
    culturalMentoring: number
  }
  crossCulturalImpact: {
    peopleInfluenced: number
    culturesConnected: string[]
    bridgesBuild: number
    conflictsResolved: number
  }
}

export interface CulturalModerationQueue {
  id: string
  contentId: string
  submittedBy: string
  culturalContext: string
  moderationReason: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedModerator?: string
  culturalRepresentatives: string[] // Cultural reps who should review
  submissionDate: Timestamp
  deadline: Timestamp
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision'
}
