import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { Community, CommunityMember, CommunityInvitation, CommunityAnalytics } from '@/types/community'
import { culturalValidationService } from '@/services/culturalValidationService'

interface CommunityCreationData {
  name: string
  description: string
  type: Community['type']
  primaryCultures: string[]
  culturalTags: string[]
  culturalSensitivity: Community['culturalSensitivity']
  location: Community['location']
  membershipType: Community['membershipType']
  maxMembers?: number
  categories: string[]
  languages: string[]
  privacy: Community['privacy']
  guidelines: {
    description: string
    rules: string[]
    culturalGuidelines: string[]
    consequences: string[]
  }
}

class CommunityManagementService {
  // Create a new community
  async createCommunity(
    creatorId: string,
    communityData: CommunityCreationData
  ): Promise<string> {
    try {
      const communityId = `community-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Validate cultural content
      const culturalValidation = await this.validateCulturalContent(communityData)
      if (!culturalValidation.isValid) {
        throw new Error(`Cultural validation failed: ${culturalValidation.errors.join(', ')}`)
      }

      const community: Community = {
        id: communityId,
        name: communityData.name,
        description: communityData.description,
        type: communityData.type,
        primaryCultures: communityData.primaryCultures,
        culturalTags: communityData.culturalTags,
        culturalSensitivity: communityData.culturalSensitivity,
        location: communityData.location,
        membershipType: communityData.membershipType,
        memberCount: 1, // Creator is the first member
        maxMembers: communityData.maxMembers,
        leaders: [{
          userId: creatorId,
          role: 'founder',
          appointedDate: Timestamp.now(),
          culturalCredibility: await this.getUserCulturalCredibility(creatorId),
        }],
        categories: communityData.categories,
        languages: communityData.languages,
        activityLevel: 'quiet', // New communities start as quiet
        verificationStatus: 'unverified',
        trustScore: 50, // Starting trust score
        privacy: communityData.privacy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: creatorId,
        isActive: true,
        analytics: {
          totalPosts: 0,
          totalEvents: 0,
          engagementRate: 0,
          diversityScore: 0,
          crossCulturalConnections: 0,
          retentionRate: 0,
        },
        guidelines: {
          ...communityData.guidelines,
          lastUpdated: Timestamp.now(),
        },
      }

      // Create community document
      await setDoc(doc(db, 'communities', communityId), community)

      // Add creator as first member
      await this.addMember(communityId, creatorId, 'founder')

      // Submit for cultural verification if needed
      if (communityData.primaryCultures.length > 0) {
        await this.submitForCulturalVerification(communityId, creatorId)
      }

      return communityId
    } catch (error) {
      console.error('Error creating community:', error)
      throw new Error('Failed to create community')
    }
  }

  // Update community information
  async updateCommunity(
    communityId: string,
    updates: Partial<CommunityCreationData>,
    updatedBy: string
  ): Promise<void> {
    try {
      // Verify user has permission to update
      const hasPermission = await this.hasManagementPermission(communityId, updatedBy)
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update community')
      }

      // Validate cultural content if cultural fields are being updated
      if (updates.primaryCultures || updates.culturalTags || updates.culturalSensitivity) {
        const culturalValidation = await this.validateCulturalContent(updates as any)
        if (!culturalValidation.isValid) {
          throw new Error(`Cultural validation failed: ${culturalValidation.errors.join(', ')}`)
        }
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'communities', communityId), updateData)

      // Log the update
      await this.logCommunityAction(communityId, updatedBy, 'community_updated', {
        updatedFields: Object.keys(updates),
      })
    } catch (error) {
      console.error('Error updating community:', error)
      throw new Error('Failed to update community')
    }
  }

  // Add member to community
  async addMember(
    communityId: string,
    userId: string,
    role: CommunityMember['role'] = 'member',
    invitedBy?: string
  ): Promise<void> {
    try {
      const memberId = `${communityId}-${userId}`
      
      const member: CommunityMember = {
        userId,
        communityId,
        role,
        joinedAt: Timestamp.now(),
        invitedBy,
        participationLevel: 'lurker',
        contributionScore: 0,
        culturalContributions: 0,
        culturalEndorsements: 0,
        status: 'active',
        lastActive: Timestamp.now(),
        notifications: {
          posts: true,
          events: true,
          mentions: true,
          culturalContent: true,
        },
      }

      await setDoc(doc(db, 'community-members', memberId), member)

      // Update community member count
      await this.updateMemberCount(communityId)

      // Update community analytics
      await this.updateCommunityAnalytics(communityId)

      // Log the action
      await this.logCommunityAction(communityId, userId, 'member_joined', {
        invitedBy,
        role,
      })
    } catch (error) {
      console.error('Error adding member:', error)
      throw new Error('Failed to add member to community')
    }
  }

  // Remove member from community
  async removeMember(
    communityId: string,
    userId: string,
    removedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      // Verify permission
      const hasPermission = await this.hasManagementPermission(communityId, removedBy)
      if (!hasPermission && removedBy !== userId) {
        throw new Error('Insufficient permissions to remove member')
      }

      const memberId = `${communityId}-${userId}`
      await deleteDoc(doc(db, 'community-members', memberId))

      // Update community member count
      await this.updateMemberCount(communityId)

      // Update community analytics
      await this.updateCommunityAnalytics(communityId)

      // Log the action
      await this.logCommunityAction(communityId, removedBy, 'member_removed', {
        removedUserId: userId,
        reason,
      })
    } catch (error) {
      console.error('Error removing member:', error)
      throw new Error('Failed to remove member from community')
    }
  }

  // Send community invitation
  async sendInvitation(
    communityId: string,
    invitedBy: string,
    invitedUser: string,
    culturalContext?: string,
    personalMessage?: string
  ): Promise<string> {
    try {
      // Verify permission to invite
      const hasPermission = await this.hasInvitePermission(communityId, invitedBy)
      if (!hasPermission) {
        throw new Error('Insufficient permissions to send invitations')
      }

      const invitationId = `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const invitation: CommunityInvitation = {
        id: invitationId,
        communityId,
        invitedBy,
        invitedUser,
        culturalContext,
        personalMessage,
        status: 'pending',
        sentAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
      }

      await setDoc(doc(db, 'community-invitations', invitationId), invitation)

      // Log the action
      await this.logCommunityAction(communityId, invitedBy, 'invitation_sent', {
        invitedUser,
        culturalContext,
      })

      return invitationId
    } catch (error) {
      console.error('Error sending invitation:', error)
      throw new Error('Failed to send invitation')
    }
  }

