import { SkillProfile, LearningGoal, MentorshipMatch, MatchingFactor } from './skillSharingService'
import { Timestamp } from 'firebase/firestore'

export interface MatchScore {
  totalScore: number
  skillCompatibility: number
  culturalCompatibility: number
  availabilityOverlap: number
  teachingStyleAlignment: number
  experienceMatch: number
  culturalLearningPotential: number
  qualityScore: number
}

export interface CulturalCompatibilityFactors {
  sharedCultures: string[]
  complementaryCultures: string[]
  languageCompatibility: number
  crossCulturalExperience: number
  culturalAdaptability: number
  culturalLearningInterest: number
}

export interface AvailabilityOverlap {
  overlappingHours: number
  timeZoneCompatibility: number
  scheduleFlexibility: number
  culturalHolidayConsideration: number
}

class MentorshipMatchingEngine {
  // Main matching function
  async findOptimalMatches(
    learningGoal: LearningGoal, 
    learnerProfile: SkillProfile,
    potentialMentors: SkillProfile[],
    maxMatches: number = 10
  ): Promise<MentorshipMatch[]> {
    try {
      const matches: Array<{ mentor: SkillProfile; score: MatchScore }> = []

      for (const mentor of potentialMentors) {
        const matchScore = await this.calculateMatchScore(mentor, learningGoal, learnerProfile)
        
        if (matchScore.totalScore >= 60) { // Minimum threshold
          matches.push({ mentor, score: matchScore })
        }
      }

      // Sort by total score and cultural diversity
      const sortedMatches = matches
        .sort((a, b) => {
          // Primary sort by total score
          if (b.score.totalScore !== a.score.totalScore) {
            return b.score.totalScore - a.score.totalScore
          }
          // Secondary sort by cultural learning potential
          return b.score.culturalLearningPotential - a.score.culturalLearningPotential
        })
        .slice(0, maxMatches)

      // Create MentorshipMatch objects
      const mentorshipMatches: MentorshipMatch[] = []
      
      for (const match of sortedMatches) {
        const mentorshipMatch = await this.createMentorshipMatchFromScore(
          match.mentor,
          learnerProfile,
          learningGoal,
          match.score
        )
        mentorshipMatches.push(mentorshipMatch)
      }

      return mentorshipMatches
    } catch (error) {
      console.error('Error finding optimal matches:', error)
      throw new Error('Failed to find optimal matches')
    }
  }

  // Calculate comprehensive match score
  private async calculateMatchScore(
    mentor: SkillProfile,
    learningGoal: LearningGoal,
    learner: SkillProfile
  ): Promise<MatchScore> {
    try {
      // Find the relevant teaching skill
      const teachingSkill = mentor.skillsToTeach.find(skill => skill.skillId === learningGoal.skillId)
      if (!teachingSkill) {
        throw new Error('Teaching skill not found')
      }

      // Calculate individual score components
      const skillCompatibility = this.calculateSkillCompatibility(teachingSkill, learningGoal)
      const culturalCompatibility = this.calculateCulturalCompatibility(mentor, learner)
      const availabilityOverlap = this.calculateAvailabilityOverlap(mentor.availability, learner.availability)
      const teachingStyleAlignment = this.calculateTeachingStyleAlignment(mentor, learningGoal)
      const experienceMatch = this.calculateExperienceMatch(teachingSkill, learningGoal)
      const culturalLearningPotential = this.calculateCulturalLearningPotential(mentor, learner)
      const qualityScore = this.calculateQualityScore(mentor.reputation)

      // Weighted total score calculation
      const weights = {
        skillCompatibility: 0.25,
        culturalCompatibility: 0.15,
        availabilityOverlap: 0.15,
        teachingStyleAlignment: 0.15,
        experienceMatch: 0.10,
        culturalLearningPotential: 0.10,
        qualityScore: 0.10,
      }

      const totalScore = Math.round(
        skillCompatibility * weights.skillCompatibility +
        culturalCompatibility * weights.culturalCompatibility +
        availabilityOverlap * weights.availabilityOverlap +
        teachingStyleAlignment * weights.teachingStyleAlignment +
        experienceMatch * weights.experienceMatch +
        culturalLearningPotential * weights.culturalLearningPotential +
        qualityScore * weights.qualityScore
      )

      return {
        totalScore,
        skillCompatibility,
        culturalCompatibility,
        availabilityOverlap,
        teachingStyleAlignment,
        experienceMatch,
        culturalLearningPotential,
        qualityScore,
      }
    } catch (error) {
      console.error('Error calculating match score:', error)
      throw new Error('Failed to calculate match score')
    }
  }

