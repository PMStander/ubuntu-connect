import React, { useState, useEffect } from 'react';
import {
  UserBadge,
  BadgeEligibility,
  BadgeAward,
  InteractionEvent,
  ServiceActivity
} from '../types/achievement';
import { recognitionEngineService } from '../services/recognitionEngineService';

interface RecognitionDashboardProps {
  userId: string;
}

const RecognitionDashboard: React.FC<RecognitionDashboardProps> = ({ userId }) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [eligibleBadges, setEligibleBadges] = useState<BadgeEligibility[]>([]);
  const [engagementScore, setEngagementScore] = useState<any>(null);
  const [recognitionReport, setRecognitionReport] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'progress' | 'leaderboard' | 'impact'>('badges');
  const [recentAward, setRecentAward] = useState<BadgeAward | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [badges, eligibility, score, report, leaderboardData] = await Promise.all([
        recognitionEngineService.getUserBadges(userId),
        recognitionEngineService.checkBadgeEligibility(userId),
        recognitionEngineService.calculateEngagementScore(userId, {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        }),
        recognitionEngineService.generateRecognitionReport(userId),
        recognitionEngineService.getLeaderboard('total', {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        })
      ]);

      setUserBadges(badges);
      setEligibleBadges(eligibility);
      setEngagementScore(score);
      setRecognitionReport(report);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBadge = async (badgeType: any) => {
    try {
      const award = await recognitionEngineService.awardBadge(userId, badgeType);
      setRecentAward(award);
      
      // Refresh data
      await loadUserData();
    } catch (error) {
      console.error('Error claiming badge:', error);
    }
  };

  const recordInteraction = async () => {
    // Simulate recording a cross-cultural interaction
    const interaction: InteractionEvent = {
      userId,
      interactionType: {
        type: 'conversation',
        duration: 45,
        qualityScore: 8.5,
        participants: ['user1', 'user2']
      },
      participantCultures: ['Zulu', 'Afrikaans'],
      duration: 45,
      qualityScore: 8.5,
      culturalLearningOutcomes: [
        {
          outcome: 'Learned about traditional Zulu greetings',
          culturalContext: 'Zulu',
          learningType: 'knowledge',
          participants: [userId]
        }
      ],
      timestamp: new Date(),
      verificationMethod: 'automatic'
    };

    await recognitionEngineService.recordCrossCulturalInteraction(interaction);
    await loadUserData();
  };

  const recordServiceActivity = async () => {
    // Simulate recording community service
    const activity: ServiceActivity = {
      userId,
      activityType: 'volunteering',
      communityBenefited: 'Local Zulu Community',
      culturalContext: 'Zulu',
      hoursContributed: 4,
      impactDescription: 'Helped organize cultural festival',
      verificationDocuments: [],
      communityEndorsements: ['community-leader-1'],
      timestamp: new Date()
    };

    await recognitionEngineService.trackCommunityServiceActivity(activity);
    await loadUserData();
  };

  const renderBadgeCard = (badge: UserBadge) => (
    <div key={badge.id} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
            badge.level.level === 'platinum' ? 'bg-gray-400' :
            badge.level.level === 'gold' ? 'bg-yellow-500' :
            badge.level.level === 'silver' ? 'bg-gray-300' :
            'bg-orange-600'
          }`}>
            {badge.level.level === 'cultural_ambassador' ? '👑' :
             badge.level.level === 'platinum' ? '💎' :
             badge.level.level === 'gold' ? '🥇' :
             badge.level.level === 'silver' ? '🥈' : '🥉'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{badge.badgeType.specificType}</h3>
            <p className="text-sm text-gray-600 capitalize">{badge.level.level} Level</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {badge.earnedDate.toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{badge.badgeType.description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cultures Involved:</span>
          <span className="font-medium">{badge.culturalContext.culturesInvolved.join(', ')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Impact Level:</span>
          <span className="font-medium capitalize">{badge.culturalContext.impactLevel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bridge Building Score:</span>
          <span className="font-medium">{badge.culturalContext.bridgeBuildingScore}/100</span>
        </div>
      </div>

      {badge.level.specialPrivileges.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Special Privileges:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {badge.level.specialPrivileges.map((privilege, index) => (
              <li key={index}>• {privilege}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderEligibilityCard = (eligibility: BadgeEligibility) => (
    <div key={eligibility.badgeType.specificType} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{eligibility.badgeType.specificType}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${
          eligibility.eligible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {eligibility.eligible ? 'Ready to Claim!' : `${Math.round(eligibility.progress)}% Complete`}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{eligibility.badgeType.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{Math.round(eligibility.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(eligibility.progress, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium text-gray-900">Requirements:</h4>
        {eligibility.requirements.map((req: any, index: number) => (
          <div key={index} className="text-xs text-gray-600">
            • {req.requirement}
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <strong>Next Milestone:</strong> {eligibility.nextMilestone}
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <strong>Estimated Time:</strong> {eligibility.estimatedTimeToEarn}
      </div>
      
      {eligibility.eligible && (
        <button
          onClick={() => handleClaimBadge(eligibility.badgeType)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Claim Badge
        </button>
      )}
    </div>
  );

  const renderEngagementScore = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Your Engagement Score (Last 30 Days)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{engagementScore?.totalScore || 0}</div>
          <div className="text-sm text-gray-600">Total Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{engagementScore?.culturalDiversity || 0}</div>
          <div className="text-sm text-gray-600">Cultural Diversity</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{engagementScore?.consistency || 0}</div>
          <div className="text-sm text-gray-600">Consistency</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Cross-Cultural Engagement</h4>
          <div className="text-2xl font-bold text-blue-600">{engagementScore?.crossCulturalEngagement || 0}</div>
          <div className="text-sm text-blue-700">Points from cultural interactions</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Community Service</h4>
          <div className="text-2xl font-bold text-green-600">{engagementScore?.communityService || 0}</div>
          <div className="text-sm text-green-700">Points from service activities</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Bridge Building</h4>
          <div className="text-2xl font-bold text-purple-600">{engagementScore?.bridgeBuilding || 0}</div>
          <div className="text-sm text-purple-700">Points from connecting communities</div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Community Leaderboard</h3>
      
      <div className="space-y-4">
        {leaderboard.slice(0, 10).map((entry, index) => (
          <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-lg ${
            entry.userId === userId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-600' :
                'bg-gray-300'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-medium">
                  {entry.userId === userId ? 'You' : `User ${entry.userId.slice(-4)}`}
                </div>
                <div className="text-sm text-gray-600">
                  {entry.badges} badges • {entry.culturalDiversity} cultural diversity
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{entry.score}</div>
              <div className="text-sm text-gray-600">points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderImpactSummary = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Your Cultural Impact</h3>
      
      {recognitionReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {recognitionReport.summary.culturalEngagement.culturesEngaged}
              </div>
              <div className="text-sm text-gray-600">Cultures Engaged</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {recognitionReport.summary.communityImpact.serviceHours}
              </div>
              <div className="text-sm text-gray-600">Service Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {recognitionReport.summary.communityImpact.connectionsFormed}
              </div>
              <div className="text-sm text-gray-600">Connections Formed</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Achievements</h4>
            <div className="space-y-2">
              {recognitionReport.summary.achievements.slice(0, 5).map((achievement: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{achievement.badgeType}</span>
                  <span className="text-xs text-gray-500">{achievement.earnedDate}</span>
                </div>
              ))}
            </div>
          </div>
          
          {recognitionReport.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {recognitionReport.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recognition Dashboard</h1>
        <p className="text-gray-600">
          Track your cross-cultural engagement and earn recognition for building bridges between communities
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={recordInteraction}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Record Cross-Cultural Interaction
          </button>
          <button
            onClick={recordServiceActivity}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Log Community Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { key: 'badges', label: 'My Badges', icon: '🏆' },
          { key: 'progress', label: 'Progress', icon: '📈' },
          { key: 'leaderboard', label: 'Leaderboard', icon: '🥇' },
          { key: 'impact', label: 'Impact', icon: '🌍' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'badges' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Your Badges ({userBadges.length})</h2>
          {userBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBadges.map(renderBadgeCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
              <p className="text-gray-600 mb-4">Start engaging with different cultures to earn your first badge!</p>
              <button
                onClick={recordInteraction}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Record Your First Interaction
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Badge Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleBadges.map(renderEligibilityCard)}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && renderLeaderboard()}

      {activeTab === 'impact' && (
        <div className="space-y-6">
          {renderEngagementScore()}
          {renderImpactSummary()}
        </div>
      )}

      {/* Badge Award Modal */}
      {recentAward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                {recentAward.badge.badgeType.specificType}
              </h3>
              <p className="text-gray-700 mb-4">{recentAward.celebrationMessage}</p>
              <p className="text-sm text-gray-600 mb-6">{recentAward.culturalContext}</p>
              
              {recentAward.nextLevelInfo && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Next Level</h4>
                  <p className="text-sm text-blue-700">
                    Earn {recentAward.nextLevelInfo.pointsRequired} more points to reach {recentAward.nextLevelInfo.level} level
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setRecentAward(null)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecognitionDashboard;
