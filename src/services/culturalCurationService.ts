import {
  CulturalAchievementCuration,
  CurationMetadata,
  CulturalValidation,
  HistoricalVerification,
  PublicationStatus,
  CommunityEndorsementData,
  TraditionalElement,
  CulturalProtocol,
  SensitivityLevel,
  ValidationCriterion,
  ExpertConsultation,
  HistoricalSource,
  KnowledgeKeeper
} from '../types/achievement';

export interface CurationRequest {
  achievementId: string;
  culturalRepresentativeId: string;
  curationReason: string;
  proposedSignificance: string;
  traditionalElements: string[];
  culturalProtocols: string[];
  sensitivityLevel: 'public' | 'community_only' | 'restricted' | 'sacred';
  communityConsultationRequired: boolean;
}

export interface ValidationRequest {
  curationId: string;
  validatorId: string;
  validatorType: 'historian' | 'cultural_expert' | 'traditional_knowledge_keeper' | 'academic';
  validationCriteria: string[];
  expertiseAreas: string[];
}

export interface CommunityReviewData {
  curationId: string;
  reviewerId: string;
  reviewType: 'accuracy' | 'cultural_appropriateness' | 'completeness' | 'sensitivity';
  rating: number;
  feedback: string;
  culturalContext: string;
}

export interface PublicationDecision {
  curationId: string;
  decision: 'approve' | 'reject' | 'request_revision';
  visibility: 'public' | 'community_only' | 'cultural_representatives_only';
  conditions: string[];
  reviewNotes: string;
}

class CulturalCurationService {
  private curations: Map<string, CulturalAchievementCuration> = new Map();
  private validationQueue: Map<string, ValidationRequest[]> = new Map();
  private communityReviews: Map<string, CommunityReviewData[]> = new Map();
  private expertNetwork: Map<string, any> = new Map();

  constructor() {
    this.initializeExpertNetwork();
  }

  // Curation Management
  async submitCurationRequest(request: CurationRequest): Promise<CulturalAchievementCuration> {
    const curation: CulturalAchievementCuration = {
      id: this.generateId(),
      culturalRepresentativeId: request.culturalRepresentativeId,
      achievementId: request.achievementId,
      curationMetadata: {
        culturalSignificance: {
          significanceLevel: 'community',
          culturalImpact: request.proposedSignificance,
          traditionalKnowledgeElements: request.traditionalElements,
          modernRelevance: 'Contemporary cultural significance',
          preservationValue: 8,
          educationalValue: 7
        },
        traditionalElements: request.traditionalElements.map(element => ({
          element,
          significance: 'Traditional cultural practice',
          authenticity: 'verified' as const
        })),
        modernRelevance: {
          contemporarySignificance: request.proposedSignificance,
          modernApplications: [],
          culturalContinuity: 'Strong connection to traditional practices',
          adaptationRespect: true
        },
        culturalProtocols: request.culturalProtocols.map(protocol => ({
          protocol,
          description: 'Cultural protocol for respectful engagement',
          importance: 'required' as const,
          culturalContext: 'Traditional cultural practice'
        })),
        sensitivityLevel: {
          level: request.sensitivityLevel,
          restrictions: this.determineSensitivityRestrictions(request.sensitivityLevel),
          accessRequirements: this.determineAccessRequirements(request.sensitivityLevel)
        },
        sharingRestrictions: this.determineSharingRestrictions(request.sensitivityLevel),
        communityPermissions: {
          hasPermission: false,
          grantedBy: '',
          grantDate: new Date(),
          conditions: [],
          revocable: true
        }
      },
      culturalValidation: {
        primaryValidator: request.culturalRepresentativeId,
        secondaryValidators: [],
        validationCriteria: this.getDefaultValidationCriteria(),
        expertConsultations: [],
        communityFeedback: [],
        validationScore: 0,
        culturalAccuracyRating: 0
      },
      communityEndorsement: {
        endorsements: [],
        votingResults: {
          totalVotes: 0,
          approvalPercentage: 0,
          culturalCommunityVotes: 0,
          generalCommunityVotes: 0,
          votingPeriod: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
            historicalPeriod: 'democratic_era',
            culturalCalendarAlignment: []
          }
        },
        representativeApproval: {
          approvedBy: '',
          approvalDate: new Date(),
          approvalNotes: '',
          conditions: []
        }
      },
      historicalVerification: {
        primarySources: [],
        secondarySources: [],
        expertVerification: [],
        traditionalKnowledgeKeepers: [],
        verificationLevel: 'preliminary',
        accuracyConfidence: 0,
        factCheckingResults: []
      },
      crossCulturalElements: [],
      publicationStatus: {
        status: 'draft',
        visibility: 'cultural_representatives_only',
        featuredStatus: false
      },
      impactMetrics: {
        communityEngagement: 0,
        culturalLearning: 0,
        crossCulturalDiscovery: 0,
        historicalPreservation: 0,
        educationalValue: 0
      }
    };

