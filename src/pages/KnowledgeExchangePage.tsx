import React, { useState } from 'react'
import SkillSharingDashboard from '../features/skill-sharing/components/SkillSharingDashboard'
import KnowledgeMarketplace from '../features/marketplace/components/KnowledgeMarketplace'
import TimeBankingDashboard from '../features/time-banking/components/TimeBankingDashboard'

type ActiveView = 'overview' | 'skill_sharing' | 'marketplace' | 'time_banking'

export const KnowledgeExchangePage: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('overview')

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '🏠', description: 'Knowledge exchange hub overview' },
            { id: 'skill_sharing', label: 'Skill Sharing', icon: '🎓', description: 'Mentorship and skill development' },
            { id: 'marketplace', label: 'Marketplace', icon: '🛒', description: 'Knowledge exchange marketplace' },
            { id: 'time_banking', label: 'Time Banking', icon: '⏰', description: 'Fair exchange credit system' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as ActiveView)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeView === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )

  const renderOverview = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Knowledge Exchange & Mentorship Platform</h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect, learn, and share knowledge across cultures with fair time-based compensation and Ubuntu philosophy.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">2,847</div>
          <div className="text-sm text-gray-600">Active Mentorships</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">1,523</div>
          <div className="text-sm text-gray-600">Marketplace Listings</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">45,892</div>
          <div className="text-sm text-gray-600">Credits Exchanged</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">11</div>
          <div className="text-sm text-gray-600">Cultures Connected</div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setActiveView('skill_sharing')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <div className="text-3xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold mb-2">Cross-Cultural Skill Sharing</h3>
          <p className="text-blue-100 mb-4">
            Connect with mentors and mentees across cultures. Share expertise while learning about different traditions and approaches.
          </p>
          <div className="flex items-center text-blue-100">
            <span>Start Sharing →</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveView('marketplace')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
        >
          <div className="text-3xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2">Knowledge Exchange Marketplace</h3>
          <p className="text-green-100 mb-4">
            Discover knowledge exchange opportunities. Post what you can teach or find what you want to learn with fair compensation.
          </p>
          <div className="flex items-center text-green-100">
            <span>Explore Marketplace →</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveView('time_banking')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <div className="text-3xl mb-4">⏰</div>
          <h3 className="text-xl font-semibold mb-2">Time Banking & Fair Exchange</h3>
          <p className="text-orange-100 mb-4">
            Fair time-based credit system that values all knowledge equally. Earn credits by teaching, spend them learning.
          </p>
          <div className="flex items-center text-orange-100">
            <span>Manage Credits →</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Knowledge Exchange Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Create Profile</h3>
            <p className="text-sm text-gray-600">
              Set up your skill profile with what you can teach and want to learn, including cultural context.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Find Matches</h3>
            <p className="text-sm text-gray-600">
              Our algorithm finds optimal mentor-mentee matches based on skills, culture, and learning styles.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Exchange Knowledge</h3>
            <p className="text-sm text-gray-600">
              Engage in meaningful learning sessions with fair time credit compensation for all participants.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Build Bridges</h3>
            <p className="text-sm text-gray-600">
              Create lasting cross-cultural connections while contributing to community knowledge preservation.
            </p>
          </div>
        </div>
      </div>

      {/* Ubuntu Philosophy Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-8">
        <div className="flex items-center mb-6">
          <div className="text-3xl mr-4">🤲</div>
          <h2 className="text-2xl font-bold text-orange-800">Ubuntu Philosophy in Knowledge Exchange</h2>
        </div>
        <p className="text-orange-700 mb-6">
          Our knowledge exchange platform embodies Ubuntu: "I am because we are." Every exchange strengthens our collective wisdom 
          and creates bridges across cultural boundaries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3">🔄 Reciprocal Learning</h3>
            <p className="text-orange-700 text-sm">
              Every teaching moment is also a learning opportunity. Mentors gain cultural insights while sharing their expertise.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3">⚖️ Fair Value Exchange</h3>
            <p className="text-orange-700 text-sm">
              Time banking ensures all knowledge is valued equally, with cultural bonuses recognizing traditional wisdom.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3">🌍 Community Strengthening</h3>
            <p className="text-orange-700 text-sm">
              Each exchange contributes to community resilience and cross-cultural understanding in South Africa.
            </p>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl">👩‍💻</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Nomsa & James</h4>
                <p className="text-sm text-gray-600">Zulu Traditional Beadwork ↔ Web Development</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              "Through our exchange, I learned not just web development skills, but also the deep cultural significance 
              behind traditional Zulu patterns. James now incorporates these patterns into his digital designs!"
            </p>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">Cultural Bridge</span>
              <span>150 credits exchanged</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl">👨‍🍳</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Pieter & Thandiwe</h4>
                <p className="text-sm text-gray-600">Afrikaans Cooking ↔ Business Strategy</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              "Learning traditional Afrikaans recipes opened my eyes to the history and culture behind the food. 
              Thandiwe's business insights helped me start my own catering company celebrating diverse cuisines."
            </p>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Business Success</span>
              <span>200 credits exchanged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSkillSharing = () => (
    <SkillSharingDashboard 
      onNavigateToMarketplace={() => setActiveView('marketplace')}
      onNavigateToTimeBank={() => setActiveView('time_banking')}
    />
  )

  const renderMarketplace = () => (
    <KnowledgeMarketplace 
      onNavigateToTimeBank={() => setActiveView('time_banking')}
      onNavigateToSkillSharing={() => setActiveView('skill_sharing')}
    />
  )

  const renderTimeBanking = () => (
    <TimeBankingDashboard 
      onNavigateToMarketplace={() => setActiveView('marketplace')}
      onNavigateToSkillSharing={() => setActiveView('skill_sharing')}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      
      <main>
        {activeView === 'overview' && renderOverview()}
        {activeView === 'skill_sharing' && renderSkillSharing()}
        {activeView === 'marketplace' && renderMarketplace()}
        {activeView === 'time_banking' && renderTimeBanking()}
      </main>
    </div>
  )
}

export default KnowledgeExchangePage
