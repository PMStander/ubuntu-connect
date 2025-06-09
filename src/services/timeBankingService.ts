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
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { db } from './firebase'

export interface TimeBankAccount {
  id: string
  userId: string
  balance: number
  totalEarned: number
  totalSpent: number
  totalReserved: number
  qualityMultiplier: number // 0.5-2.0 based on service quality
  culturalBonusRate: number // additional rate for cross-cultural exchanges
  reputationScore: number // 0-100
  accountStatus: 'active' | 'suspended' | 'restricted' | 'closed'
  createdAt: Timestamp
  lastActivity: Timestamp
}

export interface TimeTransaction {
  id: string
  type: 'earn' | 'spend' | 'reserve' | 'release' | 'bonus' | 'penalty' | 'adjustment'
  fromUserId?: string
  toUserId: string
  amount: number
  baseAmount: number
  multipliers: TransactionMultiplier[]
  description: string
  category: TransactionCategory
  relatedExchangeId?: string
  relatedSessionId?: string
  culturalContext?: CulturalTransactionContext
  status: 'pending' | 'completed' | 'failed' | 'disputed' | 'reversed'
  timestamp: Timestamp
  expiresAt?: Timestamp
  metadata: TransactionMetadata
}

export interface CreditCalculation {
  baseCredits: number
  qualityMultiplier: number
  culturalBonus: number
  skillComplexityBonus: number
  demandMultiplier: number
  communityContributionBonus: number
  finalCredits: number
  breakdown: CalculationBreakdown[]
}

export interface DisputeCase {
  id: string
  transactionId: string
  disputantUserId: string
  respondentUserId: string
  disputeType: 'quality' | 'cultural_insensitivity' | 'non_completion' | 'overcharge' | 'other'
  description: string
  evidence: DisputeEvidence[]
  culturalContext?: CulturalDisputeContext
  status: 'open' | 'investigating' | 'mediation' | 'resolved' | 'escalated' | 'closed'
  resolution?: DisputeResolution
  mediatorId?: string
  culturalMediatorId?: string
  createdAt: Timestamp
  resolvedAt?: Timestamp
}

export interface CulturalValueAssessment {
  skillId: string
  culturalOrigin: string
  traditionalValue: number // base cultural significance score
  rarityMultiplier: number // how rare this knowledge is
  preservationImportance: number // importance for cultural preservation
  crossCulturalAppeal: number // appeal to other cultures
  modernRelevance: number // relevance in modern context
  communityEndorsement: number // community validation score
  finalCulturalValue: number
  assessmentDate: Timestamp
  assessedBy: string[] // cultural representatives
}

export interface FairExchangeMetrics {
  userId: string
  exchangeEquity: number // how fair their exchanges have been
  culturalContribution: number // contribution to cultural preservation
  communityImpact: number // positive impact on community
  crossCulturalBridging: number // success in cross-cultural exchanges
  knowledgeSharing: number // willingness to share knowledge
  learningEngagement: number // engagement as a learner
  overallFairnessScore: number
  lastCalculated: Timestamp
}

export interface TransactionMultiplier {
  type: 'quality' | 'cultural' | 'complexity' | 'demand' | 'community' | 'rarity'
  value: number
  reason: string
  appliedBy: string
}

export interface TransactionCategory {
  primary: 'skill_teaching' | 'cultural_sharing' | 'mentorship' | 'consultation' | 'workshop' | 'other'
  secondary?: string
  culturalCategory?: string
}

export interface CulturalTransactionContext {
  primaryCulture: string
  crossCulturalExchange: boolean
  traditionalKnowledgeInvolved: boolean
  culturalSensitivityLevel: 'low' | 'medium' | 'high'
  communityBenefit: boolean
}

export interface TransactionMetadata {
  sessionDuration?: number
  participantCount?: number
  skillLevel: string
  culturalElements: string[]
  qualityRating?: number
  culturalRespectRating?: number
  learningOutcomes: string[]
}

export interface CalculationBreakdown {
  component: string
  value: number
  explanation: string
}

export interface DisputeEvidence {
  type: 'text' | 'image' | 'video' | 'audio' | 'document'
  content: string
  description: string
  timestamp: Timestamp
}

export interface CulturalDisputeContext {
  culturalIssues: string[]
  culturalMisunderstanding: boolean
  traditionalKnowledgeConcerns: boolean
  communityImpact: string
  culturalMediationNeeded: boolean
}

