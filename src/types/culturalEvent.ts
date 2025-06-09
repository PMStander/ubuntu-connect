export interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  culturalContext: EventCulturalContext;
  eventType: 'celebration' | 'workshop' | 'festival' | 'educational' | 'performance' | 'exhibition' | 'ceremony';
  format: 'in_person' | 'virtual' | 'hybrid';
  location: EventLocation;
  dateTime: EventDateTime;
  organizers: EventOrganizer[];
  targetCommunities: TargetCommunity[];
  culturalRequirements: CulturalRequirement[];
  programming: EventProgramming;
  ticketing: TicketingConfiguration;
  accessibility: AccessibilityFeatures;
  promotion: PromotionSettings;
  status: 'planning' | 'promoting' | 'active' | 'completed' | 'cancelled' | 'postponed';
  attendees: EventAttendee[];
  impact: EventImpact;
  culturalDocumentation: CulturalDocumentation;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventCulturalContext {
  primaryCultures: string[];
  culturalSignificance: string;
  traditionalElements: TraditionalElement[];
  culturalLearningObjectives: LearningObjective[];
  culturalSensitivities: CulturalSensitivity[];
  culturalProtocols: CulturalProtocol[];
  heritageConnections: HeritageConnection[];
  crossCulturalGoals: CrossCulturalGoal[];
}

export interface TraditionalElement {
  element: string;
  significance: string;
  authenticity: 'verified' | 'traditional' | 'adapted' | 'modern_interpretation';
}

export interface LearningObjective {
  objective: string;
  culturalContext: string;
  expectedOutcome: string;
}

export interface CulturalSensitivity {
  area: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  guidelines: string[];
}

export interface CulturalProtocol {
  protocol: string;
  description: string;
  importance: 'optional' | 'recommended' | 'required';
  culturalContext: string;
}

export interface HeritageConnection {
  heritage: string;
  connection: string;
  significance: string;
  preservation: boolean;
}

export interface CrossCulturalGoal {
  goal: string;
  targetCultures: string[];
  expectedOutcome: string;
  measurementCriteria: string;
}

export interface EventLocation {
  venue?: string;
  address?: string;
  virtualPlatform?: string;
  culturalSignificance?: string;
  accessibility: AccessibilityFeatures;
  culturalConsiderations: string[];
}

export interface AccessibilityFeatures {
  wheelchairAccessible: boolean;
  languageSupport: string[];
  culturalAccommodations: string[];
  assistiveTechnology: boolean;
  signLanguageInterpreting: boolean;
  culturalSensitiveSpaces: boolean;
}

export interface EventDateTime {
  startDate: Date;
  endDate: Date;
  timeZone: string;
  culturalCalendarAlignment: string[];
  flexibilityOptions: string[];
}

export interface EventOrganizer {
  userId: string;
  role: 'primary_organizer' | 'co_organizer' | 'cultural_advisor' | 'community_liaison';
  culturalBackground: CulturalBackground;
  responsibilities: string[];
  permissions: string[];
}

export interface CulturalBackground {
  primaryCulture: string;
  secondaryCultures: string[];
  languages: string[];
  culturalExpertise: string[];
  traditionalKnowledge: string[];
}

export interface TargetCommunity {
  community: string;
  targetParticipation: 'minimal' | 'balanced' | 'majority' | 'exclusive';
  outreachStrategy: 'community_leaders' | 'social_media' | 'word_of_mouth' | 'partnerships';
  culturalApproach: 'respectful_invitation' | 'collaborative_planning' | 'community_led';
}

export interface CulturalRequirement {
  requirement: string;
  type: 'protocol' | 'permission' | 'representation' | 'authenticity';
  importance: 'low' | 'medium' | 'high' | 'critical';
  culturalContext: string;
}

