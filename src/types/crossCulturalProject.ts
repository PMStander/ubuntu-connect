export interface CrossCulturalProject {
  id: string;
  title: string;
  description: string;
  vision: string;
  objectives: ProjectObjective[];
  culturalContext: ProjectCulturalContext;
  requiredSkills: RequiredSkill[];
  targetCommunities: TargetCommunity[];
  timeline: ProjectTimeline;
  status: 'planning' | 'recruiting' | 'active' | 'completed' | 'paused' | 'cancelled';
  impact: ImpactMetrics;
  team: ProjectTeam;
  culturalGuidelines: CulturalGuideline[];
  collaborationProtocols: CollaborationProtocol[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ProjectObjective {
  id: string;
  title: string;
  description: string;
  culturalSignificance: string;
  measurableOutcome: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProjectCulturalContext {
  primaryCultures: string[];
  culturalObjectives: CulturalObjective[];
  culturalSensitivities: CulturalSensitivity[];
  traditionalKnowledgeIntegration: boolean;
  languageRequirements: LanguageRequirement[];
  culturalMilestones: CulturalMilestone[];
  communityEndorsements: CommunityEndorsement[];
}

export interface CulturalObjective {
  id: string;
  objective: string;
  culturalContext: string;
  expectedOutcome: string;
  measurementCriteria: string;
}

export interface CulturalSensitivity {
  area: string;
  description: string;
  guidelines: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LanguageRequirement {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  purpose: string;
  priority: 'optional' | 'preferred' | 'required';
}

export interface CulturalMilestone {
  id: string;
  title: string;
  description: string;
  culturalSignificance: string;
  targetDate: Date;
  celebrationPlan: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface CommunityEndorsement {
  communityId: string;
  communityName: string;
  endorsementType: 'support' | 'partnership' | 'sponsorship';
  endorsementDate: Date;
  endorsementDetails: string;
}

export interface RequiredSkill {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TargetCommunity {
  community: string;
  role: 'participant' | 'beneficiary' | 'partner' | 'advisor';
  representation: 'minimal' | 'balanced' | 'equal' | 'majority';
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  phases: ProjectPhase[];
  culturalEvents: CulturalMilestone[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  culturalConsiderations: string[];
  deliverables: string[];
}

export interface ProjectTeam {
  members: ProjectMember[];
  culturalRepresentatives: CulturalRepresentative[];
  skillsMatrix: SkillsMatrix;
  culturalDiversityScore: number;
  communicationPreferences: CommunicationPreference[];
  decisionMakingProcess: DecisionMakingProcess;
  conflictResolutionProtocol: ConflictResolutionProtocol;
}

export interface ProjectMember {
  userId: string;
  role: 'project_lead' | 'cultural_representative' | 'skill_expert' | 'community_liaison' | 'contributor';
  culturalBackground: CulturalBackground;
  skillContributions: SkillContribution[];
  availabilityPattern: AvailabilityPattern;
  culturalResponsibilities: CulturalResponsibility[];
  joinedAt: Date;
  commitmentLevel: 'full_time' | 'part_time' | 'consulting' | 'advisory';
}

export interface CulturalBackground {
  primaryCulture: string;
  secondaryCultures: string[];
  languages: string[];
  culturalExpertise: string[];
  traditionalKnowledge: string[];
}

export interface SkillContribution {
  skill: string;
  level: string;
  experience: string;
  culturalContext?: string;
}

export interface AvailabilityPattern {
  hoursPerWeek: number;
  preferredDays: string[];
  timeZone: string;
  culturalConstraints: string[];
}

export interface CulturalResponsibility {
  responsibility: string;
  description: string;
  culturalContext: string;
  accountability: string;
}

export interface CulturalRepresentative {
  userId: string;
  culture: string;
  role: 'advisor' | 'liaison' | 'guardian' | 'educator';
  responsibilities: string[];
  authority: string[];
}

export interface SkillsMatrix {
  skills: string[];
  coverage: number;
  gaps: string[];
  strengths: string[];
}

export interface CommunicationPreference {
  userId: string;
  preferredLanguage: string;
  communicationStyle: 'direct' | 'indirect' | 'formal' | 'informal';
  culturalProtocols: string[];
}

export interface DecisionMakingProcess {
  type: 'consensus' | 'majority' | 'hierarchical' | 'cultural_council';
  culturalConsiderations: string[];
  votingRights: string[];
  vetoRights: string[];
}

export interface ConflictResolutionProtocol {
  approach: 'mediation' | 'arbitration' | 'cultural_council' | 'elder_consultation';
  culturalAdaptations: string[];
  escalationPath: string[];
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  culturalContext: TaskCulturalContext;
  assignedTo: string[];
  requiredSkills: string[];
  culturalRequirements: CulturalRequirement[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_progress' | 'review' | 'completed' | 'blocked';
  culturalMilestone?: CulturalMilestone;
  estimatedHours: number;
  actualHours?: number;
  culturalLearning: CulturalLearningOutcome[];
  dependencies: TaskDependency[];
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCulturalContext {
  culturalRequirements: string[];
  culturalSensitivities: string[];
  culturalLearningObjectives: string[];
}

export interface CulturalRequirement {
  requirement: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CulturalLearningOutcome {
  outcome: string;
  culturalContext: string;
  learningType: 'knowledge' | 'skill' | 'understanding' | 'appreciation';
  participants: string[];
}

export interface TaskDependency {
  taskId: string;
  dependencyType: 'blocks' | 'enables' | 'informs';
  culturalReason?: string;
}

export interface CulturalCollaboration {
  projectId: string;
  collaborationType: 'knowledge_sharing' | 'cultural_exchange' | 'traditional_practice' | 'modern_innovation';
  participatingCultures: CultureParticipation[];
  knowledgeContributions: KnowledgeContribution[];
  culturalLearning: CulturalLearningOutcome[];
  innovationOutcomes: Innovation[];
  respectProtocols: RespectProtocol[];
  communityBenefit: CommunityBenefit[];
}

export interface CultureParticipation {
  culture: string;
  participationType: 'leading' | 'contributing' | 'learning' | 'observing';
  representatives: string[];
  contributions: string[];
}

export interface KnowledgeContribution {
  contributorId: string;
  culture: string;
  knowledgeType: 'traditional' | 'modern' | 'hybrid';
  description: string;
  culturalSignificance: string;
  sharingPermissions: string[];
}

export interface Innovation {
  id: string;
  title: string;
  description: string;
  culturalOrigins: string[];
  innovationType: 'technological' | 'social' | 'cultural' | 'economic';
  impact: string;
}

export interface RespectProtocol {
  culture: string;
  protocol: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface CommunityBenefit {
  community: string;
  benefitType: 'economic' | 'social' | 'cultural' | 'educational';
  description: string;
  measurableOutcome: string;
}

export interface ImpactMetrics {
  communityReach: CommunityReach;
  culturalImpact: CulturalImpact;
  socialImpact: SocialImpact;
  economicImpact: EconomicImpact;
  learningOutcomes: CulturalLearningOutcome[];
  sustainabilityMetrics: SustainabilityMetric[];
  culturalPreservation: CulturalPreservationOutcome[];
}

export interface CommunityReach {
  communities: number;
  individuals: number;
  regions: string[];
}

export interface CulturalImpact {
  preservationScore: number;
  innovationScore: number;
  exchangeScore: number;
}

export interface SocialImpact {
  relationshipsFormed: number;
  understandingImproved: number;
  conflictsResolved: number;
}

export interface EconomicImpact {
  opportunitiesCreated: number;
  valueGenerated: number;
  sustainabilityScore: number;
}

export interface SustainabilityMetric {
  metric: string;
  value: number;
  trend: 'improving' | 'stable' | 'declining';
  culturalContext: string;
}

export interface CulturalPreservationOutcome {
  culture: string;
  preservationType: 'knowledge' | 'practice' | 'artifact' | 'language';
  description: string;
  preservationMethod: string;
  accessibility: string;
}

export interface CulturalGuideline {
  id: string;
  title: string;
  description: string;
  applicableCultures: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
}

export interface CollaborationProtocol {
  id: string;
  name: string;
  description: string;
  culturalContext: string;
  steps: string[];
  culturalAdaptations: string[];
}

export interface TeamRecommendation {
  userId: string;
  culturalBackground: string;
  skills: string[];
  culturalExpertise: string[];
  recommendationScore: number;
  role: string;
  culturalContribution: string;
}

export interface CulturalContext {
  primaryCultures: string[];
  culturalObjectives: CulturalObjective[];
  culturalSensitivities: CulturalSensitivity[];
  traditionalKnowledgeIntegration: boolean;
  languageRequirements: LanguageRequirement[];
}
