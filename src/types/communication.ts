export interface CrossCulturalConversation {
  id: string;
  participants: ConversationParticipant[];
  conversationType: 'direct_message' | 'group_chat' | 'project_channel' | 'video_call' | 'audio_call';
  primaryLanguages: string[];
  culturalContext: ConversationCulturalContext;
  translationSettings: TranslationSettings;
  culturalGuidanceEnabled: boolean;
  communicationStyle: CommunicationStyle;
  messages: CrossCulturalMessage[];
  culturalMoments: CulturalMoment[];
  mediationHistory?: MediationRecord[];
  createdAt: Date;
  lastActivity: Date;
  archiveSettings: ArchiveSettings;
}

export interface ConversationParticipant {
  userId: string;
  culturalBackground: CulturalBackground;
  preferredLanguage: string;
  communicationPreferences: CommunicationPreferences;
  culturalRole: 'participant' | 'cultural_guide' | 'translator' | 'mediator';
  joinedAt: Date;
  lastSeen: Date;
  permissions: ParticipantPermissions;
}

export interface CulturalBackground {
  primaryCulture: string;
  secondaryCultures: string[];
  languages: string[];
  culturalExpertise: string[];
  traditionalKnowledge: string[];
}

export interface CommunicationPreferences {
  style: 'direct' | 'indirect' | 'formal' | 'informal';
  culturalProtocols: string[];
  responseTimeExpectation: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
  preferredMediums: string[];
}

export interface ParticipantPermissions {
  canTranslate: boolean;
  canModerate: boolean;
  canInvite: boolean;
  canShareCulturalContent: boolean;
}

export interface ConversationCulturalContext {
  conversationCultures: string[];
  culturalSensitivities: CulturalSensitivity[];
  communicationProtocols: CommunicationProtocol[];
  translationPreferences: TranslationPreferences;
}

export interface CulturalSensitivity {
  area: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  guidelines: string[];
}

export interface CommunicationProtocol {
  culture: string;
  protocol: string;
  description: string;
  importance: 'optional' | 'recommended' | 'required';
}

export interface TranslationPreferences {
  [userId: string]: {
    preferredLanguage: string;
    culturalAdaptation: boolean;
    formalityLevel: 'casual' | 'formal' | 'respectful';
  };
}

export interface TranslationSettings {
  enabled: boolean;
  autoTranslate: boolean;
  preserveCulturalContext: boolean;
  supportedLanguages: string[];
}

export interface CommunicationStyle {
  primary: 'collaborative' | 'hierarchical' | 'consensus' | 'ubuntu';
  cultural: string;
  formality: 'casual' | 'formal' | 'respectful' | 'ceremonial';
}

export interface CrossCulturalMessage {
  id: string;
  conversationId: string;
  senderId: string;
  originalText: string;
  originalLanguage: string;
  translations: MessageTranslation[];
  culturalContext: MessageCulturalContext;
  messageType: 'text' | 'voice' | 'video' | 'file' | 'cultural_artifact' | 'system';
  culturalAnnotations: CulturalAnnotation[];
  reactions: CulturalReaction[];
  timestamp: Date;
  editHistory?: EditRecord[];
  moderationFlags?: ModerationFlag[];
  displayText?: string; // For translated display
}

export interface MessageTranslation {
  language: string;
  translatedText: string;
  culturalAdaptation: string;
  confidenceScore: number;
  culturalAccuracyScore: number;
  translationMethod: 'automatic' | 'human_assisted' | 'community_contributed';
  culturalNotes?: string[];
  alternativePhrasings?: string[];
  reviewedBy?: string;
}

export interface MessageCulturalContext {
  culturalReferences: CulturalReference[];
  idioms: Idiom[];
  formalityLevel: 'casual' | 'formal' | 'respectful' | 'ceremonial';
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'celebratory' | 'respectful';
  culturalSignificance?: string;
}

export interface CulturalReference {
  reference: string;
  culture: string;
  explanation: string;
  significance: 'low' | 'medium' | 'high' | 'sacred';
}

export interface Idiom {
  idiom: string;
  language: string;
  meaning: string;
  culturalContext: string;
  appropriateUsage: string[];
}

export interface CulturalAnnotation {
  id: string;
  annotationType: 'explanation' | 'context' | 'sensitivity' | 'learning_opportunity';
  content: string;
  culturalContext: string;
  importance: 'low' | 'medium' | 'high';
  createdBy: string;
}

export interface CulturalReaction {
  userId: string;
  reactionType: 'like' | 'appreciate' | 'learn' | 'respect' | 'celebrate';
  culturalContext?: string;
  timestamp: Date;
}

export interface EditRecord {
  editedAt: Date;
  editedBy: string;
  originalText: string;
  newText: string;
  reason: string;
}

export interface ModerationFlag {
  flaggedBy: string;
  flagType: 'cultural_insensitivity' | 'inappropriate_content' | 'spam' | 'harassment';
  description: string;
  flaggedAt: Date;
  resolved: boolean;
}

export interface CulturalMoment {
  id: string;
  conversationId: string;
  timestamp: Date;
  momentType: 'cultural_sharing' | 'learning_opportunity' | 'misunderstanding' | 'celebration' | 'breakthrough';
  description: string;
  participantsInvolved: string[];
  culturalSignificance: string;
  learningOutcomes: LearningOutcome[];
  preservationValue: number;
}

