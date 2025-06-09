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

export interface SkillProfile {
  id: string
  userId: string
  skills: {
    [skillId: string]: {
      name: string
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      culturalContext?: string
      yearsExperience: number
      certifications: string[]
      endorsements: number
      culturalSignificance?: string
    }
  }
  culturalKnowledge: {
    [cultureId: string]: {
      level: 'basic' | 'intermediate' | 'advanced' | 'native'
      areas: string[] // traditions, language, history, etc.
      canTeach: boolean
      canMentor: boolean
      verifiedBy?: string // Cultural representative
    }
  }
  availability: {
    timeZone: string
    preferredHours: string[]
    maxHoursPerWeek: number
    languages: string[]
  }
  ubuntuPhilosophy: {
    beliefLevel: number // 0-100
    practiceAreas: string[]
    communityContributions: number
    crossCulturalConnections: number
  }
}

export interface MentorshipMatch {
  id: string
  mentorId: string
  menteeId: string
  skillArea: string
  culturalContext?: string
  matchScore: number // 0-100
  status: 'pending' | 'active' | 'completed' | 'paused' | 'cancelled'
  goals: {
    skillGoals: string[]
    culturalLearningGoals: string[]
    timeframe: string
    successMetrics: string[]
  }
  progress: {
    sessionsCompleted: number
    skillProgress: number // 0-100
    culturalUnderstanding: number // 0-100
    mutualLearning: string[]
  }
  communication: {
    preferredMethod: 'video' | 'audio' | 'text' | 'in_person'
    frequency: 'weekly' | 'biweekly' | 'monthly'
    language: string
    translationNeeded: boolean
  }
  createdAt: Timestamp
  lastActivity: Timestamp
}

export interface CollaborativeProject {
  id: string
  title: string
  description: string
  type: 'cultural_exchange' | 'skill_development' | 'community_service' | 'business' | 'education'
  culturalObjectives: {
    bridgeBuildingGoals: string[]
    culturalLearningOutcomes: string[]
    diversityTargets: Record<string, number>
  }
  participants: {
    [userId: string]: {
      role: 'leader' | 'contributor' | 'learner' | 'cultural_advisor'
      skills: string[]
      culturalBackground: string[]
      joinedAt: Timestamp
      contributionScore: number
    }
  }
  requirements: {
    skillsNeeded: string[]
    culturalPerspectivesNeeded: string[]
    timeCommitment: string
    duration: string
  }
  workspace: {
    communicationChannels: string[]
    sharedResources: string[]
    meetingSchedule: string
    culturalSensitivityGuidelines: string[]
  }
  progress: {
    milestones: Array<{
      id: string
      title: string
      completed: boolean
      completedAt?: Timestamp
      culturalLearningAchieved: string[]
    }>
    overallProgress: number // 0-100
    crossCulturalInteractions: number
    ubuntuPrinciplesApplied: string[]
  }
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled'
  createdAt: Timestamp
  lastActivity: Timestamp
}

export interface CulturalLearningPath {
  id: string
  title: string
  culturalGroup: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  modules: Array<{
    id: string
    title: string
    type: 'content' | 'interaction' | 'practice' | 'assessment'
    content: string
    culturalContext: string
    estimatedTime: number // minutes
    prerequisites: string[]
    learningObjectives: string[]
    culturalSensitivityNotes: string[]
  }>
  prerequisites: {
    culturalKnowledge: string[]
    respectfulApproach: boolean
    communityConnection: boolean
  }
  outcomes: {
    skillsGained: string[]
    culturalUnderstanding: string[]
    bridgeBuildingCapabilities: string[]
    communityContributions: string[]
  }
  validation: {
    createdBy: string // Cultural representative or expert
    reviewedBy: string[]
    accuracyScore: number // 0-100
    communityEndorsements: number
  }
  engagement: {
    enrollments: number
    completions: number
    averageRating: number
    culturalFeedback: string[]
  }
}

