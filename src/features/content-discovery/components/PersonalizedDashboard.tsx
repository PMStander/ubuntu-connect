import React, { useState, useEffect } from 'react'
import { contentDiscoveryService, ContentRecommendation, TrendingTopic, PersonalizedDashboard as DashboardData } from '../../../services/contentDiscoveryService'
import { useAuth } from '../../auth/hooks/useAuth'

interface PersonalizedDashboardProps {
  onContentSelect?: (contentId: string, contentType: string) => void
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  onContentSelect,
}) => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'recommendations' | 'trending' | 'progress'>('overview')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [dashboard, recs, trending] = await Promise.all([
        contentDiscoveryService.getPersonalizedDashboard(user.uid),
        contentDiscoveryService.generatePersonalizedRecommendations(user.uid, 8),
        contentDiscoveryService.discoverTrendingTopics('south-africa'),
      ])

      setDashboardData(dashboard)
      setRecommendations(recs)
      setTrendingTopics(trending)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentInteraction = async (contentId: string, interactionType: 'view' | 'like' | 'bookmark') => {
    if (!user) return

    try {
      await contentDiscoveryService.updateContentInteraction(user.uid, contentId, interactionType)
      // Refresh recommendations if needed
      if (interactionType === 'like' || interactionType === 'bookmark') {
        const newRecs = await contentDiscoveryService.generatePersonalizedRecommendations(user.uid, 8)
        setRecommendations(newRecs)
      }
    } catch (error) {
      console.error('Error updating content interaction:', error)
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cultural Learning Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Learning Progress</h3>
        <div className="space-y-4">
          {dashboardData && Object.entries(dashboardData.culturalLearningProgress).slice(0, 3).map(([culture, progress]) => (
            <div key={culture} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">{culture}</span>
                <span className="text-gray-600">{progress.level}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${progress.level}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {progress.completedPaths.length} paths completed • {progress.achievements.length} achievements
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bridge Building Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bridge Building Impact</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cross-Cultural Connections</span>
            <span className="text-lg font-semibold text-orange-600">
              {dashboardData?.bridgeBuildingMetrics.crossCulturalConnections || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cultural Bridge Score</span>
            <span className="text-lg font-semibold text-green-600">
              {dashboardData?.bridgeBuildingMetrics.culturalBridgeScore || 0}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Community Contributions</span>
            <span className="text-lg font-semibold text-blue-600">
              {dashboardData?.bridgeBuildingMetrics.communityContributions || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Mentorships</span>
            <span className="text-lg font-semibold text-purple-600">
              {dashboardData?.bridgeBuildingMetrics.mentorshipParticipation || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setActiveSection('recommendations')}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            View Recommendations
          </button>
          <button 
            onClick={() => setActiveSection('trending')}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Explore Trending
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Share Content
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Find Mentors
          </button>
        </div>
      </div>
    </div>
  )

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
        <button 
          onClick={loadDashboardData}
          className="px-4 py-2 text-sm text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {rec.contentType.charAt(0).toUpperCase() + rec.contentType.slice(1)} Content
                </h4>
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                  {rec.recommendationType.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  {rec.score}% Match
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Why recommended:</strong> {rec.reasoning.primaryFactors.join(', ')}
              </div>
              {rec.reasoning.culturalRelevance.length > 0 && (
                <div className="text-sm text-gray-600">
                  <strong>Cultural relevance:</strong> {rec.reasoning.culturalRelevance.join(', ')}
                </div>
              )}
              {rec.reasoning.learningOpportunities.length > 0 && (
                <div className="text-sm text-gray-600">
                  <strong>Learning opportunities:</strong> {rec.reasoning.learningOpportunities.join(', ')}
                </div>
              )}
            </div>

            {rec.culturalSensitivity.requiresContext && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-xs font-medium text-yellow-800 mb-1">Cultural Context Required</div>
                <div className="text-xs text-yellow-700">
                  {rec.culturalSensitivity.respectfulApproach.join(', ')}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleContentInteraction(rec.contentId, 'view')
                  onContentSelect?.(rec.contentId, rec.contentType)
                }}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Explore
              </button>
              <button
                onClick={() => handleContentInteraction(rec.contentId, 'bookmark')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTrending = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Trending Cultural Topics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingTopics.map(topic => (
          <div key={topic.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                +{topic.trendMetrics.growthRate}%
              </span>
            </div>

            {topic.culturalGroup && (
              <div className="text-sm text-orange-600 mb-2 capitalize">
                {topic.culturalGroup} Culture
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              {topic.content.culturalContext}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{topic.engagement.views} views</span>
              <span>{topic.engagement.interactions} interactions</span>
              <span>{topic.engagement.shares} shares</span>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                Explore Topic
              </button>
              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProgress = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Learning Progress & Goals</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Goals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">This Week's Goals</h4>
          <div className="space-y-3">
            {dashboardData?.recommendations.weeklyGoals.map((goal, index) => (
              <div key={index} className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-gray-700">{goal}</span>
              </div>
            )) || (
              <div className="text-sm text-gray-500">No goals set for this week</div>
            )}
          </div>
        </div>

        {/* Cultural Challenges */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Cultural Challenges</h4>
          <div className="space-y-3">
            {dashboardData?.recommendations.culturalChallenges.map((challenge, index) => (
              <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm text-orange-800">{challenge}</div>
              </div>
            )) || (
              <div className="text-sm text-gray-500">No active challenges</div>
            )}
          </div>
        </div>
      </div>

      {/* Content Interactions Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Your Activity Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.contentInteractions.viewedContent.length || 0}
            </div>
            <div className="text-sm text-gray-600">Content Viewed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.contentInteractions.likedContent.length || 0}
            </div>
            <div className="text-sm text-gray-600">Content Liked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData?.contentInteractions.sharedContent.length || 0}
            </div>
            <div className="text-sm text-gray-600">Content Shared</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {dashboardData?.contentInteractions.createdContent.length || 0}
            </div>
            <div className="text-sm text-gray-600">Content Created</div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cultural Learning Dashboard</h1>
        <p className="text-gray-600">
          Track your progress, discover new content, and build bridges across cultures.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'recommendations', label: 'For You', icon: '🎯' },
            { id: 'trending', label: 'Trending', icon: '🔥' },
            { id: 'progress', label: 'Progress', icon: '📈' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'recommendations' && renderRecommendations()}
      {activeSection === 'trending' && renderTrending()}
      {activeSection === 'progress' && renderProgress()}
    </div>
  )
}

export default PersonalizedDashboard
