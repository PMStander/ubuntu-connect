import React, { useState, useEffect } from 'react';
import {
  Achievement,
  AchievementFilters,
  TimelineEvent
} from '../types/achievement';
import { achievementGalleryService } from '../services/achievementGalleryService';

interface AchievementGalleryProps {
  userId: string;
}

const AchievementGallery: React.FC<AchievementGalleryProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [featuredAchievements, setFeaturedAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filters, setFilters] = useState<AchievementFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'gallery' | 'timeline' | 'featured' | 'suggestions'>('gallery');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [suggestions, setSuggestions] = useState<Achievement[]>([]);

  const categories = [
    { value: 'sports', label: 'Sports & Athletics' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'business', label: 'Business & Innovation' },
    { value: 'education', label: 'Education & Learning' },
    { value: 'innovation', label: 'Innovation & Technology' },
    { value: 'community_service', label: 'Community Service' }
  ];

  const cultures = [
    'Zulu', 'Xhosa', 'Afrikaans', 'English', 'Sotho', 'Tswana', 
    'Pedi', 'Venda', 'Tsonga', 'Ndebele', 'Swati'
  ];



  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
      performSearch();
    } else {
      loadAchievements();
    }
  }, [filters, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [featured, userSuggestions] = await Promise.all([
        achievementGalleryService.getFeaturedAchievements(),
        achievementGalleryService.getAchievementSuggestions(userId)
      ]);
      
      setFeaturedAchievements(featured);
      setSuggestions(userSuggestions);
      
      await loadAchievements();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const results = await achievementGalleryService.getAchievements(filters);
      setAchievements(results);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      await loadAchievements();
      return;
    }

    try {
      const searchResults = await achievementGalleryService.searchAchievements({
        searchText: searchQuery,
        filters,
        limit: 20
      });
      setAchievements(searchResults);
    } catch (error) {
      console.error('Error searching achievements:', error);
    }
  };

  const loadTimeline = async () => {
    try {
      const timeRange = {
        startDate: new Date(1900, 0, 1),
        endDate: new Date()
      };
      const timeline = await achievementGalleryService.getAchievementTimeline(timeRange);
      setTimelineEvents(timeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const handleAchievementClick = async (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    
    // Track view
    await achievementGalleryService.trackAchievementView(achievement.id, userId);
    
    // Update engagement metrics
    const updatedAchievements = achievements.map(a => 
      a.id === achievement.id 
        ? { ...a, engagementMetrics: { ...a.engagementMetrics, views: a.engagementMetrics.views + 1 } }
        : a
    );
    setAchievements(updatedAchievements);
  };

  const handleShare = async (achievement: Achievement, platform: string) => {
    await achievementGalleryService.trackSocialSharing(achievement.id, platform);
    
    // In a real implementation, this would open sharing dialog
    console.log(`Sharing ${achievement.title} on ${platform}`);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const renderAchievementCard = (achievement: Achievement) => (
    <div 
      key={achievement.id}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => handleAchievementClick(achievement)}
    >
      {achievement.mediaContent[0] && (
        <div className="h-48 bg-gray-200 relative">
          <img 
            src={achievement.mediaContent[0].url} 
            alt={achievement.mediaContent[0].caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs text-white ${
              achievement.verification.status === 'verified' ? 'bg-green-500' :
              achievement.verification.status === 'pending' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}>
              {achievement.verification.status}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{achievement.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{achievement.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {achievement.category.primary}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
            {achievement.culturalContext.primaryCulture}
          </span>
          {achievement.category.crossCultural && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Cross-Cultural
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{achievement.location.city}, {achievement.location.province}</span>
          <span>{achievement.timeframe.startDate.getFullYear()}</span>
        </div>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              {achievement.engagementMetrics.views}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
              </svg>
              {achievement.engagementMetrics.shares}
            </span>
          </div>
          
          <div className="flex space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleShare(achievement, 'facebook');
              }}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd"/>
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleShare(achievement, 'twitter');
              }}
              className="p-1 text-gray-400 hover:text-blue-400"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        
        <select
          value={filters.culturalContext || ''}
          onChange={(e) => handleFilterChange('culturalContext', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cultures</option>
          {cultures.map(culture => (
            <option key={culture} value={culture}>{culture}</option>
          ))}
        </select>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.crossCultural || false}
            onChange={(e) => handleFilterChange('crossCultural', e.target.checked || undefined)}
            className="mr-2"
          />
          <span className="text-sm">Cross-Cultural Only</span>
        </label>
        
        {(Object.keys(filters).length > 0 || searchQuery) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-6">Achievement Timeline</h3>
      <div className="space-y-6">
        {timelineEvents.map((event) => (
          <div key={event.id} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">{event.date.getFullYear()}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{event.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {event.culturalContext}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {event.category}
                </span>
                {event.crossCultural && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Cross-Cultural
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderViewTabs = () => (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
      {[
        { key: 'gallery', label: 'Gallery', icon: '🖼️' },
        { key: 'featured', label: 'Featured', icon: '⭐' },
        { key: 'suggestions', label: 'For You', icon: '💡' },
        { key: 'timeline', label: 'Timeline', icon: '📅' }
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => {
            setActiveView(tab.key as any);
            if (tab.key === 'timeline') loadTimeline();
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeView === tab.key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">South African Achievement Gallery</h1>
        <p className="text-gray-600">
          Discover and celebrate the remarkable achievements of South Africans across all cultures and communities
        </p>
      </div>

      {renderViewTabs()}
      
      {activeView !== 'timeline' && renderFilters()}

      {activeView === 'gallery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(renderAchievementCard)}
        </div>
      )}

      {activeView === 'featured' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Featured Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAchievements.map(renderAchievementCard)}
          </div>
        </div>
      )}

      {activeView === 'suggestions' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Recommended for You</h2>
          <p className="text-gray-600 mb-6">
            Discover achievements from different cultures to broaden your perspective and inspire cross-cultural understanding
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map(renderAchievementCard)}
          </div>
        </div>
      )}

      {activeView === 'timeline' && renderTimeline()}

      {achievements.length === 0 && activeView === 'gallery' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAchievement.title}</h2>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedAchievement.mediaContent[0] && (
                <img 
                  src={selectedAchievement.mediaContent[0].url}
                  alt={selectedAchievement.mediaContent[0].caption}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              
              <p className="text-gray-700 mb-6">{selectedAchievement.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Cultural Context</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedAchievement.culturalContext.culturalSignificance}</p>
                  
                  <h3 className="font-semibold mb-2">Location & Time</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAchievement.location.city}, {selectedAchievement.location.province}<br/>
                    {selectedAchievement.timeframe.startDate.getFullYear()} - {selectedAchievement.timeframe.endDate.getFullYear()}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Impact & Significance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cultural Impact:</span>
                      <span className="font-medium">{selectedAchievement.culturalSignificance.preservationValue}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Educational Value:</span>
                      <span className="font-medium">{selectedAchievement.culturalSignificance.educationalValue}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inspirational Value:</span>
                      <span className="font-medium">{selectedAchievement.socialImpact.inspirationalValue}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementGallery;
