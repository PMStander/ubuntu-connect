import { Timestamp } from 'firebase/firestore'

export interface CulturalIdentity {
  id: string // e.g., 'zulu', 'xhosa', 'afrikaans'
  name: string // Display name in user's language
  description?: string // Brief cultural context
  verified: boolean // Community verification status
}

export interface UserCulturalProfile {
  culturalIdentities: {
    identityId: string
    connectionType: 'heritage' | 'interest' | 'learning' | 'family' | 'community'
    verificationStatus: 'pending' | 'verified' | 'community_endorsed'
    addedDate: Timestamp
    description?: string // Personal cultural connection story
  }[]
  culturalPreferences: {
    openToDiversity: boolean
    culturalExchangeInterest: boolean
    culturalLearningGoals: string[]
    respectfulInteractionMode: boolean
  }
  culturalPrivacy: {
    identitiesVisible: boolean
    culturalStoryVisible: boolean
    culturalInteractionsVisible: boolean
    culturalAnalyticsOptIn: boolean
  }
}

export interface UserProfile {
  uid: string // Firebase Auth UID
  email: string
  displayName: string
  culturalIdentities: string[] // Array of cultural identity IDs
  culturalPreferences: {
    openToDiversity: boolean
    preferredLanguage: string
    culturalExchangeInterest: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'communities' | 'private'
    culturalIdentityVisible: boolean
    locationSharing: boolean
  }
  createdAt: Timestamp
  lastActive: Timestamp
}

export interface User {
  id: string // Firebase Auth UID
  profile: {
    name: string
    email: string
    culturalIdentities: string[] // Multiple cultures allowed
    location?: {
      latitude: number
      longitude: number
    }
    languages: string[] // Spoken languages
    bio?: string
    profileImage?: string
    joinDate: Timestamp
    lastActive: Timestamp
  }
  skills: {
    [skillName: string]: {
      level: 'beginner' | 'intermediate' | 'expert'
      verified: boolean
      endorsements: number
      culturalContext?: string // How skill relates to cultural background
    }
  }
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'communities' | 'private'
      locationSharing: boolean
      culturalIdentityVisible: boolean
    }
    crossCulturalInteraction: boolean // Preference for diverse connections
    language: string // Primary interface language
  }
  achievements: {
    badges: string[]
    points: number
    contributions: number
    crossCulturalConnections: number
  }
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  phoneNumber: string | null
}

export interface RegistrationData {
  name: string
  email: string
  password: string
  phoneNumber?: string
  culturalIdentities?: string[]
  preferredLanguage: string
  privacyConsent: boolean
  culturalConsent: boolean
}