class KnowledgeSharingService {
  // Create or update skill profile
  async updateSkillProfile(profile: SkillProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'skill-profiles', profile.userId), profile)
    } catch (error) {
      console.error('Error updating skill profile:', error)
      throw new Error('Failed to update skill profile')
    }
  }

  // Find mentorship matches
  async findMentorshipMatches(
    userId: string, 
    skillArea: string, 
    role: 'mentor' | 'mentee'
  ): Promise<MentorshipMatch[]> {
    try {
      const userProfile = await this.getSkillProfile(userId)
      if (!userProfile) throw new Error('User profile not found')

      // Query for potential matches
      const q = query(
        collection(db, 'skill-profiles'),
        where(`skills.${skillArea}`, '!=', null),
        limit(20)
      )

      const snapshot = await getDocs(q)
      const potentialMatches = snapshot.docs
        .map(doc => doc.data() as SkillProfile)
        .filter(profile => profile.userId !== userId)

      // Calculate match scores and create matches
      const matches: MentorshipMatch[] = []
      
      for (const match of potentialMatches) {
        const matchScore = this.calculateMentorshipMatchScore(userProfile, match, skillArea, role)
        
        if (matchScore > 60) { // Minimum threshold
          const mentorshipMatch: MentorshipMatch = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            mentorId: role === 'mentor' ? userId : match.userId,
            menteeId: role === 'mentee' ? userId : match.userId,
            skillArea,
            culturalContext: this.findCommonCulturalContext(userProfile, match),
            matchScore,
            status: 'pending',
            goals: {
              skillGoals: [],
              culturalLearningGoals: [],
              timeframe: '3 months',
              successMetrics: [],
            },
            progress: {
              sessionsCompleted: 0,
              skillProgress: 0,
              culturalUnderstanding: 0,
              mutualLearning: [],
            },
            communication: {
              preferredMethod: 'video',
              frequency: 'weekly',
              language: 'en',
              translationNeeded: false,
            },
            createdAt: Timestamp.now(),
            lastActivity: Timestamp.now(),
          }
          
          matches.push(mentorshipMatch)
        }
      }

      return matches.sort((a, b) => b.matchScore - a.matchScore)
    } catch (error) {
      console.error('Error finding mentorship matches:', error)
      throw new Error('Failed to find mentorship matches')
    }
  }

  // Create collaborative project
  async createCollaborativeProject(project: Omit<CollaborativeProject, 'id' | 'createdAt' | 'lastActivity'>): Promise<string> {
    try {
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const collaborativeProject: CollaborativeProject = {
        ...project,
        id: projectId,
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
      }

      await setDoc(doc(db, 'collaborative-projects', projectId), collaborativeProject)

      return projectId
    } catch (error) {
      console.error('Error creating collaborative project:', error)
      throw new Error('Failed to create collaborative project')
    }
  }

  // Join collaborative project
  async joinCollaborativeProject(
    projectId: string, 
    userId: string, 
    role: 'contributor' | 'learner' | 'cultural_advisor',
    skills: string[],
    culturalBackground: string[]
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'collaborative-projects', projectId)
      
      await updateDoc(projectRef, {
        [`participants.${userId}`]: {
          role,
          skills,
          culturalBackground,
          joinedAt: Timestamp.now(),
          contributionScore: 0,
        },
        lastActivity: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error joining collaborative project:', error)
      throw new Error('Failed to join collaborative project')
    }
  }

  // Create cultural learning path
  async createCulturalLearningPath(learningPath: Omit<CulturalLearningPath, 'id' | 'engagement'>): Promise<string> {
    try {
      const pathId = `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const culturalPath: CulturalLearningPath = {
        ...learningPath,
        id: pathId,
        engagement: {
          enrollments: 0,
          completions: 0,
          averageRating: 0,
          culturalFeedback: [],
        },
      }

      await setDoc(doc(db, 'cultural-learning-paths', pathId), culturalPath)

      return pathId
    } catch (error) {
      console.error('Error creating cultural learning path:', error)
      throw new Error('Failed to create cultural learning path')
    }
  }

  // Get skill profile
  async getSkillProfile(userId: string): Promise<SkillProfile | null> {
    try {
      const docRef = doc(db, 'skill-profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as SkillProfile
      }
      
      return null
    } catch (error) {
      console.error('Error getting skill profile:', error)
      throw new Error('Failed to get skill profile')
    }
  }

  // Get collaborative projects by user
  async getUserCollaborativeProjects(userId: string): Promise<CollaborativeProject[]> {
    try {
      const q = query(
        collection(db, 'collaborative-projects'),
        where(`participants.${userId}`, '!=', null),
        orderBy('lastActivity', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as CollaborativeProject)
    } catch (error) {
      console.error('Error getting user collaborative projects:', error)
      throw new Error('Failed to get user collaborative projects')
    }
  }

  // Get cultural learning paths by culture
  async getCulturalLearningPaths(culturalGroup?: string): Promise<CulturalLearningPath[]> {
    try {
      let q = query(
        collection(db, 'cultural-learning-paths'),
        orderBy('engagement.enrollments', 'desc')
      )

      if (culturalGroup) {
        q = query(q, where('culturalGroup', '==', culturalGroup))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as CulturalLearningPath)
    } catch (error) {
      console.error('Error getting cultural learning paths:', error)
      throw new Error('Failed to get cultural learning paths')
    }
  }

  // Private helper methods
  private calculateMentorshipMatchScore(
    user: SkillProfile, 
    potential: SkillProfile, 
    skillArea: string, 
    userRole: 'mentor' | 'mentee'
  ): number {
    let score = 0

    // Skill level compatibility
    const userSkill = user.skills[skillArea]
    const potentialSkill = potential.skills[skillArea]
    
    if (userSkill && potentialSkill) {
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']
      const userLevel = skillLevels.indexOf(userSkill.level)
      const potentialLevel = skillLevels.indexOf(potentialSkill.level)
      
      if (userRole === 'mentor' && userLevel > potentialLevel) {
        score += 30
      } else if (userRole === 'mentee' && potentialLevel > userLevel) {
        score += 30
      }
    }

    // Cultural compatibility
    const commonCultures = Object.keys(user.culturalKnowledge).filter(
      culture => potential.culturalKnowledge[culture]
    )
    score += Math.min(commonCultures.length * 10, 30)

    // Ubuntu philosophy alignment
    const ubuntuAlignment = Math.abs(user.ubuntuPhilosophy.beliefLevel - potential.ubuntuPhilosophy.beliefLevel)
    score += Math.max(0, 20 - ubuntuAlignment / 5)

    // Availability compatibility
    const commonLanguages = user.availability.languages.filter(
      lang => potential.availability.languages.includes(lang)
    )
    score += Math.min(commonLanguages.length * 5, 20)

    return Math.min(score, 100)
  }

  private findCommonCulturalContext(user: SkillProfile, potential: SkillProfile): string | undefined {
    const commonCultures = Object.keys(user.culturalKnowledge).filter(
      culture => potential.culturalKnowledge[culture]
    )
    
    return commonCultures.length > 0 ? commonCultures[0] : undefined
  }
}

export const knowledgeSharingService = new KnowledgeSharingService()
