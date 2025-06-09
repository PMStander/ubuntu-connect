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
  arrayRemove,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { culturalValidationService } from './culturalValidationService'

export interface SkillProfile {
  id: string
  userId: string
  skillsToTeach: TeachingSkill[]
  skillsToLearn: LearningGoal[]
  culturalTeachingStyle: CulturalTeachingStyle
  mentorshipPreferences: MentorshipPreferences
  availability: AvailabilitySchedule
  reputation: ReputationMetrics
  timeCredits: TimeCredits
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface TeachingSkill {
  skillId: string
  skillName: string
  category: SkillCategory
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
  culturalContext: CulturalContext[]
  yearsOfExperience: number
  certifications: Certification[]
  teachingMethods: TeachingMethod[]
  culturalApproaches: string[]
  maximumStudents: number
  preferredSessionDuration: number // minutes
  timeCreditsPerHour: number
  portfolioItems: PortfolioItem[]
}

export interface LearningGoal {
  skillId: string
  skillName: string
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced'
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  learningStyle: LearningStyle
  culturalPreferences: CulturalLearningPreference[]
  timeCommitment: number // hours per week
  deadline?: Timestamp
  motivation: string
  priorExperience?: string
}

export interface CulturalTeachingStyle {
  primaryCulture: string
  teachingPhilosophy: string
  culturalApproaches: CulturalApproach[]
  languageCapabilities: LanguageCapability[]
  culturalSensitivities: string[]
  crossCulturalExperience: number // years
  culturalAdaptability: number // 1-10 scale
}

export interface MentorshipMatch {
  id: string
  mentorId: string
  menteeId: string
  skillId: string
  matchScore: number // 0-100
  culturalCompatibility: number // 0-100
  matchingFactors: MatchingFactor[]
  status: 'pending' | 'active' | 'completed' | 'paused' | 'terminated'
  learningPlan: LearningPlan
  culturalExchangePlan: CulturalExchangePlan
  createdAt: Timestamp
  startDate?: Timestamp
  expectedDuration: number // weeks
  actualProgress: ProgressTracking
}

export interface LearningSession {
  id: string
  mentorshipMatchId: string
  scheduledAt: Timestamp
  duration: number // minutes
  sessionType: 'individual' | 'group' | 'workshop' | 'practice'
  location: 'online' | 'in_person' | 'hybrid'
  culturalElements: CulturalElement[]
  learningObjectives: string[]
  preparationMaterials: Material[]
  sessionNotes: SessionNote[]
  skillProgress: SkillProgressMetric[]
  culturalInsights: CulturalInsight[]
  timeCreditsAwarded: number
  feedback: SessionFeedback
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export interface TimeCredits {
  balance: number
  earned: TimeTransaction[]
  spent: TimeTransaction[]
  reserved: TimeReservation[]
  lifetimeEarned: number
  lifetimeSpent: number
  qualityMultiplier: number // 0.5-2.0 based on teaching quality
  culturalBonusRate: number // additional credits for cross-cultural exchanges
}

// Supporting interfaces
export interface SkillCategory {
  id: string
  name: string
  culturalOrigin?: string
  description: string
}

export interface CulturalContext {
  culture: string
  significance: string
  traditionalMethods: string[]
  modernAdaptations: string[]
}

export interface Certification {
  id: string
  name: string
  issuer: string
  dateEarned: Timestamp
  verificationUrl?: string
  culturalRecognition?: boolean
}

export interface TeachingMethod {
  method: string
  culturalApproach: string
  effectiveness: number
  preferredGroupSize: number
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  mediaUrl: string
  culturalContext?: string
  achievements: string[]
}

export interface LearningStyle {
  visual: number // 0-100
  auditory: number // 0-100
  kinesthetic: number // 0-100
  reading: number // 0-100
  culturalPreferences: string[]
}

export interface CulturalLearningPreference {
  culture: string
  interest: number // 0-100
  currentKnowledge: number // 0-100
  learningGoals: string[]
}

export interface CulturalApproach {
  approach: string
  culturalOrigin: string
  description: string
  effectiveness: number
}

export interface LanguageCapability {
  language: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
  canTeachIn: boolean
  culturalNuances: boolean
}

export interface MentorshipPreferences {
  preferredMenteeLevel: string[]
  maxActiveMentees: number
  sessionFrequency: 'weekly' | 'biweekly' | 'monthly' | 'flexible'
  communicationStyle: 'formal' | 'casual' | 'cultural_traditional'
  culturalExchangeInterest: number // 0-100
  groupSessionWillingness: boolean
}

export interface AvailabilitySchedule {
  timeZone: string
  weeklyHours: WeeklyHours
  culturalHolidays: string[]
  preferredSessionTimes: TimeSlot[]
  blackoutDates: DateRange[]
}

export interface ReputationMetrics {
  overallRating: number // 0-5
  totalSessions: number
  completionRate: number // 0-100
  culturalSensitivityRating: number // 0-5
  teachingEffectiveness: number // 0-5
  crossCulturalSuccess: number // 0-5
  endorsements: Endorsement[]
}

export interface MatchingFactor {
  factor: string
  weight: number
  score: number
  culturalRelevance: boolean
}

export interface LearningPlan {
  objectives: string[]
  milestones: Milestone[]
  culturalLearningGoals: string[]
  estimatedDuration: number // weeks
  sessionFrequency: string
  assessmentMethods: string[]
}

export interface CulturalExchangePlan {
  culturalTopics: string[]
  languagePractice: boolean
  culturalActivities: string[]
  traditionalKnowledgeSharing: boolean
  crossCulturalProjects: string[]
}

export interface ProgressTracking {
  skillProgress: number // 0-100
  culturalUnderstanding: number // 0-100
  sessionsCompleted: number
  milestonesAchieved: number
  culturalInsightsGained: string[]
  mutualLearningAchievements: string[]
}

class SkillSharingService {
  // Create or update skill profile
  async createSkillProfile(profile: Omit<SkillProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const profileId = `skill-profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Validate cultural teaching approaches
      const validation = await culturalValidationService.validateCulturalContent({
        id: profileId,
        title: `Skill Profile for ${profile.userId}`,
        content: JSON.stringify(profile.culturalTeachingStyle),
        type: 'skill_profile',
        culture: profile.culturalTeachingStyle.primaryCulture,
        author: {
          userId: profile.userId,
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

      const skillProfile: SkillProfile = {
        ...profile,
        id: profileId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, 'skill-profiles', profileId), skillProfile)

      return profileId
    } catch (error) {
      console.error('Error creating skill profile:', error)
      throw new Error('Failed to create skill profile')
    }
  }

  // Update existing skill profile
  async updateSkillProfile(profileId: string, updates: Partial<SkillProfile>): Promise<void> {
    try {
      const profileRef = doc(db, 'skill-profiles', profileId)
      
      await updateDoc(profileRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating skill profile:', error)
      throw new Error('Failed to update skill profile')
    }
  }

  // Get skill profile by user ID
  async getSkillProfileByUserId(userId: string): Promise<SkillProfile | null> {
    try {
      const q = query(
        collection(db, 'skill-profiles'),
        where('userId', '==', userId),
        limit(1)
      )

      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }

      return snapshot.docs[0].data() as SkillProfile
    } catch (error) {
      console.error('Error getting skill profile:', error)
      throw new Error('Failed to get skill profile')
    }
  }

  // Search for mentors by skill and cultural preferences
  async searchMentors(
    skillId: string, 
    culturalPreferences?: string[], 
    learningStyle?: LearningStyle,
    limit_count: number = 20
  ): Promise<SkillProfile[]> {
    try {
      let q = query(
        collection(db, 'skill-profiles'),
        where('skillsToTeach', 'array-contains-any', [skillId]),
        orderBy('reputation.overallRating', 'desc'),
        limit(limit_count)
      )

      const snapshot = await getDocs(q)
      let mentors = snapshot.docs.map(doc => doc.data() as SkillProfile)

      // Filter by cultural preferences if provided
      if (culturalPreferences && culturalPreferences.length > 0) {
        mentors = mentors.filter(mentor => 
          culturalPreferences.some(pref => 
            mentor.culturalTeachingStyle.primaryCulture === pref ||
            mentor.culturalTeachingStyle.culturalApproaches.some(approach => 
              approach.culturalOrigin === pref
            )
          )
        )
      }

      return mentors
    } catch (error) {
      console.error('Error searching mentors:', error)
      throw new Error('Failed to search mentors')
    }
  }

  // Create mentorship match
  async createMentorshipMatch(match: Omit<MentorshipMatch, 'id' | 'createdAt'>): Promise<string> {
    try {
      const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const mentorshipMatch: MentorshipMatch = {
        ...match,
        id: matchId,
        createdAt: Timestamp.now(),
      }

      await setDoc(doc(db, 'mentorship-matches', matchId), mentorshipMatch)

      return matchId
    } catch (error) {
      console.error('Error creating mentorship match:', error)
      throw new Error('Failed to create mentorship match')
    }
  }

  // Schedule learning session
  async scheduleLearningSession(session: Omit<LearningSession, 'id'>): Promise<string> {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const learningSession: LearningSession = {
        ...session,
        id: sessionId,
      }

      await setDoc(doc(db, 'learning-sessions', sessionId), learningSession)

      return sessionId
    } catch (error) {
      console.error('Error scheduling learning session:', error)
      throw new Error('Failed to schedule learning session')
    }
  }

  // Complete learning session and award credits
  async completeLearningSession(
    sessionId: string, 
    feedback: SessionFeedback,
    skillProgress: SkillProgressMetric[],
    culturalInsights: CulturalInsight[]
  ): Promise<void> {
    try {
      const sessionRef = doc(db, 'learning-sessions', sessionId)
      
      // Calculate time credits based on session duration and quality
      const session = await getDoc(sessionRef)
      if (!session.exists()) {
        throw new Error('Session not found')
      }

      const sessionData = session.data() as LearningSession
      const baseCredits = (sessionData.duration / 60) * 10 // 10 credits per hour base rate
      const qualityMultiplier = feedback.overallRating / 5 // 0-1 multiplier based on rating
      const culturalBonus = culturalInsights.length > 0 ? 1.2 : 1.0 // 20% bonus for cultural exchange
      
      const timeCreditsAwarded = Math.round(baseCredits * qualityMultiplier * culturalBonus)

      await updateDoc(sessionRef, {
        feedback,
        skillProgress,
        culturalInsights,
        timeCreditsAwarded,
        status: 'completed',
      })

      // Update mentor's time credits (this would integrate with TimeBankingService)
      // await this.awardTimeCredits(mentorId, timeCreditsAwarded, sessionId)

    } catch (error) {
      console.error('Error completing learning session:', error)
      throw new Error('Failed to complete learning session')
    }
  }

  // Get user's mentorship matches
  async getUserMentorshipMatches(userId: string, role: 'mentor' | 'mentee'): Promise<MentorshipMatch[]> {
    try {
      const field = role === 'mentor' ? 'mentorId' : 'menteeId'
      
      const q = query(
        collection(db, 'mentorship-matches'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as MentorshipMatch)
    } catch (error) {
      console.error('Error getting user mentorship matches:', error)
      throw new Error('Failed to get user mentorship matches')
    }
  }

  // Get learning sessions for a mentorship match
  async getLearningSessionsForMatch(matchId: string): Promise<LearningSession[]> {
    try {
      const q = query(
        collection(db, 'learning-sessions'),
        where('mentorshipMatchId', '==', matchId),
        orderBy('scheduledAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as LearningSession)
    } catch (error) {
      console.error('Error getting learning sessions:', error)
      throw new Error('Failed to get learning sessions')
    }
  }

  // Update mentorship match status
  async updateMentorshipMatchStatus(
    matchId: string, 
    status: MentorshipMatch['status'],
    notes?: string
  ): Promise<void> {
    try {
      const matchRef = doc(db, 'mentorship-matches', matchId)
      
      await updateDoc(matchRef, {
        status,
        ...(notes && { statusNotes: notes }),
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating mentorship match status:', error)
      throw new Error('Failed to update mentorship match status')
    }
  }
}

export const skillSharingService = new SkillSharingService()
