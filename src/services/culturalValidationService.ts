import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { CulturalContent, CulturalModerationQueue } from '@/types/cultural'

interface CulturalValidationRequest {
  userId: string
  culturalIdentity: string
  evidence: {
    type: 'community_endorsement' | 'cultural_knowledge' | 'language_proficiency' | 'family_heritage'
    description: string
    supportingData?: any
  }
  submissionDate: Date
}

interface CulturalRepresentative {
  userId: string
  culturalIdentity: string
  verificationLevel: 'community_elder' | 'cultural_expert' | 'academic' | 'community_leader'
  endorsements: number
  activeStatus: boolean
}

class CulturalValidationService {
  // Submit cultural identity validation request
  async submitValidationRequest(request: CulturalValidationRequest): Promise<string> {
    try {
      const requestId = `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      await setDoc(doc(db, 'cultural-validation-requests', requestId), {
        ...request,
        id: requestId,
        status: 'pending',
        assignedRepresentatives: [],
        reviewNotes: [],
        submissionDate: request.submissionDate,
      })

      // Notify relevant cultural representatives
      await this.notifyCulturalRepresentatives(request.culturalIdentity, requestId)

      return requestId
    } catch (error) {
      console.error('Error submitting validation request:', error)
      throw new Error('Failed to submit validation request')
    }
  }

  // Get cultural representatives for a specific cultural identity
  async getCulturalRepresentatives(culturalIdentity: string): Promise<CulturalRepresentative[]> {
    try {
      const q = query(
        collection(db, 'cultural-representatives'),
        where('culturalIdentity', '==', culturalIdentity),
        where('activeStatus', '==', true)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as CulturalRepresentative)
    } catch (error) {
      console.error('Error fetching cultural representatives:', error)
      return []
    }
  }

  // Validate cultural content for accuracy and sensitivity
  async validateCulturalContent(content: CulturalContent): Promise<{
    isValid: boolean
    concerns: string[]
    recommendations: string[]
    requiresReview: boolean
  }> {
    const concerns: string[] = []
    const recommendations: string[] = []
    let requiresReview = false

    // Check for potentially sensitive content
    const sensitiveKeywords = [
      'sacred', 'ritual', 'ceremony', 'traditional medicine', 'spiritual',
      'ancestral', 'initiation', 'burial', 'marriage customs'
    ]

    const contentText = `${content.title} ${content.content}`.toLowerCase()
    const hasSensitiveContent = sensitiveKeywords.some(keyword => 
      contentText.includes(keyword)
    )

    if (hasSensitiveContent) {
      requiresReview = true
      concerns.push('Content contains culturally sensitive topics that require community review')
      recommendations.push('Consider adding cultural context and sensitivity warnings')
    }

    // Check for cultural appropriation indicators
    const appropriationIndicators = [
      'costume', 'dress up', 'exotic', 'primitive', 'tribal fashion'
    ]

    const hasAppropriation = appropriationIndicators.some(indicator =>
      contentText.includes(indicator)
    )

    if (hasAppropriation) {
      concerns.push('Content may contain cultural appropriation elements')
      recommendations.push('Review language and context to ensure respectful representation')
      requiresReview = true
    }

    // Check author's cultural credibility
    if (content.author.culturalCredibility === 'community_member') {
      // Community members can share general cultural content
      if (hasSensitiveContent) {
        recommendations.push('Consider getting endorsement from cultural representatives')
      }
    } else if (content.author.culturalCredibility === 'cultural_expert') {
      // Cultural experts have more leeway but still need review for sensitive content
      if (hasSensitiveContent) {
        recommendations.push('Expert content with sensitive topics should include cultural context')
      }
    }

    // Language and tone analysis
    const respectfulLanguage = this.analyzeLanguageRespectfulness(contentText)
    if (!respectfulLanguage.isRespectful) {
      concerns.push(...respectfulLanguage.issues)
      recommendations.push(...respectfulLanguage.suggestions)
      requiresReview = true
    }

    return {
      isValid: concerns.length === 0,
      concerns,
      recommendations,
      requiresReview,
    }
  }

  // Analyze language for cultural respectfulness
  private analyzeLanguageRespectfulness(text: string): {
    isRespectful: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check for problematic terms
    const problematicTerms = [
      { term: 'primitive', suggestion: 'traditional' },
      { term: 'savage', suggestion: 'warrior' },
      { term: 'exotic', suggestion: 'unique' },
      { term: 'weird', suggestion: 'different' },
      { term: 'strange', suggestion: 'unfamiliar' },
    ]

    problematicTerms.forEach(({ term, suggestion }) => {
      if (text.includes(term)) {
        issues.push(`Use of potentially offensive term: "${term}"`)
        suggestions.push(`Consider using "${suggestion}" instead of "${term}"`)
      }
    })

    // Check for generalizations
    const generalizationPatterns = [
      'all [culture] people',
      '[culture] people always',
      '[culture] people never',
    ]

    // This is a simplified check - in practice, you'd use more sophisticated NLP
    if (text.includes('all ') || text.includes(' always ') || text.includes(' never ')) {
      issues.push('Content may contain cultural generalizations')
      suggestions.push('Avoid broad generalizations about cultural groups')
    }

    return {
      isRespectful: issues.length === 0,
      issues,
      suggestions,
    }
  }

  // Submit content to moderation queue
  async submitToModerationQueue(
    content: CulturalContent,
    reason: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    try {
      const queueId = `moderation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const moderationItem: CulturalModerationQueue = {
        id: queueId,
        contentId: content.id,
        submittedBy: content.author.userId,
        culturalContext: content.culture,
        moderationReason: reason,
        priority,
        culturalRepresentatives: await this.assignCulturalRepresentatives(content.culture),
        submissionDate: new Date() as any,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) as any, // 7 days
        status: 'pending',
      }

      await setDoc(doc(db, 'cultural-moderation-queue', queueId), moderationItem)
      
      return queueId
    } catch (error) {
      console.error('Error submitting to moderation queue:', error)
      throw new Error('Failed to submit to moderation queue')
    }
  }

  // Assign cultural representatives for moderation
  private async assignCulturalRepresentatives(culturalIdentity: string): Promise<string[]> {
    try {
      const representatives = await this.getCulturalRepresentatives(culturalIdentity)
      
      // Sort by endorsements and select top 2-3 representatives
      const sortedReps = representatives
        .sort((a, b) => b.endorsements - a.endorsements)
        .slice(0, 3)
      
      return sortedReps.map(rep => rep.userId)
    } catch (error) {
      console.error('Error assigning cultural representatives:', error)
      return []
    }
  }

  // Notify cultural representatives of new validation requests
  private async notifyCulturalRepresentatives(
    culturalIdentity: string,
    requestId: string
  ): Promise<void> {
    try {
      const representatives = await this.getCulturalRepresentatives(culturalIdentity)
      
      // In a real implementation, you would send notifications
      // For now, we'll just log the notification
      console.log(`Notifying ${representatives.length} representatives for ${culturalIdentity} about request ${requestId}`)
      
      // You could implement email notifications, in-app notifications, etc.
    } catch (error) {
      console.error('Error notifying cultural representatives:', error)
    }
  }

  // Get validation status for a user's cultural identity
  async getValidationStatus(userId: string, culturalIdentity: string): Promise<{
    status: 'not_requested' | 'pending' | 'verified' | 'rejected'
    requestId?: string
    verificationDate?: Date
    verifiedBy?: string[]
  }> {
    try {
      const q = query(
        collection(db, 'cultural-validation-requests'),
        where('userId', '==', userId),
        where('culturalIdentity', '==', culturalIdentity)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return { status: 'not_requested' }
      }
      
      // Get the most recent request
      const requests = querySnapshot.docs.map(doc => doc.data())
      const latestRequest = requests.sort((a, b) => 
        b.submissionDate.toDate().getTime() - a.submissionDate.toDate().getTime()
      )[0]
      
      return {
        status: latestRequest.status,
        requestId: latestRequest.id,
        verificationDate: latestRequest.verificationDate?.toDate(),
        verifiedBy: latestRequest.verifiedBy,
      }
    } catch (error) {
      console.error('Error getting validation status:', error)
      return { status: 'not_requested' }
    }
  }

  // Calculate cultural credibility score
  calculateCredibilityScore(user: {
    culturalIdentities: string[]
    verifiedIdentities: string[]
    communityEndorsements: number
    contentContributions: number
    culturalKnowledgeScore: number
  }): number {
    let score = 0
    
    // Base score for cultural identities
    score += user.culturalIdentities.length * 10
    
    // Bonus for verified identities
    score += user.verifiedIdentities.length * 20
    
    // Community endorsements
    score += Math.min(user.communityEndorsements * 5, 50)
    
    // Content contributions
    score += Math.min(user.contentContributions * 2, 30)
    
    // Cultural knowledge score
    score += user.culturalKnowledgeScore
    
    return Math.min(score, 100)
  }
}

export const culturalValidationService = new CulturalValidationService()
