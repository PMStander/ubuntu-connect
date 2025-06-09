export interface AchievementCreationData {
  title: string;
  description: string;
  category: {
    primary: 'sports' | 'arts' | 'business' | 'education' | 'innovation' | 'community_service';
    secondary: string[];
    crossCultural: boolean;
    nationalSignificance: 'local' | 'provincial' | 'national' | 'international';
  };
  culturalContext: {
    primaryCulture: string;
    secondaryCultures: string[];
    culturalSignificance: string;
    traditionalElements: string[];
    crossCulturalElements: string[];
  };
  location: GeographicLocation;
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  mediaContent: {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    caption: string;
    culturalContext?: string;
  }[];
  submissionSource: {
    submitterId: string;
    submitterRole: 'community_member' | 'cultural_representative' | 'verified_expert';
    communityEndorsements: string[];
  };
}

export interface BadgeEligibility {
  badgeType: BadgeType;
  eligible: boolean;
  progress: number;
  requirements: BadgeRequirement[];
  nextMilestone: string;
  estimatedTimeToEarn: string;
}

export interface BadgeAward {
  badge: UserBadge;
  celebrationMessage: string;
  culturalContext: string;
  nextLevelInfo: BadgeLevel | null;
  sharingRecommendations: string[];
}

export interface InteractionEvent {
  userId: string;
  interactionType: InteractionType;
  participantCultures: string[];
  duration: number;
  qualityScore: number;
  culturalLearningOutcomes: LearningOutcome[];
  timestamp: Date;
  verificationMethod: 'automatic' | 'community_validation' | 'expert_review';
}

export interface ServiceActivity {
  userId: string;
  activityType: 'volunteering' | 'organizing' | 'mentoring' | 'facilitating' | 'advocating';
  communityBenefited: string;
  culturalContext: string;
  hoursContributed: number;
  impactDescription: string;
  verificationDocuments: string[];
  communityEndorsements: string[];
  timestamp: Date;
}

export interface BridgeBuildingEvent {
  userId: string;
  eventType: 'connection_facilitation' | 'conflict_resolution' | 'cultural_education' | 'inclusive_advocacy';
  culturesInvolved: string[];
  participantsConnected: number;
  sustainableOutcome: boolean;
  impactMeasurement: string;
  communityFeedback: string[];
  timestamp: Date;
}

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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  culturalContext: CulturalContext;
  location: GeographicLocation;
  timeframe: DateRange;
  mediaContent: MediaContent[];
  verification: VerificationStatus;
  communityEndorsements: CommunityEndorsement[];
  culturalSignificance: CulturalSignificance;
  relatedAchievements: string[];
  socialImpact: ImpactMetrics;
  submissionSource: SubmissionSource;
  engagementMetrics: EngagementMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementCategory {
  primary: 'sports' | 'arts' | 'business' | 'education' | 'innovation' | 'community_service';
  secondary: string[];
  crossCultural: boolean;
  nationalSignificance: 'local' | 'provincial' | 'national' | 'international';
}

export interface CulturalContext {
  primaryCulture: string;
  secondaryCultures: string[];
  culturalSignificance: string;
  traditionalElements: string[];
  modernAdaptations: string[];
  crossCulturalElements: CrossCulturalElement[];
}

export interface CrossCulturalElement {
  element: string;
  culturalOrigins: string[];
  collaborationType: 'cultural_exchange' | 'joint_project' | 'knowledge_sharing' | 'celebration';
  impactDescription: string;
}

export interface GeographicLocation {
  country: string;
  province: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  culturalRegion?: string;
  traditionalName?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  historicalPeriod: string;
  culturalCalendarAlignment: string[];
}

export interface MediaContent {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  caption: string;
  culturalContext: string;
  accessibility: AccessibilityInfo;
  permissions: MediaPermissions;
}

export interface AccessibilityInfo {
  altText: string;
  transcription: string;
  culturalDescription: string;
}

export interface MediaPermissions {
  publicAccess: boolean;
  culturalCommunityAccess: boolean;
  commercialUse: boolean;
  attribution: 'required' | 'optional' | 'none';
}

export interface VerificationStatus {
  status: 'pending' | 'community_review' | 'cultural_review' | 'verified' | 'rejected';
  reviewers: ReviewerInfo[];
  verificationScore: number;
  factCheckResults: FactCheckResult[];
  communityApproval: CommunityApprovalMetrics;
  culturalApproval: CulturalApprovalMetrics;
}

export interface ReviewerInfo {
  reviewerId: string;
  reviewerType: 'community_member' | 'cultural_representative' | 'expert' | 'historian';
  reviewDate: Date;
  reviewScore: number;
  reviewComments: string;
}

export interface FactCheckResult {
  claim: string;
  verificationStatus: 'verified' | 'disputed' | 'unverified';
  sources: string[];
  confidence: number;
}

export interface CommunityApprovalMetrics {
  approvalScore: number;
  totalVotes: number;
  culturalRepresentativeApproval: boolean;
  communityEndorsements: string[];
}

