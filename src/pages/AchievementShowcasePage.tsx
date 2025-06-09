import React, { useState } from 'react';
import AchievementGallery from '../components/AchievementGallery';
import RecognitionDashboard from '../components/RecognitionDashboard';
import CulturalCurationDashboard from '../components/CulturalCurationDashboard';

interface AchievementShowcasePageProps {
  userId: string;
  userRole?: 'cultural_representative' | 'expert' | 'community_member';
}

const AchievementShowcasePage: React.FC<AchievementShowcasePageProps> = ({ 
  userId, 
  userRole = 'community_member' 
}) => {
  const [activeSection, setActiveSection] = useState<'gallery' | 'recognition' | 'curation'>('gallery');

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'gallery':
        return <AchievementGallery userId={userId} />;
      case 'recognition':
        return <RecognitionDashboard userId={userId} />;
      case 'curation':
        return <CulturalCurationDashboard userId={userId} userRole={userRole} />;
      default:
        return <AchievementGallery userId={userId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Achievement Showcase & Recognition</h1>
              <p className="text-gray-600 mt-1">
                Discover, celebrate, and preserve South African achievements across all cultures
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveSection('gallery')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'gallery'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setActiveSection('recognition')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'recognition'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Recognition
                </button>
                <button
                  onClick={() => setActiveSection('curation')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'curation'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Curation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Description */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {activeSection === 'gallery' && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">South African Achievement Gallery</h3>
                <p className="text-blue-700">
                  Explore a comprehensive collection of verified achievements from across South Africa's 
                  diverse cultural communities, celebrating excellence in sports, arts, business, education, and community service.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'recognition' && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Cross-Cultural Engagement Recognition</h3>
                <p className="text-blue-700">
                  Earn badges and recognition for meaningful cross-cultural engagement, community service, 
                  and bridge-building activities that strengthen Ubuntu connections across diverse communities.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'curation' && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Cultural Representative Achievement Curation</h3>
                <p className="text-blue-700">
                  Cultural representatives curate and validate achievements with community oversight, 
                  ensuring cultural accuracy, sensitivity, and appropriate preservation of traditional knowledge.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {renderSectionContent()}
      </div>

      {/* Ubuntu Philosophy Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Celebrating Excellence Through Ubuntu</h3>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our achievement showcase celebrates the principle that individual excellence 
              contributes to collective prosperity. By recognizing and preserving achievements 
              across all cultures, we honor the diverse talents that make South Africa strong 
              while building bridges of understanding and mutual respect.
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Discover & Celebrate</h4>
              <p className="text-gray-400 text-sm">
                Explore achievements from all South African cultures and communities
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Earn Recognition</h4>
              <p className="text-gray-400 text-sm">
                Build bridges between cultures and earn badges for meaningful engagement
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Preserve Heritage</h4>
              <p className="text-gray-400 text-sm">
                Ensure cultural accuracy and sensitivity in achievement documentation
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="text-center">
              <h4 className="font-medium mb-4">Recognition Categories</h4>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="px-3 py-1 bg-gray-800 rounded-full">🏆 Sports & Athletics</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">🎨 Arts & Culture</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">💼 Business & Innovation</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">📚 Education & Learning</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">🔬 Innovation & Technology</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">🤝 Community Service</span>
                <span className="px-3 py-1 bg-gray-800 rounded-full">🌍 Cross-Cultural Bridge Building</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementShowcasePage;