  // Calculate skill compatibility score
  private calculateSkillCompatibility(teachingSkill: any, learningGoal: LearningGoal): number {
    const skillLevels = ['none', 'beginner', 'intermediate', 'advanced', 'expert', 'master']
    
    const currentLevelIndex = skillLevels.indexOf(learningGoal.currentLevel)
    const targetLevelIndex = skillLevels.indexOf(learningGoal.targetLevel)
    const teacherLevelIndex = skillLevels.indexOf(teachingSkill.proficiencyLevel)

    // Teacher should be at least 2 levels above current level for effective teaching
    const levelGap = teacherLevelIndex - currentLevelIndex
    
    let score = 0
    if (levelGap >= 2) {
      score = 100
    } else if (levelGap === 1) {
      score = 70
    } else if (levelGap === 0) {
      score = 40
    } else {
      score = 10 // Teacher level below learner level
    }

    // Bonus for teacher being able to guide to target level
    if (teacherLevelIndex >= targetLevelIndex) {
      score += 10
    }

    // Cultural context bonus
    const culturalContextMatch = teachingSkill.culturalContext?.some((context: any) =>
      learningGoal.culturalPreferences?.some(pref => pref.culture === context.culture)
    )
    if (culturalContextMatch) {
      score += 15
    }

    return Math.min(score, 100)
  }

  // Calculate cultural compatibility score
  private calculateCulturalCompatibility(mentor: SkillProfile, learner: SkillProfile): number {
    let score = 0

    // Shared cultural background
    if (mentor.culturalTeachingStyle.primaryCulture === learner.culturalTeachingStyle.primaryCulture) {
      score += 20
    }

    // Cross-cultural experience bonus
    const mentorCrossExperience = mentor.culturalTeachingStyle.crossCulturalExperience
    const learnerCrossExperience = learner.culturalTeachingStyle.crossCulturalExperience
    
    if (mentorCrossExperience >= 3) {
      score += 25
    } else if (mentorCrossExperience >= 1) {
      score += 15
    }

    // Cultural adaptability
    const adaptabilityScore = mentor.culturalTeachingStyle.culturalAdaptability * 5 // Convert 1-10 to 0-50
    score += adaptabilityScore

    // Language compatibility
    const sharedLanguages = mentor.culturalTeachingStyle.languageCapabilities.filter(mentorLang =>
      learner.culturalTeachingStyle.languageCapabilities.some(learnerLang =>
        learnerLang.language === mentorLang.language && 
        mentorLang.canTeachIn && 
        learnerLang.proficiency !== 'basic'
      )
    )
    score += Math.min(sharedLanguages.length * 10, 30)

    // Cultural learning interest alignment
    const culturalInterest = learner.skillsToLearn.some(goal =>
      goal.culturalPreferences?.some(pref => 
        pref.culture === mentor.culturalTeachingStyle.primaryCulture && pref.interest > 70
      )
    )
    if (culturalInterest) {
      score += 20
    }

    return Math.min(score, 100)
  }

  // Calculate availability overlap score
  private calculateAvailabilityOverlap(mentorAvailability: any, learnerAvailability: any): number {
    let score = 0

    // Time zone compatibility
    const timeZoneDiff = Math.abs(
      this.getTimeZoneOffset(mentorAvailability.timeZone) - 
      this.getTimeZoneOffset(learnerAvailability.timeZone)
    )
    
    if (timeZoneDiff <= 2) {
      score += 40
    } else if (timeZoneDiff <= 4) {
      score += 25
    } else if (timeZoneDiff <= 6) {
      score += 10
    }

    // Weekly hours overlap (simplified calculation)
    const mentorHours = mentorAvailability.weeklyHours || 20
    const learnerHours = learnerAvailability.weeklyHours || 10
    const overlapHours = Math.min(mentorHours, learnerHours)
    
    score += Math.min(overlapHours * 2, 40)

    // Preferred session times overlap (simplified)
    const sessionTimeOverlap = mentorAvailability.preferredSessionTimes?.length > 0 && 
                              learnerAvailability.preferredSessionTimes?.length > 0
    if (sessionTimeOverlap) {
      score += 20
    }

    return Math.min(score, 100)
  }