export interface CulturalApprovalMetrics {
  culturalRepresentativeId: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  culturalAccuracyScore: number;
  traditionalKnowledgeValidation: boolean;
  culturalSensitivityCheck: 'pending' | 'passed' | 'failed';
}

export interface CommunityEndorsement {
  endorserId: string;
  endorsementType: 'community_support' | 'expert_validation' | 'cultural_approval';
  endorsementDate: Date;
  endorsementDetails: string;
  culturalContext: string;
}

export interface CulturalSignificance {
  significanceLevel: 'personal' | 'community' | 'regional' | 'national' | 'international';
  culturalImpact: string;
  traditionalKnowledgeElements: string[];
  modernRelevance: string;
  preservationValue: number; // 1-10 scale
  educationalValue: number; // 1-10 scale
}

export interface ImpactMetrics {
  communityBenefit: string;
  culturalPreservation: string;
  crossCulturalUnderstanding: string;
  inspirationalValue: number; // 1-10 scale
  roleModelPotential: number; // 1-10 scale
}

export interface SubmissionSource {
  submitterId: string;
  submissionDate: Date;
  submitterRole: 'community_member' | 'cultural_representative' | 'verified_expert';
  submissionMethod: 'web_form' | 'mobile_app' | 'api' | 'bulk_import';
  verificationDocuments: string[];
  communityEndorsements: string[];
}

export interface EngagementMetrics {
  views: number;
  shares: number;
  culturalDiscoveries: number;
  inspirationSaves: number;
  crossCulturalEngagement: number;
}

