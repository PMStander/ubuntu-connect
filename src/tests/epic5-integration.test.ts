import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { crossCulturalProjectService } from '../services/crossCulturalProjectService';
import { realTimeCommunicationService } from '../services/realTimeCommunicationService';
import { culturalEventService } from '../services/culturalEventService';
import { 
  CrossCulturalProject, 
  ProjectCreationData, 
  TaskCreationData 
} from '../types/crossCulturalProject';
import { 
  ConversationCreationData, 
  MessageData 
} from '../types/communication';
import { EventCreationData, RSVPData } from '../types/culturalEvent';

describe('Epic 5: Cross-Cultural Collaboration Tools - Integration Tests', () => {
  const testUserId = 'test-user-123';
  let testProject: CrossCulturalProject;
  let testConversationId: string;
  let testEventId: string;

  beforeEach(async () => {
    // Clean up any existing test data
    // In a real implementation, this would reset the test database
  });

  afterEach(async () => {
    // Clean up test data
  });

  describe('Story 5-13: Cross-Cultural Project Management', () => {
    it('should create a cross-cultural project with cultural context', async () => {
      const projectData: ProjectCreationData = {
        title: 'Ubuntu Community Garden Project',
        description: 'A collaborative project to create community gardens that celebrate cultural diversity',
        vision: 'Building food security while preserving traditional agricultural knowledge',
        objectives: [
          {
            id: 'obj-1',
            title: 'Establish 5 community gardens',
            description: 'Create gardens in diverse communities',
            culturalSignificance: 'Preserving traditional farming methods',
            measurableOutcome: '5 functioning gardens with 100+ participants',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            status: 'pending'
          }
        ],
        culturalContext: {
          primaryCultures: ['Zulu', 'Xhosa', 'Afrikaans'],
          culturalObjectives: [
            {
              id: 'cultural-obj-1',
              objective: 'Preserve traditional farming knowledge',
              culturalContext: 'Indigenous agricultural practices',
              expectedOutcome: 'Documentation of traditional methods',
              measurementCriteria: 'Number of practices documented'
            }
          ],
          culturalSensitivities: [
            {
              area: 'Land use',
              description: 'Respect for traditional land relationships',
              guidelines: ['Consult with traditional leaders', 'Honor ancestral connections'],
              severity: 'high'
            }
          ],
          traditionalKnowledgeIntegration: true,
          languageRequirements: [
            {
              language: 'Zulu',
              proficiency: 'conversational',
              purpose: 'Community engagement',
              priority: 'required'
            }
          ]
        },
        requiredSkills: ['agriculture', 'community_engagement', 'project_management'],
        targetCommunities: ['Zulu', 'Xhosa', 'Afrikaans'],
        timeline: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          culturalMilestones: [
            {
              id: 'milestone-1',
              title: 'Traditional Blessing Ceremony',
              description: 'Community blessing for the project',
              culturalSignificance: 'Honoring ancestral approval',
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              celebrationPlan: 'Traditional ceremony with all communities',
              status: 'upcoming'
            }
          ]
        }
      };

      testProject = await crossCulturalProjectService.createProject(projectData, testUserId);

      expect(testProject).toBeDefined();
      expect(testProject.title).toBe(projectData.title);
      expect(testProject.culturalContext.primaryCultures).toEqual(['Zulu', 'Xhosa', 'Afrikaans']);
      expect(testProject.culturalContext.traditionalKnowledgeIntegration).toBe(true);
      expect(testProject.status).toBe('planning');
      expect(testProject.team.culturalDiversityScore).toBe(0); // No team members yet
    });

    it('should recommend culturally diverse team members', async () => {
      const recommendations = await crossCulturalProjectService.recommendTeamComposition(testProject.id);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Verify cultural diversity in recommendations
      const cultures = new Set(recommendations.map(r => r.culturalBackground));
      expect(cultures.size).toBeGreaterThan(1);
      
      // Verify recommendation scores
      recommendations.forEach(recommendation => {
        expect(recommendation.recommendationScore).toBeGreaterThan(0);
        expect(recommendation.recommendationScore).toBeLessThanOrEqual(100);
        expect(recommendation.skills.length).toBeGreaterThan(0);
        expect(recommendation.culturalExpertise.length).toBeGreaterThan(0);
      });
    });

    it('should create and manage culturally-aware tasks', async () => {
      const taskData: TaskCreationData = {
        projectId: testProject.id,
        title: 'Community Consultation with Traditional Leaders',
        description: 'Engage with traditional leaders to gain cultural approval',
        culturalContext: {
          culturalRequirements: ['Traditional protocol knowledge', 'Respectful communication'],
          culturalSensitivities: ['Authority structures', 'Traditional customs'],
          culturalLearningObjectives: ['Understanding traditional governance']
        },
        requiredSkills: ['cultural_liaison', 'traditional_knowledge'],
        culturalRequirements: ['Traditional protocol knowledge', 'Community respect'],
        priority: 'high',
        estimatedHours: 20,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };

      const task = await crossCulturalProjectService.createTask(taskData);

      expect(task).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.priority).toBe('high');
      expect(task.culturalContext.culturalRequirements).toEqual(taskData.culturalContext.culturalRequirements);
      expect(task.status).toBe('backlog');
    });

    it('should track cultural impact metrics', async () => {
      const impactUpdate = {
        communityReach: { communities: 3, individuals: 150, regions: ['KwaZulu-Natal', 'Eastern Cape'] },
        culturalImpact: { preservationScore: 85, innovationScore: 70, exchangeScore: 90 },
        socialImpact: { relationshipsFormed: 45, understandingImproved: 80, conflictsResolved: 2 }
      };

      const updatedImpact = await crossCulturalProjectService.updateImpactMetrics(testProject.id, impactUpdate);

      expect(updatedImpact.communityReach.communities).toBe(3);
      expect(updatedImpact.culturalImpact.preservationScore).toBe(85);
      expect(updatedImpact.socialImpact.relationshipsFormed).toBe(45);
    });
  });

  describe('Story 5-14: Real-Time Cross-Cultural Communication', () => {
    it('should create cross-cultural conversation with translation support', async () => {
      const conversationData: ConversationCreationData = {
        participants: [testUserId, 'user-zulu-123', 'user-xhosa-456'],
        conversationType: 'group_chat',
        culturalContext: {
          conversationCultures: ['Zulu', 'Xhosa', 'English'],
          culturalSensitivities: [
            {
              area: 'Greetings',
              description: 'Respect traditional greeting customs',
              severity: 'medium',
              guidelines: ['Use appropriate cultural greetings', 'Show respect for elders']
            }
          ],
          communicationProtocols: [
            {
              culture: 'Zulu',
              protocol: 'Respectful address',
              description: 'Use appropriate titles and respectful language',
              importance: 'required'
            }
          ],
          translationPreferences: {}
        },
        translationEnabled: true
      };

      const conversation = await realTimeCommunicationService.createConversation(conversationData, testUserId);
      testConversationId = conversation.id;

      expect(conversation).toBeDefined();
      expect(conversation.participants.length).toBe(3);
      expect(conversation.translationSettings.enabled).toBe(true);
      expect(conversation.culturalGuidanceEnabled).toBe(true);
      expect(conversation.primaryLanguages).toContain('en');
    });

    it('should send messages with cultural context and translation', async () => {
      const messageData: MessageData = {
        text: 'Sawubona! Ngiyajabula ukukubona. (Hello! I am happy to see you.)',
        language: 'zu',
        culturalContext: {
          conversationCultures: ['Zulu'],
          culturalSensitivities: [],
          communicationProtocols: [],
          translationPreferences: {}
        },
        messageType: 'text'
      };

      const message = await realTimeCommunicationService.sendMessage(
        testConversationId,
        testUserId,
        messageData
      );

      expect(message).toBeDefined();
      expect(message.originalText).toBe(messageData.text);
      expect(message.originalLanguage).toBe('zu');
      expect(message.translations.length).toBeGreaterThan(0);
      
      // Verify translations include English
      const englishTranslation = message.translations.find(t => t.language === 'en');
      expect(englishTranslation).toBeDefined();
      expect(englishTranslation?.translatedText).toContain('Hello');
    });

    it('should provide cultural context explanations', async () => {
      const explanation = await realTimeCommunicationService.explainCulturalContext(
        'Ubuntu',
        'Ubuntu philosophy',
        'English'
      );

      expect(explanation).toBeDefined();
      expect(explanation.reference).toBe('Ubuntu philosophy');
      expect(explanation.explanation).toContain('Ubuntu');
      expect(explanation.appropriateResponses).toBeDefined();
      expect(explanation.potentialSensitivities).toBeDefined();
    });

    it('should generate communication analytics', async () => {
      const analytics = await realTimeCommunicationService.getConversationAnalytics(testConversationId);

      expect(analytics).toBeDefined();
      expect(analytics.conversationId).toBe(testConversationId);
      expect(analytics.culturalEngagement).toBeDefined();
      expect(analytics.translationQuality).toBeDefined();
      expect(analytics.crossCulturalUnderstanding).toBeDefined();
      expect(analytics.relationshipBuilding).toBeDefined();
      
      // Verify metrics are within expected ranges
      expect(analytics.culturalEngagement.score).toBeGreaterThanOrEqual(0);
      expect(analytics.culturalEngagement.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Story 5-15: Cultural Event Organization & Coordination', () => {
    it('should create cultural event with comprehensive cultural context', async () => {
      const eventData: EventCreationData = {
        title: 'Heritage Day Cultural Festival',
        description: 'Celebrating South African cultural diversity through performances, workshops, and food',
        eventType: 'festival',
        format: 'hybrid',
        location: {
          venue: 'Community Cultural Center',
          address: 'Cape Town, South Africa',
          culturalSignificance: 'Historic gathering place for multiple communities'
        },
        dateTime: {
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          culturalCalendarConsiderations: ['Heritage Month', 'Traditional harvest season']
        },
        culturalContext: {
          primaryCultures: ['Zulu', 'Xhosa', 'Afrikaans', 'English', 'Sotho'],
          culturalSignificance: 'Celebrating unity in diversity',
          traditionalElements: ['Traditional music', 'Cultural dances', 'Storytelling', 'Craft demonstrations'],
          culturalLearningObjectives: ['Cultural appreciation', 'Traditional knowledge sharing', 'Unity building']
        },
        targetCommunities: ['Zulu', 'Xhosa', 'Afrikaans', 'English', 'Sotho'],
        accessibility: {
          wheelchairAccessible: true,
          languageSupport: ['en', 'af', 'zu', 'xh', 'st'],
          culturalAccommodations: ['Prayer spaces', 'Dietary considerations', 'Cultural dress areas']
        }
      };

      const event = await culturalEventService.createEvent(eventData, testUserId);
      testEventId = event.id;

      expect(event).toBeDefined();
      expect(event.title).toBe(eventData.title);
      expect(event.culturalContext.primaryCultures).toEqual(eventData.culturalContext.primaryCultures);
      expect(event.format).toBe('hybrid');
      expect(event.status).toBe('planning');
      expect(event.accessibility.wheelchairAccessible).toBe(true);
    });

    it('should handle RSVP with cultural contributions', async () => {
      const rsvpData: RSVPData = {
        eventId: testEventId,
        userId: testUserId,
        attendanceType: 'full_event',
        culturalBackground: 'Zulu',
        culturalContributions: ['Traditional music performance', 'Ubuntu philosophy sharing'],
        dietaryRequirements: ['Halal', 'Vegetarian options'],
        accessibilityNeeds: [],
        culturalInterests: ['Traditional music', 'Storytelling', 'Cultural dances']
      };

      const attendee = await culturalEventService.rsvpToEvent(rsvpData);

      expect(attendee).toBeDefined();
      expect(attendee.userId).toBe(testUserId);
      expect(attendee.culturalBackground.primaryCulture).toBe('Zulu');
      expect(attendee.culturalContributions.length).toBe(2);
      expect(attendee.attendanceType).toBe('full_event');
    });

    it('should add cultural performances with proper attribution', async () => {
      const performanceData = {
        eventId: testEventId,
        performanceName: 'Traditional Zulu War Dance',
        culturalOrigin: 'Zulu',
        performers: ['performer-1', 'performer-2'],
        culturalSignificance: 'Historical warrior tradition and cultural pride',
        performanceType: 'dance' as const,
        duration: 30,
        culturalContext: 'Traditional Zulu warrior culture and ceremonial practices',
        audience: 'all_ages' as const,
        requirements: ['Traditional attire', 'Drums', 'Performance space'],
        scheduledTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
      };

      const performance = await culturalEventService.addPerformance(performanceData);

      expect(performance).toBeDefined();
      expect(performance.performanceName).toBe(performanceData.performanceName);
      expect(performance.culturalOrigin).toBe('Zulu');
      expect(performance.culturalSignificance).toContain('warrior tradition');
      expect(performance.status).toBe('scheduled');
    });

    it('should generate comprehensive event impact report', async () => {
      const impactReport = await culturalEventService.generateImpactReport(testEventId);

      expect(impactReport).toBeDefined();
      expect(impactReport.attendanceMetrics).toBeDefined();
      expect(impactReport.culturalExchange).toBeDefined();
      expect(impactReport.communityEngagement).toBeDefined();
      expect(impactReport.culturalLearning).toBeDefined();
      expect(impactReport.economicImpact).toBeDefined();
      expect(impactReport.socialCohesion).toBeDefined();
      expect(impactReport.culturalPreservation).toBeDefined();

      // Verify metrics are realistic
      expect(impactReport.culturalExchange.culturalInteractions).toBeGreaterThanOrEqual(0);
      expect(impactReport.socialCohesion.relationshipsFormed).toBeGreaterThanOrEqual(0);
      expect(impactReport.culturalPreservation.traditionalKnowledgeDocumented).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cross-Epic Integration', () => {
    it('should integrate project communication with real-time messaging', async () => {
      // Create a project-specific conversation
      const projectConversationData: ConversationCreationData = {
        participants: [testUserId, 'project-member-1', 'project-member-2'],
        conversationType: 'project_channel',
        culturalContext: {
          conversationCultures: testProject.culturalContext.primaryCultures,
          culturalSensitivities: [],
          communicationProtocols: [],
          translationPreferences: {}
        },
        translationEnabled: true
      };

      const projectConversation = await realTimeCommunicationService.createConversation(
        projectConversationData,
        testUserId
      );

      expect(projectConversation.conversationType).toBe('project_channel');
      expect(projectConversation.primaryLanguages.length).toBeGreaterThan(0);
    });

    it('should coordinate project events through event management', async () => {
      // Create an event related to the project
      const projectEventData: EventCreationData = {
        title: `${testProject.title} - Community Launch Event`,
        description: 'Launch event for the Ubuntu Community Garden Project',
        eventType: 'celebration',
        format: 'in_person',
        location: {
          venue: 'Community Garden Site',
          address: 'Project Location',
          culturalSignificance: 'Future site of cultural collaboration'
        },
        dateTime: {
          startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          culturalCalendarConsiderations: ['Project milestone']
        },
        culturalContext: {
          primaryCultures: testProject.culturalContext.primaryCultures,
          culturalSignificance: 'Celebrating collaborative achievement',
          traditionalElements: ['Community blessing', 'Cultural performances'],
          culturalLearningObjectives: ['Project impact celebration', 'Community unity']
        },
        targetCommunities: testProject.targetCommunities.map(tc => tc.community),
        accessibility: {
          wheelchairAccessible: true,
          languageSupport: ['en', 'zu', 'xh', 'af'],
          culturalAccommodations: ['Traditional ceremony space']
        }
      };

      const projectEvent = await culturalEventService.createEvent(projectEventData, testUserId);

      expect(projectEvent.title).toContain(testProject.title);
      expect(projectEvent.culturalContext.primaryCultures).toEqual(testProject.culturalContext.primaryCultures);
    });

    it('should maintain cultural sensitivity across all Epic 5 features', async () => {
      // Verify cultural sensitivity is maintained across all services
      const projectCultures = testProject.culturalContext.primaryCultures;
      const conversationCultures = (await realTimeCommunicationService.getConversation(testConversationId))?.culturalContext.conversationCultures || [];
      const eventCultures = (await culturalEventService.getEvent(testEventId))?.culturalContext.primaryCultures || [];

      // All features should respect the same cultural contexts
      expect(projectCultures.length).toBeGreaterThan(0);
      expect(conversationCultures.length).toBeGreaterThan(0);
      expect(eventCultures.length).toBeGreaterThan(0);

      // Verify Ubuntu philosophy integration
      expect(testProject.vision).toContain('community');
      expect(testProject.culturalContext.traditionalKnowledgeIntegration).toBe(true);
    });
  });
});