export interface DisputeResolution {
  outcome: 'refund_full' | 'refund_partial' | 'no_refund' | 'additional_compensation' | 'mediated_agreement'
  creditAdjustment: number
  explanation: string
  culturalGuidance?: string
  preventionMeasures: string[]
  satisfactionRating: number
}

class TimeBankingService {
  // Create time bank account
  async createTimeBankAccount(userId: string): Promise<string> {
    try {
      const accountId = `timebank-${userId}`
      
      const account: TimeBankAccount = {
        id: accountId,
        userId,
        balance: 100, // Starting bonus credits
        totalEarned: 100,
        totalSpent: 0,
        totalReserved: 0,
        qualityMultiplier: 1.0,
        culturalBonusRate: 0.1, // 10% bonus for cultural exchanges
        reputationScore: 50, // Starting neutral reputation
        accountStatus: 'active',
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
      }

      await setDoc(doc(db, 'timebank-accounts', accountId), account)

      // Create welcome transaction
      await this.recordTransaction({
        type: 'bonus',
        toUserId: userId,
        amount: 100,
        baseAmount: 100,
        multipliers: [],
        description: 'Welcome bonus for joining Ubuntu Connect',
        category: {
          primary: 'other',
          secondary: 'welcome_bonus',
        },
        status: 'completed',
        timestamp: Timestamp.now(),
        metadata: {
          skillLevel: 'beginner',
          culturalElements: ['ubuntu_philosophy'],
          learningOutcomes: ['Platform onboarding'],
        },
      })

      return accountId
    } catch (error) {
      console.error('Error creating time bank account:', error)
      throw new Error('Failed to create time bank account')
    }
  }

  // Calculate credits for a service/exchange
  async calculateCredits(
    serviceDetails: {
      skillId: string
      duration: number // minutes
      skillLevel: string
      culturalContext?: CulturalTransactionContext
      qualityRating?: number
      participantCount?: number
    },
    providerId: string
  ): Promise<CreditCalculation> {
    try {
      // Base calculation: 10 credits per hour
      const baseCredits = (serviceDetails.duration / 60) * 10

      // Get provider's quality multiplier
      const providerAccount = await this.getTimeBankAccount(providerId)
      const qualityMultiplier = providerAccount?.qualityMultiplier || 1.0

      // Cultural bonus calculation
      let culturalBonus = 0
      if (serviceDetails.culturalContext?.crossCulturalExchange) {
        culturalBonus = baseCredits * (providerAccount?.culturalBonusRate || 0.1)
      }

      // Skill complexity bonus
      const complexityMultipliers = {
        'beginner': 1.0,
        'intermediate': 1.2,
        'advanced': 1.5,
        'expert': 2.0,
        'master': 2.5,
      }
      const skillComplexityBonus = baseCredits * (complexityMultipliers[serviceDetails.skillLevel as keyof typeof complexityMultipliers] - 1)

      // Demand multiplier (simplified - could be based on marketplace data)
      const demandMultiplier = 1.0 // TODO: Implement demand-based pricing

      // Community contribution bonus
      let communityContributionBonus = 0
      if (serviceDetails.culturalContext?.communityBenefit) {
        communityContributionBonus = baseCredits * 0.15 // 15% bonus
      }

      // Group session bonus
      let groupBonus = 0
      if (serviceDetails.participantCount && serviceDetails.participantCount > 1) {
        groupBonus = baseCredits * 0.1 * (serviceDetails.participantCount - 1) // 10% per additional participant
      }

      const finalCredits = Math.round(
        baseCredits * qualityMultiplier * demandMultiplier + 
        culturalBonus + 
        skillComplexityBonus + 
        communityContributionBonus + 
        groupBonus
      )

      const breakdown: CalculationBreakdown[] = [
        { component: 'Base Credits', value: baseCredits, explanation: `${serviceDetails.duration} minutes at 10 credits/hour` },
        { component: 'Quality Multiplier', value: qualityMultiplier, explanation: `Based on provider reputation (${providerAccount?.reputationScore || 50}/100)` },
        { component: 'Cultural Bonus', value: culturalBonus, explanation: 'Cross-cultural exchange bonus' },
        { component: 'Skill Complexity', value: skillComplexityBonus, explanation: `${serviceDetails.skillLevel} level bonus` },
        { component: 'Community Contribution', value: communityContributionBonus, explanation: 'Community benefit bonus' },
        { component: 'Group Session', value: groupBonus, explanation: `${serviceDetails.participantCount || 1} participants` },
      ]

      return {
        baseCredits,
        qualityMultiplier,
        culturalBonus,
        skillComplexityBonus,
        demandMultiplier,
        communityContributionBonus,
        finalCredits,
        breakdown,
      }
    } catch (error) {
      console.error('Error calculating credits:', error)
      throw new Error('Failed to calculate credits')
    }
  }