  // Calculate teaching style alignment score
  private calculateTeachingStyleAlignment(mentor: SkillProfile, learningGoal: LearningGoal): number {
    let score = 50 // Base score

    // Learning style compatibility (simplified)
    if (learningGoal.learningStyle) {
      // Check if mentor's teaching methods align with learner's style
      const mentorMethods = mentor.skillsToTeach[0]?.teachingMethods || []
      
      // Visual learners prefer demonstration methods
      if (learningGoal.learningStyle.visual > 70) {
        const hasVisualMethods = mentorMethods.some((method: any) => 
          method.method.includes('demonstration') || method.method.includes('visual')
        )
        if (hasVisualMethods) score += 15
      }

      // Kinesthetic learners prefer hands-on methods
      if (learningGoal.learningStyle.kinesthetic > 70) {
        const hasHandsOnMethods = mentorMethods.some((method: any) => 
          method.method.includes('hands-on') || method.method.includes('practice')
        )
        if (hasHandsOnMethods) score += 15
      }
    }

    // Cultural teaching approach alignment
    const culturalApproachMatch = mentor.culturalTeachingStyle.culturalApproaches.some(approach =>
      learningGoal.culturalPreferences?.some(pref => 
        pref.culture === approach.culturalOrigin
      )
    )
    if (culturalApproachMatch) {
      score += 20
    }

    // Mentorship preference alignment
    const preferredLevel = mentor.mentorshipPreferences.preferredMenteeLevel
    const learnerCurrentLevel = learningGoal.currentLevel
    
    if (preferredLevel.includes(learnerCurrentLevel)) {
      score += 15
    }

    return Math.min(score, 100)
  }

  // Calculate experience match score
  private calculateExperienceMatch(teachingSkill: any, learningGoal: LearningGoal): number {
    let score = 0

    // Years of experience
    const experience = teachingSkill.yearsOfExperience
    if (experience >= 10) {
      score += 40
    } else if (experience >= 5) {
      score += 30
    } else if (experience >= 2) {
      score += 20
    } else {
      score += 10
    }

    // Certifications
    const certificationCount = teachingSkill.certifications?.length || 0
    score += Math.min(certificationCount * 10, 30)

    // Portfolio items
    const portfolioCount = teachingSkill.portfolioItems?.length || 0
    score += Math.min(portfolioCount * 5, 20)

    // Cultural certifications bonus
    const hasCulturalCertifications = teachingSkill.certifications?.some((cert: any) => 
      cert.culturalRecognition === true
    )
    if (hasCulturalCertifications) {
      score += 10
    }

    return Math.min(score, 100)
  }

  // Calculate cultural learning potential score
  private calculateCulturalLearningPotential(mentor: SkillProfile, learner: SkillProfile): number {
    let score = 0

    // Different cultural backgrounds increase learning potential
    if (mentor.culturalTeachingStyle.primaryCulture !== learner.culturalTeachingStyle.primaryCulture) {
      score += 30
    }

    // Mentor's cultural teaching experience
    const culturalExperience = mentor.culturalTeachingStyle.crossCulturalExperience
    score += Math.min(culturalExperience * 5, 25)

    // Learner's cultural learning interest
    const culturalInterest = learner.skillsToLearn.some(goal =>
      goal.culturalPreferences?.some(pref => pref.interest > 60)
    )
    if (culturalInterest) {
      score += 25
    }

    // Language learning opportunity
    const languageLearningOpportunity = mentor.culturalTeachingStyle.languageCapabilities.some(lang =>
      !learner.culturalTeachingStyle.languageCapabilities.some(learnerLang =>
        learnerLang.language === lang.language && learnerLang.proficiency !== 'basic'
      )
    )
    if (languageLearningOpportunity) {
      score += 20
    }

    return Math.min(score, 100)
  }

