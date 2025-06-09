import { Timestamp } from 'firebase/firestore'

export interface Community {
  id: string
  name: string
  description: string
  type: 'cultural' | 'skill_based' | 'location_based' | 'interest_based' | 'mixed'
  
  // Cultural Context
  primaryCultures: string[] // Cultural identities this community focuses on
  culturalTags: string[] // Cultural themes, traditions, practices
  culturalSensitivity: 'open' | 'respectful' | 'members_only' // Access level for cultural content
  
  // Location
  location: {
    type: 'global' | 'country' | 'province' | 'city' | 'neighborhood'
    country?: string
    province?: string
    city?: string
    coordinates?: {
      latitude: number
      longitude: number
      radius: number // in kilometers
    }
  }
  
  // Membership
  membershipType: 'open' | 'invite_only' | 'application_required' | 'verified_only'
  memberCount: number
  maxMembers?: number
  
  // Leadership
  leaders: {
    userId: string
    role: 'founder' | 'admin' | 'moderator' | 'cultural_representative'
    appointedDate: Timestamp
    culturalCredibility?: number
  }[]
  
  // Content & Activity
  categories: string[] // e.g., ['education', 'arts', 'business', 'social']
  languages: string[] // Primary languages used in community
  activityLevel: 'very_active' | 'active' | 'moderate' | 'quiet' | 'inactive'
  
  // Verification & Trust
  verificationStatus: 'unverified' | 'community_verified' | 'culturally_verified' | 'officially_verified'
  verifiedBy?: string // User ID of verifier
  verificationDate?: Timestamp
  trustScore: number // 0-100 based on community behavior and reporting
  
  // Privacy & Safety
  privacy: {
    visibility: 'public' | 'members_only' | 'invite_only'
    contentSharing: 'open' | 'members_only' | 'leaders_only'
    memberListVisible: boolean
    requireApproval: boolean
  }
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  isActive: boolean
  
  // Analytics
  analytics: {
    totalPosts: number
    totalEvents: number
    engagementRate: number
    diversityScore: number // Cultural diversity within community
    crossCulturalConnections: number
    retentionRate: number
  }
  
  // Community Guidelines
  guidelines: {
    description: string
    rules: string[]
    culturalGuidelines: string[]
    consequences: string[]
    lastUpdated: Timestamp
  }
}

export interface CommunityMember {
  userId: string
  communityId: string
  role: 'member' | 'moderator' | 'admin' | 'cultural_representative'
  joinedAt: Timestamp
  invitedBy?: string
  
  // Participation
  participationLevel: 'lurker' | 'occasional' | 'regular' | 'active' | 'super_active'
  contributionScore: number // Based on posts, comments, events, etc.
  culturalContributions: number // Cultural content shared
  
  // Cultural Context
  culturalRole?: 'knowledge_keeper' | 'translator' | 'event_organizer' | 'mentor' | 'bridge_builder'
  culturalEndorsements: number // Endorsements from other cultural members
  
  // Status
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  lastActive: Timestamp
  
  // Preferences
  notifications: {
    posts: boolean
    events: boolean
    mentions: boolean
    culturalContent: boolean
  }
}

export interface CommunityInvitation {
  id: string
  communityId: string
  invitedBy: string
  invitedUser: string
  invitedEmail?: string
  
  // Cultural Context
  culturalContext?: string // Why this person was invited (cultural connection, skills, etc.)
  personalMessage?: string
  
  // Status
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: Timestamp
  respondedAt?: Timestamp
  expiresAt: Timestamp
}

export interface CommunityRecommendation {
  communityId: string
  userId: string
  score: number // 0-100 recommendation strength
  reasons: {
    type: 'cultural_match' | 'location_proximity' | 'skill_alignment' | 'interest_overlap' | 'social_connection'
    weight: number
    description: string
  }[]
  
  // Cultural Factors
  culturalAffinityScore: number
  culturalDiversityBenefit: number // How joining would increase user's cultural exposure
  
  // Generated
  generatedAt: Timestamp
  algorithm: string // Which recommendation algorithm was used
  
  // User Interaction
  viewed: boolean
  viewedAt?: Timestamp
  dismissed: boolean
  dismissedAt?: Timestamp
  dismissReason?: string
}

export interface CommunitySearch {
  query?: string
  filters: {
    type?: Community['type'][]
    cultures?: string[]
    location?: {
      province?: string
      city?: string
      radius?: number // km from user's location
    }
    membershipType?: Community['membershipType'][]
    languages?: string[]
    categories?: string[]
    verificationStatus?: Community['verificationStatus'][]
    activityLevel?: Community['activityLevel'][]
    memberCountRange?: {
      min?: number
      max?: number
    }
  }
  sort: {
    field: 'relevance' | 'memberCount' | 'activityLevel' | 'createdAt' | 'distance' | 'culturalMatch'
    direction: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
  }
}

export interface CommunityAnalytics {
  communityId: string
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  startDate: Timestamp
  endDate: Timestamp
  
  // Membership Analytics
  membershipGrowth: {
    newMembers: number
    leftMembers: number
    netGrowth: number
    retentionRate: number
  }
  
  // Engagement Analytics
  engagement: {
    totalPosts: number
    totalComments: number
    totalReactions: number
    averageEngagementRate: number
    topContributors: string[] // User IDs
  }
  
  // Cultural Analytics
  cultural: {
    diversityScore: number // How culturally diverse the community is
    crossCulturalInteractions: number
    culturalContentShared: number
    culturalEventsHosted: number
    bridgeConnections: number // Connections made between different cultures
  }
  
  // Geographic Analytics
  geographic: {
    memberDistribution: Record<string, number> // Province/city -> member count
    localEngagement: number // Engagement from local members
    globalReach: number // Members from outside primary location
  }
  
  // Content Analytics
  content: {
    postsByCategory: Record<string, number>
    postsByLanguage: Record<string, number>
    mostPopularContent: string[] // Content IDs
    contentModerationActions: number
  }
}

export interface CommunityEvent {
  id: string
  communityId: string
  title: string
  description: string
  
  // Cultural Context
  culturalSignificance?: string
  culturalTraditions?: string[]
  culturalSensitivity: 'open' | 'respectful' | 'cultural_members_only'
  
  // Event Details
  type: 'online' | 'in_person' | 'hybrid'
  startDate: Timestamp
  endDate: Timestamp
  location?: {
    name: string
    address: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  
  // Participation
  maxAttendees?: number
  currentAttendees: number
  requiresApproval: boolean
  cost?: {
    amount: number
    currency: string
    description: string
  }
  
  // Organization
  organizers: string[] // User IDs
  culturalRepresentatives?: string[] // Cultural experts involved
  
  // Status
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Timestamp
  createdBy: string
}

export interface CommunityPost {
  id: string
  communityId: string
  authorId: string
  
  // Content
  title?: string
  content: string
  media: {
    images: string[]
    videos: string[]
    documents: string[]
  }
  
  // Cultural Context
  culturalContext?: string
  culturalTags?: string[]
  culturalSensitivity: 'general' | 'cultural_context' | 'sacred' | 'educational'
  
  // Engagement
  reactions: Record<string, string[]> // reaction type -> user IDs
  comments: number
  shares: number
  
  // Moderation
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed'
  moderatedBy?: string
  moderationReason?: string
  
  // Metadata
  createdAt: Timestamp
  updatedAt?: Timestamp
  isEdited: boolean
  isPinned: boolean
  
  // Visibility
  visibility: 'public' | 'members_only' | 'cultural_members_only'
  language: string
}
