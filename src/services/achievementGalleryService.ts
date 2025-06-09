import {
  Achievement,
  AchievementCategory,
  AchievementFilters,
  VerificationStatus,
  GeographicLocation,
  SearchQuery,
  TimelineEvent,
  EngagementReport
} from '../types/achievement';

export interface AchievementCreationData {
  title: string;
  description: string;
  category: AchievementCategory;
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

export interface AchievementUpdateData {
  title?: string;
  description?: string;
  culturalContext?: any;
  verification?: VerificationStatus;
  mediaContent?: any[];
}

class AchievementGalleryService {
  private achievements: Map<string, Achievement> = new Map();
  private featuredAchievements: string[] = [];
  private categoryAchievements: Map<string, string[]> = new Map();
  private locationAchievements: Map<string, string[]> = new Map();

  // Achievement Management
  async createAchievement(data: AchievementCreationData): Promise<Achievement> {
    const achievement: Achievement = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      category: {
        primary: data.category.primary,
        secondary: data.category.secondary || [],
        crossCultural: data.culturalContext.crossCulturalElements.length > 0,
        nationalSignificance: this.determineNationalSignificance(data.location, data.culturalContext)
      },
      culturalContext: {
        primaryCulture: data.culturalContext.primaryCulture,
        secondaryCultures: data.culturalContext.secondaryCultures,
        culturalSignificance: data.culturalContext.culturalSignificance,
        traditionalElements: data.culturalContext.traditionalElements,
        modernAdaptations: [],
        crossCulturalElements: data.culturalContext.crossCulturalElements.map(element => ({
          element,
          culturalOrigins: [data.culturalContext.primaryCulture, ...data.culturalContext.secondaryCultures],
          collaborationType: 'cultural_exchange',
          impactDescription: 'Cross-cultural collaboration and understanding'
        }))
      },
      location: data.location,
      timeframe: {
        startDate: data.timeframe.startDate,
        endDate: data.timeframe.endDate,
        historicalPeriod: this.determineHistoricalPeriod(data.timeframe.startDate),
        culturalCalendarAlignment: []
      },
      mediaContent: data.mediaContent.map(media => ({
        id: this.generateId(),
        type: media.type,
        url: media.url,
        caption: media.caption,
        culturalContext: media.culturalContext || '',
        accessibility: {
          altText: media.caption,
          transcription: '',
          culturalDescription: media.culturalContext || ''
        },
        permissions: {
          publicAccess: true,
          culturalCommunityAccess: true,
          commercialUse: false,
          attribution: 'required'
        }
      })),
      verification: {
        status: 'pending',
        reviewers: [],
        verificationScore: 0,
        factCheckResults: [],
        communityApproval: {
          approvalScore: 0,
          totalVotes: 0,
          culturalRepresentativeApproval: false,
          communityEndorsements: data.submissionSource.communityEndorsements
        },
        culturalApproval: {
          culturalRepresentativeId: '',
          approvalStatus: 'pending',
          culturalAccuracyScore: 0,
          traditionalKnowledgeValidation: false,
          culturalSensitivityCheck: 'pending'
        }
      },
      communityEndorsements: data.submissionSource.communityEndorsements.map(endorsement => ({
        endorserId: endorsement,
        endorsementType: 'community_support',
        endorsementDate: new Date(),
        endorsementDetails: 'Community member endorsement',
        culturalContext: data.culturalContext.primaryCulture
      })),
      culturalSignificance: {
        significanceLevel: 'community',
        culturalImpact: data.culturalContext.culturalSignificance,
        traditionalKnowledgeElements: data.culturalContext.traditionalElements,
        modernRelevance: 'Contemporary cultural significance',
        preservationValue: 8,
        educationalValue: 7
      },
      relatedAchievements: [],
      socialImpact: {
        communityBenefit: 'Positive community impact',
        culturalPreservation: 'Cultural knowledge preservation',
        crossCulturalUnderstanding: 'Enhanced cross-cultural understanding',
        inspirationalValue: 8,
        roleModelPotential: 7
      },
      submissionSource: {
        submitterId: data.submissionSource.submitterId,
        submissionDate: new Date(),
        submitterRole: data.submissionSource.submitterRole,
        submissionMethod: 'web_form',
        verificationDocuments: [],
        communityEndorsements: data.submissionSource.communityEndorsements
      },
      engagementMetrics: {
        views: 0,
        shares: 0,
        culturalDiscoveries: 0,
        inspirationSaves: 0,
        crossCulturalEngagement: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.achievements.set(achievement.id, achievement);
    this.indexAchievement(achievement);
    return achievement;
  }

  async getAchievement(achievementId: string): Promise<Achievement | null> {
    return this.achievements.get(achievementId) || null;
  }

  async updateAchievement(achievementId: string, updates: AchievementUpdateData): Promise<Achievement> {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const updatedAchievement = {
      ...achievement,
      ...updates,
      updatedAt: new Date()
    };

    this.achievements.set(achievementId, updatedAchievement);
    return updatedAchievement;
  }

  async deleteAchievement(achievementId: string): Promise<boolean> {
    const deleted = this.achievements.delete(achievementId);
    this.removeFromIndexes(achievementId);
    return deleted;
  }

  // Gallery Browsing
  async getAchievements(filters: AchievementFilters): Promise<Achievement[]> {
    let achievements = Array.from(this.achievements.values());

    if (filters.category) {
      achievements = achievements.filter(a => a.category.primary === filters.category);
    }

    if (filters.culturalContext) {
      achievements = achievements.filter(a =>
        a.culturalContext.primaryCulture === filters.culturalContext ||
        a.culturalContext.secondaryCultures.includes(filters.culturalContext!)
      );
    }

    if (filters.location) {
      achievements = achievements.filter(a =>
        a.location.province === filters.location?.province ||
        a.location.city === filters.location?.city
      );
    }

    if (filters.timeframe) {
      achievements = achievements.filter(a =>
        a.timeframe.startDate >= filters.timeframe!.startDate &&
        a.timeframe.endDate <= filters.timeframe!.endDate
      );
    }

    if (filters.verificationStatus) {
      achievements = achievements.filter(a => a.verification.status === filters.verificationStatus);
    }

    // Sort by relevance and engagement
    achievements.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, filters);
      const scoreB = this.calculateRelevanceScore(b, filters);
      return scoreB - scoreA;
    });