export interface AchievementFilters {
  category?: string;
  culturalContext?: string;
  location?: GeographicLocation;
  timeframe?: DateRange;
  verificationStatus?: string;
  nationalSignificance?: string;
  crossCultural?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchQuery {
  searchText: string;
  filters?: AchievementFilters;
  sortBy?: 'relevance' | 'date' | 'popularity' | 'cultural_significance';
  limit?: number;
}

export interface AchievementSubmission {
  title: string;
  description: string;
  category: AchievementCategory;
  culturalContext: CulturalContext;
  location: GeographicLocation;
  timeframe: DateRange;
  mediaContent: MediaContent[];
  submissionSource: SubmissionSource;
  verificationDocuments: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  culturalContext: string;
  category: string;
  significance: string;
  description: string;
  mediaUrl: string;
  crossCultural: boolean;
}

export interface EngagementReport {
  timeframe: DateRange;
  totalAchievements: number;
  totalViews: number;
  totalShares: number;
  crossCulturalEngagement: number;
  averageEngagement: number;
  culturalDistribution: { [culture: string]: number };
  categoryDistribution: { [category: string]: number };
  topAchievements: {
    id: string;
    title: string;
    views: number;
  }[];
}

// Badge System Types (for Story 6-17)
export interface UserBadge {
  id: string;
  userId: string;
  badgeType: BadgeType;
  level: BadgeLevel;
  earnedDate: Date;
  verificationStatus: BadgeVerificationStatus;
  culturalContext: CrossCulturalContext;
  impactMetrics: BadgeImpactMetrics;
  sharingPermissions: SharingPermissions;
}

export interface BadgeType {
  category: 'cross_cultural_engagement' | 'community_service' | 'bridge_building' | 'cultural_learning' | 'mentorship' | 'collaboration';
  specificType: string;
  description: string;
  requirements: BadgeRequirement[];
  culturalScope: CulturalScope;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface BadgeLevel {
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'cultural_ambassador';
  pointsRequired: number;
  specialPrivileges: string[];
}

export interface BadgeVerificationStatus {
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy: string;
  verificationDate?: Date;
  communityEndorsements: number;
}

export interface CrossCulturalContext {
  culturesInvolved: string[];
  interactionType: InteractionType;
  impactLevel: 'individual' | 'community' | 'regional' | 'national';
  sustainabilityMetrics: SustainabilityMetrics;
  bridgeBuildingScore: number;
  culturalLearningOutcomes: LearningOutcome[];
}

export interface InteractionType {
  type: 'conversation' | 'collaboration' | 'mentorship' | 'event_participation' | 'content_sharing';
  duration: number;
  qualityScore: number;
  participants: string[];
}

export interface SustainabilityMetrics {
  ongoingEngagement: boolean;
  relationshipDevelopment: number; // 1-10 scale
  culturalUnderstandingGrowth: number; // 1-10 scale
  communityImpact: number; // 1-10 scale
}

export interface LearningOutcome {
  outcome: string;
  culturalContext: string;
  learningType: 'knowledge' | 'skill' | 'understanding' | 'appreciation';
  participants: string[];
}

export interface BadgeRequirement {
  requirement: string;
  quantitativeTarget?: number;
  qualitativeTarget?: string;
  timeframe?: string;
  verificationMethod: 'automatic' | 'community_validation' | 'expert_review';
}

export interface CulturalScope {
  minimumCultures: number;
  specificCultures?: string[];
  crossCulturalRequired: boolean;
  communityServiceRequired: boolean;
}

export interface BadgeImpactMetrics {
  crossCulturalConnections: number;
  communityServiceHours: number;
  culturalLearningMoments: number;
  bridgeBuildingInstances: number;
  mentorshipRelationships: number;
}

export interface SharingPermissions {
  publicProfile: boolean;
  communitySharing: boolean;
  socialMediaSharing: boolean;
  culturalRepresentativeSharing: boolean;
}

// Cultural Curation Types (for Story 6-18)
export interface CulturalAchievementCuration {
  id: string;
  culturalRepresentativeId: string;
  achievementId: string;
  curationMetadata: CurationMetadata;
  culturalValidation: CulturalValidation;
  communityEndorsement: CommunityEndorsementData;
  historicalVerification: HistoricalVerification;
  crossCulturalElements: CrossCulturalElement[];
  publicationStatus: PublicationStatus;
  impactMetrics: CurationImpactMetrics;
}

export interface CurationMetadata {
  culturalSignificance: CulturalSignificance;
  traditionalElements: TraditionalElement[];
  modernRelevance: ModernRelevance;
  culturalProtocols: CulturalProtocol[];
  sensitivityLevel: SensitivityLevel;
  sharingRestrictions: SharingRestriction[];
  communityPermissions: CommunityPermission;
}

export interface CulturalValidation {
  primaryValidator: string;
  secondaryValidators: string[];
  validationCriteria: ValidationCriterion[];
  expertConsultations: ExpertConsultation[];
  communityFeedback: CommunityFeedback[];
  validationScore: number;
  culturalAccuracyRating: number;
}

export interface HistoricalVerification {
  primarySources: HistoricalSource[];
  secondarySources: HistoricalSource[];
  expertVerification: ExpertVerification[];
  traditionalKnowledgeKeepers: KnowledgeKeeper[];
  verificationLevel: 'preliminary' | 'validated' | 'expert_verified' | 'culturally_endorsed';
  accuracyConfidence: number;
  factCheckingResults: FactCheckResult[];
}

export interface TraditionalElement {
  element: string;
  significance: string;
  authenticity: 'verified' | 'traditional' | 'adapted' | 'modern_interpretation';
}

export interface ModernRelevance {
  contemporarySignificance: string;
  modernApplications: string[];
  culturalContinuity: string;
  adaptationRespect: boolean;
}

export interface CulturalProtocol {
  protocol: string;
  description: string;
  importance: 'optional' | 'recommended' | 'required';
  culturalContext: string;
}

export interface SensitivityLevel {
  level: 'public' | 'community_only' | 'restricted' | 'sacred';
  restrictions: string[];
  accessRequirements: string[];
}

export interface SharingRestriction {
  restrictionType: 'cultural_community_only' | 'no_commercial_use' | 'attribution_required' | 'sacred_content';
  description: string;
  enforcement: 'automatic' | 'community_moderated' | 'expert_reviewed';
}

export interface CommunityPermission {
  hasPermission: boolean;
  grantedBy: string;
  grantDate: Date;
  conditions: string[];
  revocable: boolean;
}

export interface ValidationCriterion {
  criterion: string;
  weight: number;
  passed: boolean;
  notes: string;
}

export interface ExpertConsultation {
  expertId: string;
  expertType: 'historian' | 'cultural_expert' | 'traditional_knowledge_keeper' | 'academic';
  consultationDate: Date;
  findings: string;
  recommendations: string[];
  confidence: number;
}

export interface CommunityFeedback {
  feedbackId: string;
  providerId: string;
  feedbackType: 'accuracy' | 'cultural_appropriateness' | 'completeness' | 'sensitivity';
  feedback: string;
  rating: number;
  date: Date;
}

export interface HistoricalSource {
  sourceId: string;
  sourceType: 'document' | 'oral_tradition' | 'artifact' | 'photograph' | 'recording';
  title: string;
  author?: string;
  date?: Date;
  location?: string;
  reliability: number; // 1-10 scale
  culturalContext: string;
}

export interface ExpertVerification {
  expertId: string;
  verificationDate: Date;
  verificationStatus: 'verified' | 'disputed' | 'requires_more_research';
  confidence: number;
  notes: string;
}

export interface KnowledgeKeeper {
  keeperId: string;
  culturalRole: string;
  community: string;
  expertise: string[];
  consultationDate: Date;
  validation: string;
}

export interface PublicationStatus {
  status: 'draft' | 'community_review' | 'cultural_review' | 'published' | 'archived';
  publishDate?: Date;
  visibility: 'public' | 'community_only' | 'cultural_representatives_only';
  featuredStatus: boolean;
}

export interface CurationImpactMetrics {
  communityEngagement: number;
  culturalLearning: number;
  crossCulturalDiscovery: number;
  historicalPreservation: number;
  educationalValue: number;
}

export interface CommunityEndorsementData {
  endorsements: CommunityEndorsement[];
  votingResults: VotingResults;
  representativeApproval: RepresentativeApproval;
}

export interface VotingResults {
  totalVotes: number;
  approvalPercentage: number;
  culturalCommunityVotes: number;
  generalCommunityVotes: number;
  votingPeriod: DateRange;
}

export interface RepresentativeApproval {
  approvedBy: string;
  approvalDate: Date;
  approvalNotes: string;
  conditions: string[];
}