export interface EventProgramming {
  schedule: ProgramItem[];
  culturalPerformances: CulturalPerformance[];
  workshops: CulturalWorkshop[];
  exhibitions: CulturalExhibition[];
  speakerSessions: SpeakerSession[];
  interactiveActivities: InteractiveActivity[];
  culturalExperiences: CulturalExperience[];
  networking: NetworkingSession[];
}

export interface ProgramItem {
  id: string;
  type: 'performance' | 'workshop' | 'exhibition' | 'speaker' | 'activity' | 'networking';
  title: string;
  startTime?: Date;
  duration: number;
  culturalContext: string;
  location?: string;
  facilitator?: string;
}

export interface CulturalPerformance {
  id: string;
  eventId: string;
  performanceName: string;
  culturalOrigin: string;
  performers: Performer[];
  culturalSignificance: string;
  performanceType: 'music' | 'dance' | 'storytelling' | 'poetry' | 'theater' | 'ceremony';
  duration: number;
  culturalContext: string;
  audience: 'all_ages' | 'adults' | 'children' | 'specific_culture';
  requirements: PerformanceRequirement[];
  scheduledTime: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  culturalApprovals: CulturalApproval[];
  documentation: PerformanceDocumentation;
}

export interface Performer {
  performerId: string;
  role: 'lead_performer' | 'performer' | 'musician' | 'storyteller' | 'cultural_guide';
  culturalBackground: string;
  expertise: string[];
}

export interface PerformanceRequirement {
  requirement: string;
  type: 'technical' | 'cultural' | 'logistical';
  culturalImportance: 'low' | 'medium' | 'high' | 'critical';
}

export interface CulturalApproval {
  approver: string;
  approverRole: 'cultural_elder' | 'community_leader' | 'cultural_expert';
  approvalType: 'performance_content' | 'cultural_authenticity' | 'community_representation';
  approved: boolean;
  conditions?: string[];
  approvalDate: Date;
}

export interface PerformanceDocumentation {
  recordingPermitted: boolean;
  culturalSensitivities: string[];
  sharingRestrictions: string[];
}

export interface CulturalWorkshop {
  id: string;
  eventId: string;
  workshopTitle: string;
  culturalFocus: string;
  facilitator: WorkshopFacilitator;
  learningObjectives: string[];
  culturalSkills: CulturalSkill[];
  participantLimit: number;
  materials: WorkshopMaterial[];
  culturalPrerequisites: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  registeredParticipants: string[];
  culturalGuidelines: string[];
  learningOutcomes: WorkshopLearningOutcome[];
}

export interface WorkshopFacilitator {
  facilitatorId: string;
  culturalBackground: string;
  expertise: string[];
  credentials: string[];
}

export interface CulturalSkill {
  skill: string;
  culturalContext: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  traditionalKnowledge: boolean;
}

export interface WorkshopMaterial {
  material: string;
  culturalSignificance: string;
  source: 'provided' | 'participant_brings' | 'cultural_community';
  culturalConsiderations: string[];
}

export interface WorkshopLearningOutcome {
  outcome: string;
  culturalContext: string;
  skillLevel: 'awareness' | 'understanding' | 'application' | 'mastery';
  participants: string[];
}

export interface CulturalExhibition {
  id: string;
  exhibitionTitle: string;
  culturalFocus: string;
  artifacts: CulturalArtifact[];
  curator: string;
  culturalNarrative: string;
  interactiveElements: string[];
  educationalMaterials: string[];
}

export interface CulturalArtifact {
  artifactId: string;
  name: string;
  culturalOrigin: string;
  significance: string;
  displayPermissions: string[];
  culturalProtocols: string[];
}

export interface SpeakerSession {
  id: string;
  sessionTitle: string;
  speaker: Speaker;
  topic: string;
  culturalPerspective: string;
  duration: number;
  audience: string;
  learningObjectives: string[];
}

export interface Speaker {
  speakerId: string;
  culturalBackground: string;
  expertise: string[];
  culturalRole: 'elder' | 'expert' | 'practitioner' | 'scholar';
}