    return achievements.slice(0, filters.limit || 50);
  }

  async getFeaturedAchievements(): Promise<Achievement[]> {
    const featured = this.featuredAchievements
      .map(id => this.achievements.get(id))
      .filter(Boolean) as Achievement[];

    return featured.sort((a, b) => b.engagementMetrics.views - a.engagementMetrics.views);
  }

  async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    const categoryIds = this.categoryAchievements.get(category.primary) || [];
    return categoryIds
      .map(id => this.achievements.get(id))
      .filter(Boolean) as Achievement[];
  }

  async getAchievementsByLocation(location: GeographicLocation): Promise<Achievement[]> {
    const locationKey = `${location.province}-${location.city}`;
    const locationIds = this.locationAchievements.get(locationKey) || [];
    return locationIds
      .map(id => this.achievements.get(id))
      .filter(Boolean) as Achievement[];
  }

  // Search and Discovery
  async searchAchievements(query: SearchQuery): Promise<Achievement[]> {
    const achievements = Array.from(this.achievements.values());
    const searchTerms = query.searchText.toLowerCase().split(' ');

    const results = achievements.filter(achievement => {
      const searchableText = [
        achievement.title,
        achievement.description,
        achievement.culturalContext.culturalSignificance,
        achievement.culturalContext.primaryCulture,
        ...achievement.culturalContext.secondaryCultures,
        ...achievement.culturalContext.traditionalElements
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

    // Apply additional filters
    let filteredResults = results;

    if (query.filters?.category) {
      filteredResults = filteredResults.filter(a => a.category.primary === query.filters!.category);
    }

    if (query.filters?.culturalContext) {
      filteredResults = filteredResults.filter(a =>
        a.culturalContext.primaryCulture === query.filters!.culturalContext ||
        a.culturalContext.secondaryCultures.includes(query.filters!.culturalContext!)
      );
    }

    // Sort by relevance
    filteredResults.sort((a, b) => {
      const scoreA = this.calculateSearchRelevance(a, query.searchText);
      const scoreB = this.calculateSearchRelevance(b, query.searchText);
      return scoreB - scoreA;
    });

    return filteredResults.slice(0, query.limit || 20);
  }

  async getAchievementSuggestions(userId: string): Promise<Achievement[]> {
    // Get user's cultural background and interests
    const userProfile = await this.getUserProfile(userId);
    const achievements = Array.from(this.achievements.values());

    // Filter for cross-cultural achievements that might interest the user
    const suggestions = achievements.filter(achievement => {
      // Include achievements from other cultures
      const isDifferentCulture = achievement.culturalContext.primaryCulture !== userProfile.primaryCulture;

      // Include cross-cultural collaborations
      const isCrossCultural = achievement.category.crossCultural;

      // Include highly rated achievements
      const isHighQuality = achievement.verification.verificationScore > 80;

      return (isDifferentCulture || isCrossCultural) && isHighQuality;
    });

    // Sort by potential interest and cultural learning value
    suggestions.sort((a, b) => {
      const scoreA = this.calculateSuggestionScore(a, userProfile);
      const scoreB = this.calculateSuggestionScore(b, userProfile);
      return scoreB - scoreA;
    });

    return suggestions.slice(0, 10);
  }

  async getPopularAchievements(timeframe: string): Promise<Achievement[]> {
    const achievements = Array.from(this.achievements.values());
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const recentAchievements = achievements.filter(a => a.createdAt >= startDate);

    recentAchievements.sort((a, b) => {
      const popularityA = a.engagementMetrics.views + a.engagementMetrics.shares * 3 + a.engagementMetrics.inspirationSaves * 2;
      const popularityB = b.engagementMetrics.views + b.engagementMetrics.shares * 3 + b.engagementMetrics.inspirationSaves * 2;
      return popularityB - popularityA;
    });

    return recentAchievements.slice(0, 20);
  }

  // Timeline and Historical View
  async getAchievementTimeline(timeRange: { startDate: Date; endDate: Date }): Promise<TimelineEvent[]> {
    const achievements = Array.from(this.achievements.values()).filter(a =>
      a.timeframe.startDate >= timeRange.startDate && a.timeframe.endDate <= timeRange.endDate
    );

    const timelineEvents: TimelineEvent[] = achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      date: achievement.timeframe.startDate,
      culturalContext: achievement.culturalContext.primaryCulture,
      category: achievement.category.primary,
      significance: achievement.culturalSignificance.significanceLevel,
      description: achievement.description,
      mediaUrl: achievement.mediaContent[0]?.url || '',
      crossCultural: achievement.category.crossCultural
    }));

    return timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Related Achievements
  async getRelatedAchievements(achievementId: string): Promise<Achievement[]> {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      return [];
    }

    const allAchievements = Array.from(this.achievements.values());
    const related = allAchievements.filter(a => {
      if (a.id === achievementId) return false;

      // Same cultural context
      const sameCulture = a.culturalContext.primaryCulture === achievement.culturalContext.primaryCulture;

      // Same category
      const sameCategory = a.category.primary === achievement.category.primary;

      // Same location
      const sameLocation = a.location.province === achievement.location.province;

      // Similar time period
      const timeDiff = Math.abs(a.timeframe.startDate.getTime() - achievement.timeframe.startDate.getTime());
      const sameEra = timeDiff < (50 * 365 * 24 * 60 * 60 * 1000); // Within 50 years

      return sameCulture || sameCategory || sameLocation || sameEra;
    });

    // Sort by relevance
    related.sort((a, b) => {
      const scoreA = this.calculateRelatedScore(a, achievement);
      const scoreB = this.calculateRelatedScore(b, achievement);
      return scoreB - scoreA;
    });

    return related.slice(0, 6);
  }

  // Engagement Tracking
  async trackAchievementView(achievementId: string, userId: string): Promise<void> {
    const achievement = this.achievements.get(achievementId);
    if (achievement) {
      achievement.engagementMetrics.views++;

      // Track cross-cultural discovery
      const userProfile = await this.getUserProfile(userId);
      if (userProfile.primaryCulture !== achievement.culturalContext.primaryCulture) {
        achievement.engagementMetrics.crossCulturalEngagement++;
      }

      this.achievements.set(achievementId, achievement);
    }
  }

  async trackCulturalDiscovery(fromCulture: string, toCulture: string, userId: string): Promise<void> {
    // Track cultural discovery patterns for analytics
    console.log(`Cultural discovery: ${fromCulture} → ${toCulture} by user ${userId}`);
  }

  async trackSocialSharing(achievementId: string, _platform: string): Promise<void> {
    const achievement = this.achievements.get(achievementId);
    if (achievement) {
      achievement.engagementMetrics.shares++;
      this.achievements.set(achievementId, achievement);
    }
  }

  async generateEngagementReport(timeframe: { startDate: Date; endDate: Date }): Promise<EngagementReport> {
    const achievements = Array.from(this.achievements.values()).filter(a =>
      a.createdAt >= timeframe.startDate && a.createdAt <= timeframe.endDate
    );

    const totalViews = achievements.reduce((sum, a) => sum + a.engagementMetrics.views, 0);
    const totalShares = achievements.reduce((sum, a) => sum + a.engagementMetrics.shares, 0);
    const crossCulturalEngagement = achievements.reduce((sum, a) => sum + a.engagementMetrics.crossCulturalEngagement, 0);

    const culturalDistribution = this.calculateCulturalDistribution(achievements);
    const categoryDistribution = this.calculateCategoryDistribution(achievements);

    return {
      timeframe: {
        ...timeframe,
        historicalPeriod: 'democratic_era',
        culturalCalendarAlignment: []
      },
      totalAchievements: achievements.length,
      totalViews,
      totalShares,
      crossCulturalEngagement,
      averageEngagement: totalViews / achievements.length || 0,
      culturalDistribution,
      categoryDistribution,
      topAchievements: achievements
        .sort((a, b) => b.engagementMetrics.views - a.engagementMetrics.views)
        .slice(0, 10)
        .map(a => ({ id: a.id, title: a.title, views: a.engagementMetrics.views }))
    };
  }

  // Helper Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private determineNationalSignificance(location: GeographicLocation, culturalContext: any): 'local' | 'provincial' | 'national' | 'international' {
    // Simple logic - in real implementation would be more sophisticated
    if (culturalContext.crossCulturalElements.length > 0) return 'national';
    if (location.province) return 'provincial';
    return 'local';
  }

  private determineHistoricalPeriod(date: Date): string {
    const year = date.getFullYear();
    if (year < 1900) return 'pre_colonial';
    if (year < 1948) return 'early_colonial';
    if (year < 1994) return 'apartheid_era';
    return 'democratic_era';
  }

  private indexAchievement(achievement: Achievement): void {
    // Index by category
    const categoryKey = achievement.category.primary;
    if (!this.categoryAchievements.has(categoryKey)) {
      this.categoryAchievements.set(categoryKey, []);
    }
    this.categoryAchievements.get(categoryKey)!.push(achievement.id);

    // Index by location
    const locationKey = `${achievement.location.province}-${achievement.location.city}`;
    if (!this.locationAchievements.has(locationKey)) {
      this.locationAchievements.set(locationKey, []);
    }
    this.locationAchievements.get(locationKey)!.push(achievement.id);

    // Add to featured if high quality
    if (achievement.verification.verificationScore > 85 && achievement.category.crossCultural) {
      this.featuredAchievements.push(achievement.id);
    }
  }

  private removeFromIndexes(achievementId: string): void {
    // Remove from all indexes
    for (const [, ids] of this.categoryAchievements) {
      const index = ids.indexOf(achievementId);
      if (index > -1) ids.splice(index, 1);
    }

    for (const [, ids] of this.locationAchievements) {
      const index = ids.indexOf(achievementId);
      if (index > -1) ids.splice(index, 1);
    }

    const featuredIndex = this.featuredAchievements.indexOf(achievementId);
    if (featuredIndex > -1) this.featuredAchievements.splice(featuredIndex, 1);
  }

  private calculateRelevanceScore(achievement: Achievement, _filters: AchievementFilters): number {
    let score = 0;

    // Base score from verification and engagement
    score += achievement.verification.verificationScore * 0.3;
    score += Math.min(achievement.engagementMetrics.views / 100, 50) * 0.2;

    // Bonus for cross-cultural achievements
    if (achievement.category.crossCultural) score += 20;

    // Bonus for cultural significance
    score += achievement.culturalSignificance.preservationValue * 2;

    // Bonus for recent achievements
    const daysSinceCreation = (Date.now() - achievement.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) score += 10;

    return score;
  }

  private calculateSearchRelevance(achievement: Achievement, searchText: string): number {
    const searchTerms = searchText.toLowerCase().split(' ');
    let score = 0;

    // Title matches
    const titleMatches = searchTerms.filter(term => achievement.title.toLowerCase().includes(term)).length;
    score += titleMatches * 10;

    // Description matches
    const descMatches = searchTerms.filter(term => achievement.description.toLowerCase().includes(term)).length;
    score += descMatches * 5;

    // Cultural context matches
    const culturalMatches = searchTerms.filter(term =>
      achievement.culturalContext.culturalSignificance.toLowerCase().includes(term) ||
      achievement.culturalContext.primaryCulture.toLowerCase().includes(term)
    ).length;
    score += culturalMatches * 8;

    return score;
  }

  private calculateSuggestionScore(achievement: Achievement, userProfile: any): number {
    let score = 0;

    // Cross-cultural learning potential
    if (achievement.culturalContext.primaryCulture !== userProfile.primaryCulture) {
      score += 30;
    }

    // Cross-cultural collaboration
    if (achievement.category.crossCultural) {
      score += 25;
    }

    // Quality and verification
    score += achievement.verification.verificationScore * 0.2;

    // Educational value
    score += achievement.culturalSignificance.educationalValue * 3;

    // Engagement metrics
    score += Math.min(achievement.engagementMetrics.views / 50, 20);

    return score;
  }

  private calculateRelatedScore(candidate: Achievement, reference: Achievement): number {
    let score = 0;

    // Same culture
    if (candidate.culturalContext.primaryCulture === reference.culturalContext.primaryCulture) {
      score += 30;
    }

    // Same category
    if (candidate.category.primary === reference.category.primary) {
      score += 25;
    }

    // Same location
    if (candidate.location.province === reference.location.province) {
      score += 20;
    }

    // Similar time period
    const timeDiff = Math.abs(candidate.timeframe.startDate.getTime() - reference.timeframe.startDate.getTime());
    const yearsDiff = timeDiff / (365 * 24 * 60 * 60 * 1000);
    if (yearsDiff < 10) score += 15;
    else if (yearsDiff < 50) score += 10;

    // Quality bonus
    score += candidate.verification.verificationScore * 0.1;

    return score;
  }

  private calculateCulturalDistribution(achievements: Achievement[]): { [culture: string]: number } {
    const distribution: { [culture: string]: number } = {};
    achievements.forEach(achievement => {
      const culture = achievement.culturalContext.primaryCulture;
      distribution[culture] = (distribution[culture] || 0) + 1;
    });
    return distribution;
  }

  private calculateCategoryDistribution(achievements: Achievement[]): { [category: string]: number } {
    const distribution: { [category: string]: number } = {};
    achievements.forEach(achievement => {
      const category = achievement.category.primary;
      distribution[category] = (distribution[category] || 0) + 1;
    });
    return distribution;
  }

  private async getUserProfile(_userId: string): Promise<any> {
    // Simulate getting user profile
    return {
      primaryCulture: 'Zulu',
      interests: ['sports', 'arts', 'community_service'],
      culturalLearningGoals: ['cross_cultural_understanding']
    };
  }
}

export const achievementGalleryService = new AchievementGalleryService();