  // Record a transaction
  async recordTransaction(transaction: Omit<TimeTransaction, 'id'>): Promise<string> {
    try {
      const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const timeTransaction: TimeTransaction = {
        ...transaction,
        id: transactionId,
      }

      // Use transaction to ensure consistency
      await runTransaction(db, async (firestoreTransaction) => {
        // Record the transaction
        const transactionRef = doc(db, 'time-transactions', transactionId)
        firestoreTransaction.set(transactionRef, timeTransaction)

        // Update account balances
        if (transaction.type === 'earn' || transaction.type === 'bonus') {
          await this.updateAccountBalance(transaction.toUserId, transaction.amount, 'add', firestoreTransaction)
        } else if (transaction.type === 'spend') {
          await this.updateAccountBalance(transaction.toUserId, -transaction.amount, 'subtract', firestoreTransaction)
          if (transaction.fromUserId) {
            await this.updateAccountBalance(transaction.fromUserId, transaction.amount, 'add', firestoreTransaction)
          }
        } else if (transaction.type === 'reserve') {
          await this.updateAccountReserved(transaction.toUserId, transaction.amount, 'add', firestoreTransaction)
        } else if (transaction.type === 'release') {
          await this.updateAccountReserved(transaction.toUserId, -transaction.amount, 'subtract', firestoreTransaction)
        }
      })

      return transactionId
    } catch (error) {
      console.error('Error recording transaction:', error)
      throw new Error('Failed to record transaction')
    }
  }

  // Get time bank account
  async getTimeBankAccount(userId: string): Promise<TimeBankAccount | null> {
    try {
      const accountRef = doc(db, 'timebank-accounts', `timebank-${userId}`)
      const accountDoc = await getDoc(accountRef)
      
      if (accountDoc.exists()) {
        return accountDoc.data() as TimeBankAccount
      }
      
      return null
    } catch (error) {
      console.error('Error getting time bank account:', error)
      throw new Error('Failed to get time bank account')
    }
  }