export interface InteractiveActivity {
  id: string;
  activityTitle: string;
  culturalFocus: string;
  activityType: 'hands_on' | 'discussion' | 'game' | 'ceremony' | 'collaboration';
  facilitator: string;
  participants: string[];
  culturalLearning: string[];
  duration: number;
}

export interface CulturalExperience {
  id: string;
  experienceTitle: string;
  culturalImmersion: string;
  experienceType: 'traditional_practice' | 'cultural_journey' | 'storytelling' | 'ritual_participation';
  culturalGuide: string;
  participants: string[];
  culturalProtocols: string[];
  duration: number;
}

export interface NetworkingSession {
  id: string;
  sessionTitle: string;
  networkingType: 'cultural_exchange' | 'professional' | 'community_building' | 'intergenerational';
  facilitator: string;
  culturalIceBreakers: string[];
  duration: number;
  expectedOutcomes: string[];
}

export interface TicketingConfiguration {
  enabled: boolean;
  pricing: TicketPricing;
  accessibility: TicketAccessibility;
  culturalConsiderations: string[];
}

export interface TicketPricing {
  free: boolean;
  tiers: TicketTier[];
}

export interface TicketTier {
  name: string;
  price: number;
  benefits: string[];
  culturalAccess: string[];
}

export interface TicketAccessibility {
  scholarships: boolean;
  communitySupport: boolean;
  culturalExchangeOptions: boolean;
  volunteerOpportunities: boolean;
}

export interface PromotionSettings {
  enabled: boolean;
  culturalApproach: 'respectful_invitation' | 'collaborative_promotion' | 'community_led';
  targetChannels: string[];
  culturalMessaging: 'authentic_representation' | 'inclusive_invitation' | 'cultural_celebration';
}

export interface EventAttendee {
  userId: string;
  registrationDate: Date;
  culturalBackground: CulturalBackground;
  attendanceType: 'full_event' | 'specific_sessions' | 'performer' | 'volunteer' | 'vendor';
  culturalContributions: CulturalContribution[];
  dietaryRequirements: DietaryRequirement[];
  accessibilityNeeds: AccessibilityNeed[];
  culturalInterests: CulturalInterest[];
  networkingPreferences: NetworkingPreference[];
  checkInStatus: CheckInStatus;
}

export interface CulturalContribution {
  contributionType: 'cultural_knowledge' | 'traditional_skill' | 'artifact_sharing' | 'performance' | 'facilitation';
  description: string;
  culturalContext: string;
  sharingPermissions: string[];
}

export interface DietaryRequirement {
  requirement: string;
  culturalContext: string;
  severity: 'preference' | 'allergy' | 'religious' | 'cultural';
}

export interface AccessibilityNeed {
  need: string;
  accommodation: 'preferred' | 'required';
  culturalContext: string;
}

export interface CulturalInterest {
  interest: string;
  level: 'curious' | 'interested' | 'passionate' | 'expert';
  culturalContext: string;
}

export interface NetworkingPreference {
  preferenceType: 'cultural_learning' | 'professional' | 'community_building' | 'skill_sharing';
  culturalFocus: string[];
  communicationStyle: 'formal' | 'informal' | 'traditional' | 'modern';
}

export interface CheckInStatus {
  checkedIn: boolean;
  checkInTime?: Date;
  culturalWelcome: boolean;
}

export interface EventPromotion {
  eventId: string;
  promotionChannels: PromotionChannel[];
  targetCommunities: CommunityPromotion[];
  culturalInfluencers: InfluencerOutreach[];
  partnerOrganizations: PartnershipPromotion[];
  socialMediaCampaign: SocialMediaCampaign;
  communityEndorsements: CommunityEndorsement[];
  mediaKit: MediaKit;
  promotionAnalytics: PromotionAnalytics;
}

export interface PromotionChannel {
  channel: string;
  culturalApproach: string;
  targetCommunities: string[];
  status: 'planned' | 'active' | 'completed';
}