export interface LearningOutcome {
  outcome: string;
  culturalContext: string;
  learningType: 'knowledge' | 'skill' | 'understanding' | 'appreciation';
  participants: string[];
}

export interface MediationRecord {
  id: string;
  mediatorId: string;
  conflictType: 'cultural_misunderstanding' | 'communication_breakdown' | 'value_conflict';
  description: string;
  resolution: string;
  participantsInvolved: string[];
  resolvedAt: Date;
  culturalLessonsLearned: string[];
}

export interface ArchiveSettings {
  autoArchive: boolean;
  retentionPeriod: number; // days
  culturalPreservation: boolean;
}

export interface VideoConference {
  id: string;
  conversationId: string;
  participants: VideoParticipant[];
  culturalFeatures: VideoConferenceCulturalFeatures;
  translation: RealTimeTranslation;
  recording: ConferenceRecording;
  breakoutRooms: BreakoutRoom[];
  culturalActivities: CulturalActivity[];
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
}

export interface VideoParticipant {
  userId: string;
  culturalBackground: CulturalBackground;
  videoEnabled: boolean;
  audioEnabled: boolean;
  culturalBackgroundVisible: boolean;
  preferredLanguage: string;
  culturalRole?: 'presenter' | 'cultural_guide' | 'translator';
}

export interface VideoConferenceCulturalFeatures {
  realTimeTranslation: boolean;
  culturalEtiquetteGuidance: boolean;
  culturalBackgroundSharing: boolean;
  breakoutRoomCulturalGrouping: boolean;
}

export interface RealTimeTranslation {
  enabled: boolean;
  supportedLanguages: string[];
  realTimeTranscription: boolean;
  culturalContextPreservation: boolean;
}

export interface ConferenceRecording {
  enabled: boolean;
  culturalMomentsHighlighted: boolean;
  transcriptionWithTranslation: boolean;
  culturalContextPreserved: boolean;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  culturalFocus?: string;
  purpose: string;
  duration: number;
}

export interface CulturalActivity {
  id: string;
  activityType: 'cultural_introduction' | 'knowledge_sharing' | 'celebration' | 'learning_exercise';
  title: string;
  description: string;
  duration: number;
  facilitator: string;
  culturalContext: string;
}

export interface CulturalMediaShare {
  id: string;
  conversationId: string;
  uploaderId: string;
  mediaType: 'image' | 'video' | 'audio' | 'document' | 'artifact';
  fileName: string;
  fileUrl: string;
  culturalContext: MediaCulturalContext;
  culturalSignificance: string;
  sharingPermissions: SharingPermissions;
  culturalAttribution: CulturalAttribution;
  annotations: MediaAnnotation[];
  accessLog: AccessLogEntry[];
  uploadedAt: Date;
}

export interface MediaCulturalContext {
  culture: string;
  significance: string;
  traditionalKnowledge: boolean;
  sharingRestrictions: string[];
}

export interface SharingPermissions {
  allowedUsers: string[];
  publicAccess: boolean;
  culturalCommunityAccess: boolean;
  commercialUse: boolean;
}

export interface CulturalAttribution {
  originalCulture: string;
  knowledgeHolders: string[];
  communityPermissions: boolean;
  attributionRequired: boolean;
}

export interface MediaAnnotation {
  id: string;
  annotationType: 'cultural_explanation' | 'historical_context' | 'usage_guidance';
  content: string;
  timestamp?: number; // for video/audio
  position?: { x: number; y: number }; // for images
  createdBy: string;
  culturalContext: string;
}

export interface AccessLogEntry {
  userId: string;
  accessedAt: Date;
  accessType: 'view' | 'download' | 'share';
  culturalContext?: string;
}

export interface CommunicationAnalytics {
  conversationId: string;
  culturalEngagement: CulturalEngagementMetrics;
  translationQuality: TranslationQualityMetrics;
  crossCulturalUnderstanding: UnderstandingMetrics;
  communicationEffectiveness: EffectivenessMetrics;
  relationshipBuilding: RelationshipMetrics;
  culturalLearning: CulturalLearningMetrics;
}

export interface CulturalEngagementMetrics {
  score: number;
  culturalReferencesShared: number;
  culturalLearningMoments: number;
  culturalCelebrations: number;
}

export interface TranslationQualityMetrics {
  averageConfidence: number;
  culturalAccuracy: number;
  userSatisfaction: number;
  communityContributions: number;
}

export interface UnderstandingMetrics {
  understandingScore: number;
  misunderstandingsResolved: number;
  culturalBridgesMade: number;
  empathyGrowth: number;
}

export interface EffectivenessMetrics {
  responseRate: number;
  clarificationRequests: number;
  successfulExchanges: number;
  communicationFlow: number;
}

export interface RelationshipMetrics {
  relationshipStrength: number;
  culturalBonding: number;
  trustBuilding: number;
  collaborationQuality: number;
}

export interface CulturalLearningMetrics {
  learningMoments: number;
  culturalKnowledgeGained: number;
  appreciationGrowth: number;
  culturalCompetencyIncrease: number;
}

export interface CulturalContext {
  conversationCultures?: string[];
  culturalSensitivities?: CulturalSensitivity[];
  communicationProtocols?: CommunicationProtocol[];
  translationPreferences?: TranslationPreferences;
}