  // Accept community invitation
  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const invitationDoc = await getDoc(doc(db, 'community-invitations', invitationId))
      
      if (!invitationDoc.exists()) {
        throw new Error('Invitation not found')
      }

      const invitation = invitationDoc.data() as CommunityInvitation
      
      if (invitation.invitedUser !== userId) {
        throw new Error('Invalid invitation')
      }

      if (invitation.status !== 'pending') {
        throw new Error('Invitation already processed')
      }

      if (invitation.expiresAt.toDate() < new Date()) {
        throw new Error('Invitation has expired')
      }

      // Update invitation status
      await updateDoc(doc(db, 'community-invitations', invitationId), {
        status: 'accepted',
        respondedAt: Timestamp.now(),
      })

      // Add user to community
      await this.addMember(invitation.communityId, userId, 'member', invitation.invitedBy)
    } catch (error) {
      console.error('Error accepting invitation:', error)
      throw new Error('Failed to accept invitation')
    }
  }

  // Get community analytics
  async getCommunityAnalytics(
    communityId: string,
    period: CommunityAnalytics['period'] = 'month'
  ): Promise<CommunityAnalytics> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1)
          break
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Get community members for analysis
      const membersQuery = query(
        collection(db, 'community-members'),
        where('communityId', '==', communityId),
        where('status', '==', 'active')
      )
      const membersSnapshot = await getDocs(membersQuery)
      const members = membersSnapshot.docs.map(doc => doc.data() as CommunityMember)

      // Calculate membership analytics
      const newMembers = members.filter(m => 
        m.joinedAt.toDate() >= startDate && m.joinedAt.toDate() <= endDate
      ).length

      // Calculate cultural diversity
      const culturalIdentities = new Set()
      members.forEach(member => {
        // In a real implementation, we would get user's cultural identities
        // For now, we'll use a placeholder calculation
      })

      const analytics: CommunityAnalytics = {
        communityId,
        period,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        membershipGrowth: {
          newMembers,
          leftMembers: 0, // Would calculate from member removal logs
          netGrowth: newMembers,
          retentionRate: 0.85, // Placeholder
        },
        engagement: {
          totalPosts: 0, // Would calculate from posts collection
          totalComments: 0, // Would calculate from comments
          totalReactions: 0, // Would calculate from reactions
          averageEngagementRate: 0.65, // Placeholder
          topContributors: [], // Would calculate from contribution scores
        },
        cultural: {
          diversityScore: this.calculateCulturalDiversity(members),
          crossCulturalInteractions: 0, // Would calculate from interaction data
          culturalContentShared: 0, // Would calculate from cultural posts
          culturalEventsHosted: 0, // Would calculate from events
          bridgeConnections: 0, // Would calculate from cross-cultural connections
        },
        geographic: {
          memberDistribution: {}, // Would calculate from member locations
          localEngagement: 0.7, // Placeholder
          globalReach: 0.3, // Placeholder
        },
        content: {
          postsByCategory: {}, // Would calculate from post categories
          postsByLanguage: {}, // Would calculate from post languages
          mostPopularContent: [], // Would calculate from engagement metrics
          contentModerationActions: 0, // Would calculate from moderation logs
        },
      }

      return analytics
    } catch (error) {
      console.error('Error getting community analytics:', error)
      throw new Error('Failed to get community analytics')
    }
  }

  // Submit community for cultural verification
  async submitForCulturalVerification(
    communityId: string,
    submittedBy: string
  ): Promise<void> {
    try {
      const community = await this.getCommunity(communityId)
      if (!community) {
        throw new Error('Community not found')
      }

      // Submit to cultural validation service
      await culturalValidationService.submitToModerationQueue(
        {
          id: communityId,
          title: community.name,
          content: community.description,
          culture: community.primaryCultures[0] || 'general',
          author: {
            userId: submittedBy,
            culturalCredibility: 'community_member',
          },
          verification: {
            status: 'pending',
            culturalAccuracy: 0,
          },
          engagement: {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            crossCulturalViews: 0,
          },
          media: {
            images: [],
            videos: [],
            audio: [],
            documents: [],
          },
          translations: {},
        },
        'Cultural community verification',
        'medium'
      )

      // Update community status
      await updateDoc(doc(db, 'communities', communityId), {
        verificationStatus: 'pending',
      })
    } catch (error) {
      console.error('Error submitting for cultural verification:', error)
      throw new Error('Failed to submit for cultural verification')
    }
  }

  // Private helper methods
  private async validateCulturalContent(data: Partial<CommunityCreationData>): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    // Validate cultural sensitivity
    if (data.culturalSensitivity === 'members_only' && (!data.primaryCultures || data.primaryCultures.length === 0)) {
      errors.push('Communities with member-only cultural sensitivity must specify primary cultures')
    }

    // Validate cultural tags
    if (data.culturalTags && data.culturalTags.some(tag => tag.length < 2)) {
      errors.push('Cultural tags must be at least 2 characters long')
    }

    // Check for potentially problematic content
    const problematicTerms = ['primitive', 'savage', 'exotic', 'weird']
    const contentToCheck = [data.name, data.description, ...(data.culturalTags || [])].join(' ').toLowerCase()
    
    for (const term of problematicTerms) {
      if (contentToCheck.includes(term)) {
        errors.push(`Content contains potentially offensive term: "${term}"`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  private async getUserCulturalCredibility(userId: string): Promise<number> {
    // In a real implementation, this would calculate user's cultural credibility
    // based on their profile, endorsements, and contributions
    return 50 // Placeholder
  }

  private async hasManagementPermission(communityId: string, userId: string): Promise<boolean> {
    try {
      const memberDoc = await getDoc(doc(db, 'community-members', `${communityId}-${userId}`))
      if (!memberDoc.exists()) return false

      const member = memberDoc.data() as CommunityMember
      return ['founder', 'admin', 'moderator'].includes(member.role)
    } catch (error) {
      return false
    }
  }

  private async hasInvitePermission(communityId: string, userId: string): Promise<boolean> {
    try {
      const memberDoc = await getDoc(doc(db, 'community-members', `${communityId}-${userId}`))
      if (!memberDoc.exists()) return false

      const member = memberDoc.data() as CommunityMember
      return ['founder', 'admin', 'moderator', 'member'].includes(member.role)
    } catch (error) {
      return false
    }
  }

  private async updateMemberCount(communityId: string): Promise<void> {
    try {
      const membersQuery = query(
        collection(db, 'community-members'),
        where('communityId', '==', communityId),
        where('status', '==', 'active')
      )
      const membersSnapshot = await getDocs(membersQuery)
      const memberCount = membersSnapshot.size

      await updateDoc(doc(db, 'communities', communityId), {
        memberCount,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating member count:', error)
    }
  }

  private async updateCommunityAnalytics(communityId: string): Promise<void> {
    try {
      // This would update various analytics metrics
      // For now, we'll just update the timestamp
      await updateDoc(doc(db, 'communities', communityId), {
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error updating community analytics:', error)
    }
  }

  private calculateCulturalDiversity(members: CommunityMember[]): number {
    // Placeholder calculation for cultural diversity
    // In a real implementation, this would analyze the cultural identities of members
    return Math.random() * 0.5 + 0.5 // Random value between 0.5 and 1.0
  }

  private async logCommunityAction(
    communityId: string,
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      await setDoc(doc(db, 'community-logs', logId), {
        id: logId,
        communityId,
        userId,
        action,
        details,
        timestamp: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error logging community action:', error)
    }
  }

  private async getCommunity(communityId: string): Promise<Community | null> {
    try {
      const communityDoc = await getDoc(doc(db, 'communities', communityId))
      return communityDoc.exists() ? communityDoc.data() as Community : null
    } catch (error) {
      console.error('Error getting community:', error)
      return null
    }
  }
}

export const communityManagementService = new CommunityManagementService()