export interface CommunityPromotion {
  community: string;
  outreachStrategy: string;
  culturalMessaging: string;
  responseTracking: {
    reached: number;
    engaged: number;
    registered: number;
  };
}

export interface InfluencerOutreach {
  influencerId: string;
  culturalBackground: string;
  reach: number;
  engagement: string;
  culturalAlignment: boolean;
}

export interface PartnershipPromotion {
  organizationId: string;
  organizationType: 'cultural' | 'community' | 'educational' | 'religious';
  partnershipType: 'endorsement' | 'co_promotion' | 'resource_sharing';
  culturalAlignment: string;
}

export interface SocialMediaCampaign {
  platforms: string[];
  culturalHashtags: string[];
  contentStrategy: string;
  engagementGoals: {
    reach: number;
    engagement: number;
    registrations: number;
  };
}

export interface CommunityEndorsement {
  communityId: string;
  endorserRole: 'leader' | 'elder' | 'representative' | 'organization';
  endorsementType: 'support' | 'partnership' | 'cultural_approval';
  endorsementMessage: string;
  endorsementDate: Date;
}

export interface MediaKit {
  culturallyAppropriateImages: string[];
  culturalContextDescriptions: string[];
  communityQuotes: string[];
  culturalSignificanceExplanations: string[];
}

export interface PromotionAnalytics {
  reach: {
    total: number;
    byCommunity: { [community: string]: number };
  };
  engagement: {
    total: number;
    byCommunity: { [community: string]: number };
  };
  registrations: {
    total: number;
    byCommunity: { [community: string]: number };
  };
  culturalResonance: {
    score: number;
    feedback: string[];
  };
}

export interface EventImpact {
  attendanceMetrics: AttendanceMetrics;
  culturalExchange: CulturalExchangeMetrics;
  communityEngagement: CommunityEngagementMetrics;
  culturalLearning: CulturalLearningMetrics;
  economicImpact: EconomicImpactMetrics;
  socialCohesion: SocialCohesionMetrics;
  culturalPreservation: CulturalPreservationMetrics;
  followUpActivities: FollowUpActivity[];
}

export interface AttendanceMetrics {
  totalAttendees: number;
  culturalDiversity: number;
  communityRepresentation: { [community: string]: number };
  demographicBreakdown: any;
}

export interface CulturalExchangeMetrics {
  culturalInteractions: number;
  knowledgeSharing: number;
  traditionalPracticesShared: number;
  crossCulturalConnections: number;
}

export interface CommunityEngagementMetrics {
  communityParticipation: number;
  leadershipInvolvement: number;
  volunteerContributions: number;
  communityFeedback: number;
}

export interface CulturalLearningMetrics {
  learningObjectivesAchieved: number;
  culturalCompetencyIncrease: number;
  appreciationGrowth: number;
  knowledgeRetention: number;
}

export interface EconomicImpactMetrics {
  localEconomicBenefit: number;
  culturalEntrepreneurSupport: number;
  artisanSales: number;
  communityInvestment: number;
}

export interface SocialCohesionMetrics {
  relationshipsFormed: number;
  communityBonding: number;
  culturalPrideBoosted: number;
  inclusionImproved: number;
}

export interface CulturalPreservationMetrics {
  traditionalKnowledgeDocumented: number;
  culturalPracticesPreserved: number;
  intergenerationalTransfer: number;
  culturalArtifactsShared: number;
}

export interface FollowUpActivity {
  activityType: 'community_project' | 'cultural_exchange' | 'skill_development' | 'relationship_building';
  description: string;
  participants: string[];
  timeline: string;
  culturalContext: string;
}

export interface EventCoordination {
  eventId: string;
  coordinationTeam: CoordinationTeamMember[];
  checkInSystem: CheckInConfiguration;
  realTimeSupport: RealTimeSupportTools;
  emergencyProcedures: EmergencyProcedure[];
  culturalLiaisons: CulturalLiaison[];
  translationServices: TranslationService[];
  techSupport: TechnicalSupportConfiguration;
}