  // Calculate quality score based on reputation
  private calculateQualityScore(reputation: any): number {
    let score = 0

    // Overall rating
    const overallRating = reputation.overallRating || 0
    score += (overallRating / 5) * 40

    // Completion rate
    const completionRate = reputation.completionRate || 0
    score += (completionRate / 100) * 25

    // Cultural sensitivity rating
    const culturalRating = reputation.culturalSensitivityRating || 0
    score += (culturalRating / 5) * 20

    // Teaching effectiveness
    const teachingEffectiveness = reputation.teachingEffectiveness || 0
    score += (teachingEffectiveness / 5) * 15

    return Math.min(score, 100)
  }

  // Helper function to get time zone offset (simplified)
  private getTimeZoneOffset(timeZone: string): number {
    // Simplified time zone offset calculation
    const timeZoneOffsets: Record<string, number> = {
      'Africa/Johannesburg': 2,
      'UTC': 0,
      'America/New_York': -5,
      'Europe/London': 0,
      'Asia/Tokyo': 9,
      // Add more as needed
    }
    
    return timeZoneOffsets[timeZone] || 0
  }

  // Create MentorshipMatch object from calculated score
  private async createMentorshipMatchFromScore(
    mentor: SkillProfile,
    learner: SkillProfile,
    learningGoal: LearningGoal,
    score: MatchScore
  ): Promise<MentorshipMatch> {
    const matchingFactors: MatchingFactor[] = [
      { factor: 'Skill Compatibility', weight: 0.25, score: score.skillCompatibility, culturalRelevance: false },
      { factor: 'Cultural Compatibility', weight: 0.15, score: score.culturalCompatibility, culturalRelevance: true },
      { factor: 'Availability Overlap', weight: 0.15, score: score.availabilityOverlap, culturalRelevance: false },
      { factor: 'Teaching Style Alignment', weight: 0.15, score: score.teachingStyleAlignment, culturalRelevance: true },
      { factor: 'Experience Match', weight: 0.10, score: score.experienceMatch, culturalRelevance: false },
      { factor: 'Cultural Learning Potential', weight: 0.10, score: score.culturalLearningPotential, culturalRelevance: true },
      { factor: 'Quality Score', weight: 0.10, score: score.qualityScore, culturalRelevance: false },
    ]

    return {
      id: '', // Will be set when saved
      mentorId: mentor.userId,
      menteeId: learner.userId,
      skillId: learningGoal.skillId,
      matchScore: score.totalScore,
      culturalCompatibility: score.culturalCompatibility,
      matchingFactors,
      status: 'pending',
      learningPlan: {
        objectives: [learningGoal.motivation],
        milestones: [],
        culturalLearningGoals: learningGoal.culturalPreferences?.map(pref => 
          `Learn about ${pref.culture} culture through ${learningGoal.skillName}`
        ) || [],
        estimatedDuration: 12, // weeks
        sessionFrequency: 'weekly',
        assessmentMethods: ['practical_demonstration', 'cultural_understanding_assessment'],
      },
      culturalExchangePlan: {
        culturalTopics: [mentor.culturalTeachingStyle.primaryCulture],
        languagePractice: mentor.culturalTeachingStyle.languageCapabilities.length > 1,
        culturalActivities: ['cultural_context_discussions', 'traditional_method_exploration'],
        traditionalKnowledgeSharing: true,
        crossCulturalProjects: ['skill_application_in_cultural_context'],
      },
      createdAt: Timestamp.now(),
      expectedDuration: 12,
      actualProgress: {
        skillProgress: 0,
        culturalUnderstanding: 0,
        sessionsCompleted: 0,
        milestonesAchieved: 0,
        culturalInsightsGained: [],
        mutualLearningAchievements: [],
      },
    }
  }
}

export const mentorshipMatchingEngine = new MentorshipMatchingEngine()
