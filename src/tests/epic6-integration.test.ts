import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { achievementGalleryService } from '../services/achievementGalleryService';
import { recognitionEngineService } from '../services/recognitionEngineService';
import { culturalCurationService } from '../services/culturalCurationService';
import {
  Achievement,
  AchievementCreationData,
  AchievementFilters,
  SearchQuery,
  InteractionEvent,
  ServiceActivity,
  BridgeBuildingEvent,
  CurationRequest,
  CommunityReviewData
} from '../types/achievement';

describe('Epic 6: Achievement Showcase & Recognition System - Integration Tests', () => {
  const testUserId = 'test-user-123';
  const testCulturalRepId = 'cultural-rep-456';
  const testExpertId = 'expert-789';
  let testAchievement: Achievement;
  let testCurationId: string;

  beforeEach(async () => {
    // Clean up any existing test data
    // In a real implementation, this would reset the test database
  });

  afterEach(async () => {
    // Clean up test data
  });

  describe('Story 6-16: South African Achievement Gallery', () => {
    it('should create and display achievements with cultural context', async () => {
      const achievementData: AchievementCreationData = {
        title: 'Nelson Mandela Bay Cultural Festival',
        description: 'Annual celebration bringing together diverse communities through music, dance, and storytelling',
        category: {
          primary: 'arts',
          secondary: ['community_service'],
          crossCultural: true,
          nationalSignificance: 'national'
        },
        culturalContext: {
          primaryCulture: 'Xhosa',
          secondaryCultures: ['Afrikaans', 'English'],
          culturalSignificance: 'Promotes unity through cultural exchange and Ubuntu philosophy',
          traditionalElements: ['Traditional Xhosa music', 'Storytelling circles', 'Cultural dances'],
          crossCulturalElements: ['Multi-language performances', 'Fusion music collaborations']
        },
        location: {
          country: 'South Africa',
          province: 'Eastern Cape',
          city: 'Port Elizabeth',
          culturalRegion: 'Nelson Mandela Bay',
          traditionalName: 'iBhayi'
        },
        timeframe: {
          startDate: new Date(2023, 8, 24), // Heritage Day
          endDate: new Date(2023, 8, 26)
        },
        mediaContent: [
          {
            type: 'image',
            url: 'https://example.com/festival-image.jpg',
            caption: 'Community members celebrating cultural diversity',
            culturalContext: 'Multi-cultural celebration showcasing Ubuntu spirit'
          }
        ],
        submissionSource: {
          submitterId: testUserId,
          submitterRole: 'community_member',
          communityEndorsements: ['community-leader-1', 'cultural-elder-2']
        }
      };

      testAchievement = await achievementGalleryService.createAchievement(achievementData);

      expect(testAchievement).toBeDefined();
      expect(testAchievement.title).toBe(achievementData.title);
      expect(testAchievement.category.crossCultural).toBe(true);
      expect(testAchievement.culturalContext.primaryCulture).toBe('Xhosa');
      expect(testAchievement.culturalContext.crossCulturalElements).toHaveLength(2);
      expect(testAchievement.verification.status).toBe('pending');
      expect(testAchievement.location.traditionalName).toBe('iBhayi');
    });

    it('should filter achievements by cultural context and category', async () => {
      const filters: AchievementFilters = {
        category: 'arts',
        culturalContext: 'Xhosa',
        crossCultural: true,
        limit: 10
      };

      const filteredAchievements = await achievementGalleryService.getAchievements(filters);

      expect(filteredAchievements).toBeDefined();
      expect(filteredAchievements.length).toBeGreaterThan(0);
      
      filteredAchievements.forEach(achievement => {
        expect(achievement.category.primary).toBe('arts');
        expect(
          achievement.culturalContext.primaryCulture === 'Xhosa' ||
          achievement.culturalContext.secondaryCultures.includes('Xhosa')
        ).toBe(true);
        expect(achievement.category.crossCultural).toBe(true);
      });
    });

    it('should search achievements with cultural keywords', async () => {
      const searchQuery: SearchQuery = {
        searchText: 'Ubuntu cultural festival',
        filters: {
          culturalContext: 'Xhosa'
        },
        sortBy: 'cultural_significance',
        limit: 5
      };

      const searchResults = await achievementGalleryService.searchAchievements(searchQuery);

      expect(searchResults).toBeDefined();
      expect(searchResults.length).toBeGreaterThan(0);
      
      // Verify search relevance
      const firstResult = searchResults[0];
      const searchableText = [
        firstResult.title,
        firstResult.description,
        firstResult.culturalContext.culturalSignificance
      ].join(' ').toLowerCase();
      
      expect(
        searchableText.includes('ubuntu') || 
        searchableText.includes('cultural') || 
        searchableText.includes('festival')
      ).toBe(true);
    });

    it('should generate achievement timeline with historical context', async () => {
      const timeRange = {
        startDate: new Date(2020, 0, 1),
        endDate: new Date(2024, 0, 1)
      };

      const timeline = await achievementGalleryService.getAchievementTimeline(timeRange);

      expect(timeline).toBeDefined();
      expect(timeline.length).toBeGreaterThan(0);
      
      // Verify chronological order
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].date.getTime()).toBeGreaterThanOrEqual(timeline[i-1].date.getTime());
      }
      
      // Verify cultural context is preserved
      timeline.forEach(event => {
        expect(event.culturalContext).toBeDefined();
        expect(event.culturalContext.length).toBeGreaterThan(0);
      });
    });

    it('should track engagement and cultural discovery metrics', async () => {
      // Track a view from a different cultural background
      await achievementGalleryService.trackAchievementView(testAchievement.id, testUserId);
      
      // Track cultural discovery
      await achievementGalleryService.trackCulturalDiscovery('Zulu', 'Xhosa', testUserId);
      
      // Track social sharing
      await achievementGalleryService.trackSocialSharing(testAchievement.id, 'facebook');

      const updatedAchievement = await achievementGalleryService.getAchievement(testAchievement.id);
      
      expect(updatedAchievement).toBeDefined();
      expect(updatedAchievement!.engagementMetrics.views).toBe(1);
      expect(updatedAchievement!.engagementMetrics.shares).toBe(1);
      expect(updatedAchievement!.engagementMetrics.crossCulturalEngagement).toBeGreaterThan(0);
    });
  });

  describe('Story 6-17: Cross-Cultural Engagement Recognition', () => {
    it('should track cross-cultural interactions and award badges', async () => {
      // Record multiple cross-cultural interactions
      const interaction1: InteractionEvent = {
        userId: testUserId,
        interactionType: {
          type: 'conversation',
          duration: 60,
          qualityScore: 9.0,
          participants: [testUserId, 'user-xhosa-123']
        },
        participantCultures: ['Zulu', 'Xhosa'],
        duration: 60,
        qualityScore: 9.0,
        culturalLearningOutcomes: [
          {
            outcome: 'Learned traditional Xhosa greetings and their cultural significance',
            culturalContext: 'Xhosa',
            learningType: 'knowledge',
            participants: [testUserId]
          }
        ],
        timestamp: new Date(),
        verificationMethod: 'community_validation'
      };

      const interaction2: InteractionEvent = {
        userId: testUserId,
        interactionType: {
          type: 'collaboration',
          duration: 120,
          qualityScore: 8.5,
          participants: [testUserId, 'user-afrikaans-456', 'user-english-789']
        },
        participantCultures: ['Zulu', 'Afrikaans', 'English'],
        duration: 120,
        qualityScore: 8.5,
        culturalLearningOutcomes: [
          {
            outcome: 'Collaborated on multicultural community project',
            culturalContext: 'Multi-cultural',
            learningType: 'skill',
            participants: [testUserId, 'user-afrikaans-456', 'user-english-789']
          }
        ],
        timestamp: new Date(),
        verificationMethod: 'automatic'
      };

      await recognitionEngineService.recordCrossCulturalInteraction(interaction1);
      await recognitionEngineService.recordCrossCulturalInteraction(interaction2);

      // Check badge eligibility
      const eligibilities = await recognitionEngineService.checkBadgeEligibility(testUserId);
      
      expect(eligibilities).toBeDefined();
      expect(eligibilities.length).toBeGreaterThan(0);
      
      // Find Cultural Bridge Builder badge
      const bridgeBuilderEligibility = eligibilities.find(e => 
        e.badgeType.specificType === 'Cultural Bridge Builder'
      );
      
      expect(bridgeBuilderEligibility).toBeDefined();
      expect(bridgeBuilderEligibility!.progress).toBeGreaterThan(0);
    });

    it('should track community service and measure impact', async () => {
      const serviceActivity: ServiceActivity = {
        userId: testUserId,
        activityType: 'organizing',
        communityBenefited: 'Local Xhosa Community',
        culturalContext: 'Xhosa',
        hoursContributed: 8,
        impactDescription: 'Organized cultural heritage preservation workshop',
        verificationDocuments: ['workshop-certificate.pdf'],
        communityEndorsements: ['community-elder-xhosa-1'],
        timestamp: new Date()
      };

      await recognitionEngineService.trackCommunityServiceActivity(serviceActivity);

      // Check progress towards service badges
      const badgeProgress = await recognitionEngineService.getBadgeProgress(
        testUserId, 
        {
          category: 'community_service',
          specificType: 'Community Service Champion',
          description: 'Dedicated to serving diverse communities',
          requirements: [],
          culturalScope: {
            minimumCultures: 2,
            crossCulturalRequired: false,
            communityServiceRequired: true
          },
          difficultyLevel: 'intermediate'
        }
      );

      expect(badgeProgress).toBeDefined();
      expect(badgeProgress.currentProgress).toBeGreaterThan(0);
      expect(badgeProgress.requirements.some((req: any) => req.requirement.includes('service'))).toBe(true);
    });

    it('should measure bridge-building impact and sustainable outcomes', async () => {
      const bridgeBuildingEvent: BridgeBuildingEvent = {
        userId: testUserId,
        eventType: 'connection_facilitation',
        culturesInvolved: ['Zulu', 'Xhosa', 'Afrikaans'],
        participantsConnected: 15,
        sustainableOutcome: true,
        impactMeasurement: 'Established ongoing cultural exchange program between communities',
        communityFeedback: [
          'Excellent facilitation of cross-cultural understanding',
          'Created lasting connections between our communities'
        ],
        timestamp: new Date()
      };

      const impactMetrics = await recognitionEngineService.measureBridgeBuildingImpact(bridgeBuildingEvent);

      expect(impactMetrics).toBeDefined();
      expect(impactMetrics.crossCulturalConnections).toBe(15);
      expect(impactMetrics.bridgeBuildingInstances).toBeGreaterThan(0);
      expect(impactMetrics.culturalLearningMoments).toBeGreaterThan(0);
    });

    it('should generate comprehensive engagement analytics', async () => {
      const timeframe = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };

      const engagementScore = await recognitionEngineService.calculateEngagementScore(testUserId, timeframe);

      expect(engagementScore).toBeDefined();
      expect(engagementScore.totalScore).toBeGreaterThan(0);
      expect(engagementScore.crossCulturalEngagement).toBeGreaterThan(0);
      expect(engagementScore.culturalDiversity).toBeGreaterThan(0);
      expect(engagementScore.consistency).toBeGreaterThanOrEqual(0);
      expect(engagementScore.growth).toBeGreaterThanOrEqual(0);
    });

    it('should generate personalized recognition report', async () => {
      const report = await recognitionEngineService.generateRecognitionReport(testUserId);

      expect(report).toBeDefined();
      expect(report.userId).toBe(testUserId);
      expect(report.summary).toBeDefined();
      expect(report.summary.culturalEngagement).toBeDefined();
      expect(report.summary.communityImpact).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('Story 6-18: Cultural Representative Achievement Curation', () => {
    it('should submit and validate cultural achievement curation', async () => {
      const curationRequest: CurationRequest = {
        achievementId: testAchievement.id,
        culturalRepresentativeId: testCulturalRepId,
        curationReason: 'This achievement represents significant cultural preservation and cross-cultural collaboration',
        proposedSignificance: 'Demonstrates successful implementation of Ubuntu philosophy in modern community building',
        traditionalElements: ['Ubuntu philosophy', 'Traditional storytelling', 'Community consensus building'],
        culturalProtocols: ['Elder consultation', 'Community approval', 'Respectful representation'],
        sensitivityLevel: 'community_only',
        communityConsultationRequired: true
      };

      const curation = await culturalCurationService.submitCurationRequest(curationRequest);
      testCurationId = curation.id;

      expect(curation).toBeDefined();
      expect(curation.culturalRepresentativeId).toBe(testCulturalRepId);
      expect(curation.achievementId).toBe(testAchievement.id);
      expect(curation.curationMetadata.sensitivityLevel.level).toBe('community_only');
      expect(curation.curationMetadata.traditionalElements).toHaveLength(3);
      expect(curation.publicationStatus.status).toBe('draft');
    });

    it('should conduct expert validation with cultural accuracy assessment', async () => {
      // Submit expert validation
      const expertValidation = {
        expertId: testExpertId,
        expertType: 'cultural_expert' as const,
        consultationDate: new Date(),
        findings: 'Achievement accurately represents Xhosa cultural traditions and demonstrates authentic Ubuntu principles',
        recommendations: [
          'Ensure proper attribution to traditional knowledge holders',
          'Include additional context about historical significance'
        ],
        confidence: 92
      };

      await culturalCurationService.submitExpertValidation(testCurationId, testExpertId, expertValidation);

      const updatedCuration = await culturalCurationService.getCuration(testCurationId);
      
      expect(updatedCuration).toBeDefined();
      expect(updatedCuration!.culturalValidation.expertConsultations).toHaveLength(1);
      expect(updatedCuration!.culturalValidation.validationScore).toBe(92);
      expect(updatedCuration!.culturalValidation.culturalAccuracyRating).toBe(92);
    });

    it('should collect and analyze community feedback', async () => {
      const communityReview1: CommunityReviewData = {
        curationId: testCurationId,
        reviewerId: 'community-member-1',
        reviewType: 'cultural_appropriateness',
        rating: 9,
        feedback: 'Excellent representation of our cultural values and traditions',
        culturalContext: 'Xhosa'
      };

      const communityReview2: CommunityReviewData = {
        curationId: testCurationId,
        reviewerId: 'community-member-2',
        reviewType: 'accuracy',
        rating: 8,
        feedback: 'Accurate portrayal with good cultural sensitivity',
        culturalContext: 'Xhosa'
      };

      await culturalCurationService.submitCommunityReview(communityReview1);
      await culturalCurationService.submitCommunityReview(communityReview2);

      const consensus = await culturalCurationService.calculateCommunityConsensus(testCurationId);

      expect(consensus).toBeDefined();
      expect(consensus.consensus).toBe('approved');
      expect(consensus.averageRating).toBe(8.5);
      expect(consensus.totalReviews).toBe(2);
      expect(consensus.confidence).toBeGreaterThan(0);
    });

    it('should add historical sources and traditional knowledge validation', async () => {
      const historicalSource = {
        sourceId: 'source-1',
        sourceType: 'oral_tradition' as const,
        title: 'Elder testimonies about Ubuntu practices',
        author: 'Community Elders',
        date: new Date(1950, 0, 1),
        location: 'Eastern Cape',
        reliability: 9,
        culturalContext: 'Xhosa'
      };

      const knowledgeKeeper = {
        keeperId: 'keeper-1',
        culturalRole: 'Traditional Elder',
        community: 'Xhosa',
        expertise: ['Ubuntu philosophy', 'Traditional governance', 'Cultural protocols'],
        consultationDate: new Date(),
        validation: 'Confirms authentic representation of Ubuntu principles and cultural practices'
      };

      await culturalCurationService.addHistoricalSource(testCurationId, historicalSource);
      await culturalCurationService.consultTraditionalKnowledgeKeeper(testCurationId, knowledgeKeeper);

      const updatedCuration = await culturalCurationService.getCuration(testCurationId);
      
      expect(updatedCuration).toBeDefined();
      expect(updatedCuration!.historicalVerification.primarySources).toHaveLength(1);
      expect(updatedCuration!.historicalVerification.traditionalKnowledgeKeepers).toHaveLength(1);
      expect(updatedCuration!.historicalVerification.verificationLevel).toBe('culturally_endorsed');
      expect(updatedCuration!.historicalVerification.accuracyConfidence).toBeGreaterThan(80);
    });

    it('should make publication decisions with appropriate visibility controls', async () => {
      const publicationDecision = {
        curationId: testCurationId,
        decision: 'approve' as const,
        visibility: 'public' as const,
        conditions: ['Maintain attribution to traditional knowledge holders'],
        reviewNotes: 'Excellent curation with strong community support and expert validation'
      };

      const publishedCuration = await culturalCurationService.makePublicationDecision(publicationDecision);

      expect(publishedCuration).toBeDefined();
      expect(publishedCuration.publicationStatus.status).toBe('published');
      expect(publishedCuration.publicationStatus.visibility).toBe('public');
      expect(publishedCuration.publicationStatus.publishDate).toBeDefined();
      expect(publishedCuration.impactMetrics.communityEngagement).toBeGreaterThan(0);
    });

    it('should generate comprehensive curation analytics', async () => {
      const timeframe = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };

      const curationReport = await culturalCurationService.generateCurationReport(timeframe);

      expect(curationReport).toBeDefined();
      expect(curationReport.totalCurations).toBeGreaterThan(0);
      expect(curationReport.publishedCurations).toBeGreaterThan(0);
      expect(curationReport.publicationRate).toBeGreaterThan(0);
      expect(curationReport.averageValidationScore).toBeGreaterThan(0);
      expect(curationReport.culturalDistribution).toBeDefined();
      expect(curationReport.sensitivityDistribution).toBeDefined();
      expect(Array.isArray(curationReport.topCurations)).toBe(true);
    });
  });

  describe('Cross-Epic Integration', () => {
    it('should integrate achievement gallery with recognition system', async () => {
      // View achievements should contribute to engagement score
      await achievementGalleryService.trackAchievementView(testAchievement.id, testUserId);
      
      const engagementScore = await recognitionEngineService.calculateEngagementScore(testUserId, {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date()
      });

      expect(engagementScore.culturalDiversity).toBeGreaterThan(0);
    });

    it('should integrate curation with achievement verification', async () => {
      // Curated achievements should have higher verification scores
      const curatedAchievement = await achievementGalleryService.getAchievement(testAchievement.id);
      
      expect(curatedAchievement).toBeDefined();
      // In a full implementation, curation would update achievement verification
    });

    it('should maintain cultural sensitivity across all Epic 6 features', async () => {
      // Verify cultural protocols are respected in all services
      const achievement = await achievementGalleryService.getAchievement(testAchievement.id);
      const curation = await culturalCurationService.getCuration(testCurationId);
      
      expect(achievement?.culturalContext.primaryCulture).toBeDefined();
      expect(curation?.curationMetadata.sensitivityLevel.level).toBeDefined();
      
      // Verify Ubuntu philosophy integration
      expect(achievement?.culturalContext.culturalSignificance).toContain('Ubuntu');
      expect(curation?.curationMetadata.traditionalElements.some(e => 
        e.element.includes('Ubuntu')
      )).toBe(true);
    });

    it('should support cross-cultural discovery and learning', async () => {
      // Get suggestions for cross-cultural learning
      const suggestions = await achievementGalleryService.getAchievementSuggestions(testUserId);
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Verify suggestions include different cultures
      const cultures = new Set(suggestions.map(s => s.culturalContext.primaryCulture));
      expect(cultures.size).toBeGreaterThan(1);
    });
  });
});