export interface CoordinationTeamMember {
  userId: string;
  role: 'event_coordinator' | 'cultural_liaison' | 'technical_support' | 'volunteer_coordinator';
  culturalBackground: string;
  responsibilities: string[];
  contactInfo: string;
}

export interface CheckInConfiguration {
  method: 'digital' | 'manual' | 'hybrid';
  culturalWelcome: boolean;
  languageSupport: string[];
  accessibilitySupport: boolean;
}

export interface RealTimeSupportTools {
  communicationChannels: string[];
  emergencyContacts: string[];
  culturalGuidance: boolean;
  translationSupport: boolean;
}

export interface EmergencyProcedure {
  emergencyType: string;
  procedure: string[];
  contacts: string[];
  culturalConsiderations: string[];
}

export interface CulturalLiaison {
  liaisonId: string;
  culturalBackground: string;
  role: 'cultural_guide' | 'translator' | 'mediator' | 'protocol_advisor';
  availability: string;
  contactInfo: string;
}

export interface TranslationService {
  serviceType: 'real_time' | 'document' | 'sign_language';
  languages: string[];
  availability: string;
  culturalContext: boolean;
}

export interface TechnicalSupportConfiguration {
  supportChannels: string[];
  equipment: string[];
  troubleshooting: string[];
  culturalAccessibility: boolean;
}

export interface CulturalDocumentation {
  eventId: string;
  culturalMoments: DocumentedCulturalMoment[];
  traditionalKnowledge: TraditionalKnowledgeCapture[];
  culturalPerformanceRecordings: PerformanceRecording[];
  participantStories: ParticipantStory[];
  culturalArtifacts: CulturalArtifactDocumentation[];
  communityTestimonials: CommunityTestimonial[];
  preservationOutcomes: PreservationOutcome[];
}

export interface DocumentedCulturalMoment {
  id: string;
  momentType: string;
  description: string;
  culturalSignificance: string;
  participants: string[];
  timestamp: Date;
  preservationValue: number;
  documentation: {
    photos: string[];
    videos: string[];
    audioRecordings: string[];
    writtenAccounts: string[];
  };
}

export interface TraditionalKnowledgeCapture {
  knowledgeType: string;
  culturalOrigin: string;
  knowledgeHolder: string;
  description: string;
  preservationMethod: string;
  sharingPermissions: string[];
  culturalProtocols: string[];
}

export interface PerformanceRecording {
  performanceId: string;
  recordingType: 'audio' | 'video' | 'photos';
  culturalPermissions: string[];
  sharingRestrictions: string[];
  culturalContext: string;
  preservationValue: number;
}

export interface ParticipantStory {
  participantId: string;
  storyType: 'learning_experience' | 'cultural_connection' | 'personal_growth' | 'community_impact';
  story: string;
  culturalContext: string;
  sharingPermissions: string[];
  impactLevel: 'personal' | 'community' | 'cultural' | 'societal';
}

export interface CulturalArtifactDocumentation {
  artifactId: string;
  artifactType: string;
  culturalOrigin: string;
  significance: string;
  documentation: string[];
  preservationStatus: string;
  accessPermissions: string[];
}

export interface CommunityTestimonial {
  communityId: string;
  testimonialType: 'event_impact' | 'cultural_preservation' | 'community_building' | 'learning_outcomes';
  testimonial: string;
  testimonialProvider: string;
  culturalContext: string;
  publicSharingPermission: boolean;
}

export interface PreservationOutcome {
  outcomeType: 'knowledge_preserved' | 'practice_documented' | 'artifact_catalogued' | 'story_captured';
  description: string;
  culturalValue: number;
  accessibilityLevel: 'community' | 'public' | 'restricted' | 'sacred';
  preservationMethod: string;
  futureAccess: string;
}