  // Get user's transaction history
  async getUserTransactionHistory(userId: string, limit_count: number = 50): Promise<TimeTransaction[]> {
    try {
      const q = query(
        collection(db, 'time-transactions'),
        where('toUserId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as TimeTransaction)
    } catch (error) {
      console.error('Error getting user transaction history:', error)
      throw new Error('Failed to get user transaction history')
    }
  }

  // Process payment for knowledge exchange
  async processExchangePayment(
    exchangeId: string,
    payerId: string,
    payeeId: string,
    amount: number,
    serviceDetails: any
  ): Promise<string> {
    try {
      // Check if payer has sufficient balance
      const payerAccount = await this.getTimeBankAccount(payerId)
      if (!payerAccount || payerAccount.balance < amount) {
        throw new Error('Insufficient credits')
      }

      // Calculate final credits with bonuses
      const creditCalculation = await this.calculateCredits(serviceDetails, payeeId)

      // Record the payment transaction
      const transactionId = await this.recordTransaction({
        type: 'spend',
        fromUserId: payeeId,
        toUserId: payerId,
        amount: creditCalculation.finalCredits,
        baseAmount: creditCalculation.baseCredits,
        multipliers: [
          { type: 'quality', value: creditCalculation.qualityMultiplier, reason: 'Provider quality rating', appliedBy: 'system' },
          { type: 'cultural', value: creditCalculation.culturalBonus, reason: 'Cross-cultural exchange', appliedBy: 'system' },
          { type: 'complexity', value: creditCalculation.skillComplexityBonus, reason: 'Skill complexity', appliedBy: 'system' },
        ],
        description: `Payment for knowledge exchange: ${exchangeId}`,
        category: {
          primary: 'skill_teaching',
          culturalCategory: serviceDetails.culturalContext?.primaryCulture,
        },
        relatedExchangeId: exchangeId,
        culturalContext: serviceDetails.culturalContext,
        status: 'completed',
        timestamp: Timestamp.now(),
        metadata: {
          sessionDuration: serviceDetails.duration,
          participantCount: serviceDetails.participantCount || 1,
          skillLevel: serviceDetails.skillLevel,
          culturalElements: serviceDetails.culturalContext?.culturalElements || [],
          learningOutcomes: serviceDetails.learningOutcomes || [],
        },
      })

      return transactionId
    } catch (error) {
      console.error('Error processing exchange payment:', error)
      throw new Error('Failed to process exchange payment')
    }
  }

  // Create dispute case
  async createDisputeCase(dispute: Omit<DisputeCase, 'id' | 'createdAt'>): Promise<string> {
    try {
      const disputeId = `dispute-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const disputeCase: DisputeCase = {
        ...dispute,
        id: disputeId,
        createdAt: Timestamp.now(),
      }

      await setDoc(doc(db, 'dispute-cases', disputeId), disputeCase)

      // Freeze related transaction if applicable
      if (dispute.transactionId) {
        await this.freezeTransaction(dispute.transactionId)
      }

      return disputeId
    } catch (error) {
      console.error('Error creating dispute case:', error)
      throw new Error('Failed to create dispute case')
    }
  }

  // Resolve dispute case
  async resolveDisputeCase(
    disputeId: string,
    resolution: DisputeResolution,
    mediatorId: string
  ): Promise<void> {
    try {
      const disputeRef = doc(db, 'dispute-cases', disputeId)
      
      await updateDoc(disputeRef, {
        status: 'resolved',
        resolution,
        mediatorId,
        resolvedAt: Timestamp.now(),
      })

      // Apply credit adjustments if needed
      if (resolution.creditAdjustment !== 0) {
        const disputeDoc = await getDoc(disputeRef)
        if (disputeDoc.exists()) {
          const dispute = disputeDoc.data() as DisputeCase
          
          await this.recordTransaction({
            type: resolution.creditAdjustment > 0 ? 'bonus' : 'penalty',
            toUserId: dispute.disputantUserId,
            amount: Math.abs(resolution.creditAdjustment),
            baseAmount: Math.abs(resolution.creditAdjustment),
            multipliers: [],
            description: `Dispute resolution adjustment: ${resolution.explanation}`,
            category: {
              primary: 'other',
              secondary: 'dispute_resolution',
            },
            relatedExchangeId: dispute.transactionId,
            status: 'completed',
            timestamp: Timestamp.now(),
            metadata: {
              skillLevel: 'n/a',
              culturalElements: [],
              learningOutcomes: ['Dispute resolved'],
            },
          })
        }
      }
    } catch (error) {
      console.error('Error resolving dispute case:', error)
      throw new Error('Failed to resolve dispute case')
    }
  }

  // Calculate fair exchange metrics
  async calculateFairExchangeMetrics(userId: string): Promise<FairExchangeMetrics> {
    try {
      // Get user's transaction history
      const transactions = await this.getUserTransactionHistory(userId, 100)
      
      // Calculate various fairness metrics
      const exchangeEquity = this.calculateExchangeEquity(transactions)
      const culturalContribution = this.calculateCulturalContribution(transactions)
      const communityImpact = this.calculateCommunityImpact(transactions)
      const crossCulturalBridging = this.calculateCrossCulturalBridging(transactions)
      const knowledgeSharing = this.calculateKnowledgeSharing(transactions)
      const learningEngagement = this.calculateLearningEngagement(transactions)

      const overallFairnessScore = Math.round(
        (exchangeEquity + culturalContribution + communityImpact + 
         crossCulturalBridging + knowledgeSharing + learningEngagement) / 6
      )

      const metrics: FairExchangeMetrics = {
        userId,
        exchangeEquity,
        culturalContribution,
        communityImpact,
        crossCulturalBridging,
        knowledgeSharing,
        learningEngagement,
        overallFairnessScore,
        lastCalculated: Timestamp.now(),
      }

      // Save metrics
      await setDoc(doc(db, 'fair-exchange-metrics', userId), metrics)

      return metrics
    } catch (error) {
      console.error('Error calculating fair exchange metrics:', error)
      throw new Error('Failed to calculate fair exchange metrics')
    }
  }

  // Private helper methods
  private async updateAccountBalance(
    userId: string, 
    amount: number, 
    operation: 'add' | 'subtract',
    firestoreTransaction?: any
  ): Promise<void> {
    const accountRef = doc(db, 'timebank-accounts', `timebank-${userId}`)
    
    if (firestoreTransaction) {
      const accountDoc = await firestoreTransaction.get(accountRef)
      if (accountDoc.exists()) {
        const currentBalance = accountDoc.data().balance
        const newBalance = operation === 'add' ? currentBalance + amount : currentBalance - amount
        
        firestoreTransaction.update(accountRef, {
          balance: Math.max(0, newBalance),
          lastActivity: Timestamp.now(),
          ...(operation === 'add' && { totalEarned: accountDoc.data().totalEarned + amount }),
          ...(operation === 'subtract' && { totalSpent: accountDoc.data().totalSpent + amount }),
        })
      }
    } else {
      const accountDoc = await getDoc(accountRef)
      if (accountDoc.exists()) {
        const currentBalance = accountDoc.data().balance
        const newBalance = operation === 'add' ? currentBalance + amount : currentBalance - amount
        
        await updateDoc(accountRef, {
          balance: Math.max(0, newBalance),
          lastActivity: Timestamp.now(),
          ...(operation === 'add' && { totalEarned: accountDoc.data().totalEarned + amount }),
          ...(operation === 'subtract' && { totalSpent: accountDoc.data().totalSpent + amount }),
        })
      }
    }
  }

  private async updateAccountReserved(
    userId: string, 
    amount: number, 
    operation: 'add' | 'subtract',
    firestoreTransaction?: any
  ): Promise<void> {
    const accountRef = doc(db, 'timebank-accounts', `timebank-${userId}`)
    
    if (firestoreTransaction) {
      const accountDoc = await firestoreTransaction.get(accountRef)
      if (accountDoc.exists()) {
        const currentReserved = accountDoc.data().totalReserved
        const newReserved = operation === 'add' ? currentReserved + amount : currentReserved - amount
        
        firestoreTransaction.update(accountRef, {
          totalReserved: Math.max(0, newReserved),
          lastActivity: Timestamp.now(),
        })
      }
    }
  }

  private async freezeTransaction(transactionId: string): Promise<void> {
    const transactionRef = doc(db, 'time-transactions', transactionId)
    await updateDoc(transactionRef, {
      status: 'disputed',
    })
  }

  private calculateExchangeEquity(transactions: TimeTransaction[]): number {
    // Calculate how fair the user's exchanges have been
    // This is a simplified calculation
    const earnTransactions = transactions.filter(tx => tx.type === 'earn')
    const spendTransactions = transactions.filter(tx => tx.type === 'spend')
    
    if (earnTransactions.length === 0 && spendTransactions.length === 0) return 50
    
    const earnTotal = earnTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const spendTotal = spendTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    // Balanced earning and spending indicates good exchange equity
    const ratio = earnTotal > 0 ? spendTotal / earnTotal : 0
    return Math.min(100, Math.max(0, 100 - Math.abs(ratio - 1) * 100))
  }

  private calculateCulturalContribution(transactions: TimeTransaction[]): number {
    const culturalTransactions = transactions.filter(tx => 
      tx.culturalContext?.crossCulturalExchange || 
      tx.culturalContext?.traditionalKnowledgeInvolved
    )
    
    return Math.min(100, (culturalTransactions.length / Math.max(transactions.length, 1)) * 100)
  }

  private calculateCommunityImpact(transactions: TimeTransaction[]): number {
    const communityTransactions = transactions.filter(tx => 
      tx.culturalContext?.communityBenefit ||
      tx.category.secondary === 'community_service'
    )
    
    return Math.min(100, (communityTransactions.length / Math.max(transactions.length, 1)) * 100)
  }

  private calculateCrossCulturalBridging(transactions: TimeTransaction[]): number {
    const crossCulturalTransactions = transactions.filter(tx => 
      tx.culturalContext?.crossCulturalExchange
    )
    
    return Math.min(100, (crossCulturalTransactions.length / Math.max(transactions.length, 1)) * 100)
  }

  private calculateKnowledgeSharing(transactions: TimeTransaction[]): number {
    const teachingTransactions = transactions.filter(tx => 
      tx.type === 'earn' && tx.category.primary === 'skill_teaching'
    )
    
    return Math.min(100, (teachingTransactions.length / Math.max(transactions.length, 1)) * 100)
  }

  private calculateLearningEngagement(transactions: TimeTransaction[]): number {
    const learningTransactions = transactions.filter(tx => 
      tx.type === 'spend' && tx.category.primary === 'skill_teaching'
    )
    
    return Math.min(100, (learningTransactions.length / Math.max(transactions.length, 1)) * 100)
  }
}

export const timeBankingService = new TimeBankingService()