    this.curations.set(curation.id, curation);
    
    // Initiate validation process if community consultation is required
    if (request.communityConsultationRequired) {
      await this.initiateValidationProcess(curation.id);
    }

    return curation;
  }

  async getCuration(curationId: string): Promise<CulturalAchievementCuration | null> {
    return this.curations.get(curationId) || null;
  }

  async updateCurationMetadata(curationId: string, metadata: Partial<CurationMetadata>): Promise<CulturalAchievementCuration> {
    const curation = this.curations.get(curationId);
    if (!curation) {
      throw new Error('Curation not found');
    }

    curation.curationMetadata = {
      ...curation.curationMetadata,
      ...metadata
    };

    this.curations.set(curationId, curation);
    return curation;
  }

  // Validation Process
  async initiateValidationProcess(curationId: string): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) {
      throw new Error('Curation not found');
    }

    // Identify required validators based on cultural context and sensitivity
    const requiredValidators = await this.identifyRequiredValidators(curation);
    
    // Create validation requests
    const validationRequests: ValidationRequest[] = requiredValidators.map(validator => ({
      curationId,
      validatorId: validator.id,
      validatorType: validator.type,
      validationCriteria: this.getValidationCriteriaForType(validator.type),
      expertiseAreas: validator.expertiseAreas
    }));

    this.validationQueue.set(curationId, validationRequests);

    // Notify validators
    await this.notifyValidators(validationRequests);
  }

  async submitExpertValidation(
    curationId: string, 
    validatorId: string, 
    validation: ExpertConsultation
  ): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) {
      throw new Error('Curation not found');
    }

    curation.culturalValidation.expertConsultations.push(validation);
    
    // Update validation score
    await this.updateValidationScore(curationId);
    
    this.curations.set(curationId, curation);
  }

  async addHistoricalSource(curationId: string, source: HistoricalSource): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) {
      throw new Error('Curation not found');
    }

    if (source.reliability >= 8) {
      curation.historicalVerification.primarySources.push(source);
    } else {
      curation.historicalVerification.secondarySources.push(source);
    }

    // Update verification level based on sources
    await this.updateVerificationLevel(curationId);
    
    this.curations.set(curationId, curation);
  }

  async consultTraditionalKnowledgeKeeper(
    curationId: string, 
    keeper: KnowledgeKeeper
  ): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) {
      throw new Error('Curation not found');
    }

    curation.historicalVerification.traditionalKnowledgeKeepers.push(keeper);
    
    // Traditional knowledge keeper consultation carries high weight
    curation.historicalVerification.accuracyConfidence += 20;
    
    this.curations.set(curationId, curation);
  }

  // Community Review Process
  async submitCommunityReview(review: CommunityReviewData): Promise<void> {
    const reviews = this.communityReviews.get(review.curationId) || [];
    reviews.push(review);
    this.communityReviews.set(review.curationId, reviews);

    const curation = this.curations.get(review.curationId);
    if (curation) {
      curation.culturalValidation.communityFeedback.push({
        feedbackId: this.generateId(),
        providerId: review.reviewerId,
        feedbackType: review.reviewType,
        feedback: review.feedback,
        rating: review.rating,
        date: new Date()
      });

      // Update community approval metrics
      await this.updateCommunityApproval(review.curationId);
      
      this.curations.set(review.curationId, curation);
    }
  }

  async getCommunityReviews(curationId: string): Promise<CommunityReviewData[]> {
    return this.communityReviews.get(curationId) || [];
  }

  async calculateCommunityConsensus(curationId: string): Promise<any> {
    const reviews = this.communityReviews.get(curationId) || [];
    const curation = this.curations.get(curationId);
    
    if (!curation || reviews.length === 0) {
      return { consensus: 'insufficient_data', confidence: 0 };
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const culturalCommunityReviews = reviews.filter(r => 
      this.isCulturalCommunityMember(r.reviewerId, r.culturalContext)
    );
    
    const culturalConsensus = culturalCommunityReviews.length > 0 
      ? culturalCommunityReviews.reduce((sum, r) => sum + r.rating, 0) / culturalCommunityReviews.length
      : 0;

    const consensus = averageRating >= 7 && culturalConsensus >= 7 ? 'approved' :
                     averageRating <= 4 || culturalConsensus <= 4 ? 'rejected' : 'mixed';

    return {
      consensus,
      confidence: Math.min(reviews.length * 10, 100),
      averageRating,
      culturalConsensus,
      totalReviews: reviews.length,
      culturalCommunityReviews: culturalCommunityReviews.length
    };
  }

  // Publication Management
  async makePublicationDecision(decision: PublicationDecision): Promise<CulturalAchievementCuration> {
    const curation = this.curations.get(decision.curationId);
    if (!curation) {
      throw new Error('Curation not found');
    }

    const newStatus: PublicationStatus = {
      status: decision.decision === 'approve' ? 'published' : 
              decision.decision === 'reject' ? 'archived' : 'cultural_review',
      publishDate: decision.decision === 'approve' ? new Date() : undefined,
      visibility: decision.visibility,
      featuredStatus: false
    };

    curation.publicationStatus = newStatus;

    // If approved, update impact metrics
    if (decision.decision === 'approve') {
      await this.updateImpactMetrics(decision.curationId);
    }

    this.curations.set(decision.curationId, curation);
    return curation;
  }

  async getPublishedCurations(filters?: any): Promise<CulturalAchievementCuration[]> {
    const published = Array.from(this.curations.values()).filter(c => 
      c.publicationStatus.status === 'published'
    );

    if (filters?.culturalContext) {
      return published.filter(c => 
        c.curationMetadata.culturalSignificance.traditionalKnowledgeElements
          .some(element => element.includes(filters.culturalContext))
      );
    }

    if (filters?.sensitivityLevel) {
      return published.filter(c => 
        c.curationMetadata.sensitivityLevel.level === filters.sensitivityLevel
      );
    }

    return published.sort((a, b) => 
      b.impactMetrics.communityEngagement - a.impactMetrics.communityEngagement
    );
  }

  async getFeaturedCurations(): Promise<CulturalAchievementCuration[]> {
    return Array.from(this.curations.values()).filter(c => 
      c.publicationStatus.status === 'published' && c.publicationStatus.featuredStatus
    );
  }

  // Analytics and Reporting
  async generateCurationReport(timeframe: { startDate: Date; endDate: Date }): Promise<any> {
    const curations = Array.from(this.curations.values());
    const timeframeCurations = curations.filter(c => 
      c.publicationStatus.publishDate && 
      c.publicationStatus.publishDate >= timeframe.startDate && 
      c.publicationStatus.publishDate <= timeframe.endDate
    );

    const totalCurations = timeframeCurations.length;
    const publishedCurations = timeframeCurations.filter(c => c.publicationStatus.status === 'published').length;
    const averageValidationScore = timeframeCurations.reduce((sum, c) => sum + c.culturalValidation.validationScore, 0) / totalCurations || 0;

    const culturalDistribution = this.calculateCulturalDistribution(timeframeCurations);
    const sensitivityDistribution = this.calculateSensitivityDistribution(timeframeCurations);

    return {
      timeframe,
      totalCurations,
      publishedCurations,
      publicationRate: (publishedCurations / totalCurations) * 100 || 0,
      averageValidationScore,
      culturalDistribution,
      sensitivityDistribution,
      topCurations: timeframeCurations
        .sort((a, b) => b.impactMetrics.communityEngagement - a.impactMetrics.communityEngagement)
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          culturalSignificance: c.curationMetadata.culturalSignificance.culturalImpact,
          engagement: c.impactMetrics.communityEngagement
        }))
    };
  }

  async getCurationsByRepresentative(representativeId: string): Promise<CulturalAchievementCuration[]> {
    return Array.from(this.curations.values()).filter(c => 
      c.culturalRepresentativeId === representativeId
    );
  }

  async getPendingValidations(validatorId: string): Promise<ValidationRequest[]> {
    const allValidations: ValidationRequest[] = [];
    
    for (const [curationId, requests] of this.validationQueue) {
      const userRequests = requests.filter(r => r.validatorId === validatorId);
      allValidations.push(...userRequests);
    }

    return allValidations;
  }

  // Helper Methods
  private initializeExpertNetwork(): void {
    // Initialize expert network with cultural representatives, historians, etc.
    this.expertNetwork.set('expert-1', {
      id: 'expert-1',
      type: 'cultural_expert',
      expertiseAreas: ['Zulu traditions', 'oral history'],
      culturalContext: 'Zulu',
      credentials: ['PhD Cultural Studies', 'Community Elder']
    });

    this.expertNetwork.set('expert-2', {
      id: 'expert-2',
      type: 'historian',
      expertiseAreas: ['South African history', 'colonial period'],
      culturalContext: 'Academic',
      credentials: ['PhD History', 'Published researcher']
    });

    this.expertNetwork.set('keeper-1', {
      id: 'keeper-1',
      type: 'traditional_knowledge_keeper',
      expertiseAreas: ['traditional medicine', 'ceremonial practices'],
      culturalContext: 'Xhosa',
      credentials: ['Traditional healer', 'Community recognized']
    });
  }

  private async identifyRequiredValidators(curation: CulturalAchievementCuration): Promise<any[]> {
    const validators = [];
    const sensitivityLevel = curation.curationMetadata.sensitivityLevel.level;
    
    // Always require cultural expert for the primary culture
    const culturalExperts = Array.from(this.expertNetwork.values()).filter(expert => 
      expert.type === 'cultural_expert'
    );
    if (culturalExperts.length > 0) {
      validators.push(culturalExperts[0]);
    }

    // Require historian for historical claims
    if (curation.historicalVerification.primarySources.length > 0) {
      const historians = Array.from(this.expertNetwork.values()).filter(expert => 
        expert.type === 'historian'
      );
      if (historians.length > 0) {
        validators.push(historians[0]);
      }
    }

    // Require traditional knowledge keeper for sacred or restricted content
    if (sensitivityLevel === 'sacred' || sensitivityLevel === 'restricted') {
      const keepers = Array.from(this.expertNetwork.values()).filter(expert => 
        expert.type === 'traditional_knowledge_keeper'
      );
      if (keepers.length > 0) {
        validators.push(keepers[0]);
      }
    }

    return validators;
  }

  private getDefaultValidationCriteria(): ValidationCriterion[] {
    return [
      { criterion: 'Cultural accuracy', weight: 30, passed: false, notes: '' },
      { criterion: 'Historical accuracy', weight: 25, passed: false, notes: '' },
      { criterion: 'Cultural sensitivity', weight: 25, passed: false, notes: '' },
      { criterion: 'Community appropriateness', weight: 20, passed: false, notes: '' }
    ];
  }

  private getValidationCriteriaForType(validatorType: string): string[] {
    const criteria = {
      'cultural_expert': ['Cultural accuracy', 'Traditional knowledge validation', 'Community appropriateness'],
      'historian': ['Historical accuracy', 'Source verification', 'Factual consistency'],
      'traditional_knowledge_keeper': ['Sacred knowledge protocols', 'Cultural sensitivity', 'Traditional authenticity'],
      'academic': ['Academic rigor', 'Research methodology', 'Citation accuracy']
    };

    return criteria[validatorType as keyof typeof criteria] || ['General validation'];
  }

  private async notifyValidators(requests: ValidationRequest[]): Promise<void> {
    // In a real implementation, this would send notifications to validators
    console.log(`Notifying ${requests.length} validators for validation requests`);
  }

  private async updateValidationScore(curationId: string): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) return;

    const consultations = curation.culturalValidation.expertConsultations;
    if (consultations.length === 0) return;

    const averageConfidence = consultations.reduce((sum, c) => sum + c.confidence, 0) / consultations.length;
    curation.culturalValidation.validationScore = averageConfidence;
    curation.culturalValidation.culturalAccuracyRating = averageConfidence;
  }

  private async updateVerificationLevel(curationId: string): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) return;

    const verification = curation.historicalVerification;
    const primarySources = verification.primarySources.length;
    const secondarySources = verification.secondarySources.length;
    const expertVerifications = verification.expertVerification.length;
    const knowledgeKeepers = verification.traditionalKnowledgeKeepers.length;

    if (knowledgeKeepers > 0 && primarySources > 2 && expertVerifications > 1) {
      verification.verificationLevel = 'culturally_endorsed';
    } else if (primarySources > 1 && expertVerifications > 0) {
      verification.verificationLevel = 'expert_verified';
    } else if (primarySources > 0 || secondarySources > 1) {
      verification.verificationLevel = 'validated';
    }

    // Update confidence based on sources and verifications
    verification.accuracyConfidence = Math.min(
      (primarySources * 20) + (secondarySources * 10) + (expertVerifications * 15) + (knowledgeKeepers * 25),
      100
    );
  }

  private async updateCommunityApproval(curationId: string): Promise<void> {
    const reviews = this.communityReviews.get(curationId) || [];
    const curation = this.curations.get(curationId);
    if (!curation) return;

    const totalVotes = reviews.length;
    const approvalVotes = reviews.filter(r => r.rating >= 7).length;
    const approvalPercentage = totalVotes > 0 ? (approvalVotes / totalVotes) * 100 : 0;

    const culturalCommunityVotes = reviews.filter(r => 
      this.isCulturalCommunityMember(r.reviewerId, r.culturalContext)
    ).length;

    curation.communityEndorsement.votingResults = {
      ...curation.communityEndorsement.votingResults,
      totalVotes,
      approvalPercentage,
      culturalCommunityVotes,
      generalCommunityVotes: totalVotes - culturalCommunityVotes
    };
  }

  private async updateImpactMetrics(curationId: string): Promise<void> {
    const curation = this.curations.get(curationId);
    if (!curation) return;

    // Simulate impact metrics calculation
    curation.impactMetrics = {
      communityEngagement: Math.floor(Math.random() * 100) + 50,
      culturalLearning: Math.floor(Math.random() * 100) + 40,
      crossCulturalDiscovery: Math.floor(Math.random() * 100) + 30,
      historicalPreservation: curation.historicalVerification.accuracyConfidence,
      educationalValue: curation.curationMetadata.culturalSignificance.educationalValue * 10
    };
  }

  private determineSensitivityRestrictions(level: string): string[] {
    const restrictions = {
      'public': [],
      'community_only': ['Requires community membership'],
      'restricted': ['Requires cultural representative approval', 'Limited sharing'],
      'sacred': ['Sacred content - restricted access', 'No commercial use', 'Cultural protocols required']
    };

    return restrictions[level as keyof typeof restrictions] || [];
  }

  private determineAccessRequirements(level: string): string[] {
    const requirements = {
      'public': [],
      'community_only': ['Community membership verification'],
      'restricted': ['Cultural representative endorsement', 'Purpose statement'],
      'sacred': ['Traditional knowledge keeper approval', 'Cultural protocol training', 'Community elder endorsement']
    };

    return requirements[level as keyof typeof requirements] || [];
  }

  private determineSharingRestrictions(level: string): any[] {
    const baseRestrictions = [
      {
        restrictionType: 'attribution_required',
        description: 'Attribution to cultural community required',
        enforcement: 'automatic'
      }
    ];

    if (level === 'sacred' || level === 'restricted') {
      baseRestrictions.push({
        restrictionType: 'no_commercial_use',
        description: 'Commercial use prohibited',
        enforcement: 'community_moderated'
      });
    }

    if (level === 'sacred') {
      baseRestrictions.push({
        restrictionType: 'sacred_content',
        description: 'Sacred cultural content - special protocols apply',
        enforcement: 'expert_reviewed'
      });
    }

    return baseRestrictions;
  }

  private isCulturalCommunityMember(reviewerId: string, culturalContext: string): boolean {
    // Simplified check - in real implementation would verify community membership
    return Math.random() > 0.5; // 50% chance for simulation
  }

  private calculateCulturalDistribution(curations: CulturalAchievementCuration[]): { [culture: string]: number } {
    const distribution: { [culture: string]: number } = {};
    curations.forEach(curation => {
      curation.curationMetadata.culturalSignificance.traditionalKnowledgeElements.forEach(element => {
        // Simplified - would extract culture from element
        const culture = 'Zulu'; // Placeholder
        distribution[culture] = (distribution[culture] || 0) + 1;
      });
    });
    return distribution;
  }

  private calculateSensitivityDistribution(curations: CulturalAchievementCuration[]): { [level: string]: number } {
    const distribution: { [level: string]: number } = {};
    curations.forEach(curation => {
      const level = curation.curationMetadata.sensitivityLevel.level;
      distribution[level] = (distribution[level] || 0) + 1;
    });
    return distribution;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const culturalCurationService = new CulturalCurationService();
