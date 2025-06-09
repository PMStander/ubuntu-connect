import React, { useState } from 'react'
import CulturalContentCreator from '../features/cultural-heritage/components/CulturalContentCreator'
import SkillSharingMarketplace from '../features/knowledge-sharing/components/SkillSharingMarketplace'
import PersonalizedDashboard from '../features/content-discovery/components/PersonalizedDashboard'

type ActiveView = 'dashboard' | 'heritage' | 'knowledge' | 'discovery'

export const CulturalKnowledgePage: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [showContentCreator, setShowContentCreator] = useState(false)

  const handleContentCreated = (contentId: string) => {
    setShowContentCreator(false)
    // Show success message or redirect to content view
    alert(`Cultural content created successfully! ID: ${contentId}`)
  }

  const handleMentorshipRequest = (matchId: string) => {
    // Handle mentorship connection request
    alert(`Mentorship request sent! Match ID: ${matchId}`)
  }

  const handleContentSelect = (contentId: string, contentType: string) => {
    // Handle content selection from recommendations
    console.log(`Selected content: ${contentId} of type: ${contentType}`)
  }

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Your personalized learning hub' },
            { id: 'heritage', label: 'Heritage', icon: '🏛️', description: 'Document & preserve culture' },
            { id: 'knowledge', label: 'Knowledge', icon: '🤝', description: 'Share & learn skills' },
            { id: 'discovery', label: 'Discovery', icon: '🔍', description: 'Explore cultural content' },
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

  const renderHeritage = () => (
    <div className="max-w-6xl mx-auto p-6">
      {!showContentCreator ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Cultural Heritage Documentation</h1>
            <p className="text-lg text-gray-600 mb-8">
              Preserve and share South African cultural heritage for future generations
            </p>
            <button
              onClick={() => setShowContentCreator(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Share Your Heritage
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Oral Traditions</h3>
              <p className="text-gray-600 mb-4">
                Record and preserve traditional stories, folklore, and oral histories with audio and video support.
              </p>
              <button className="text-orange-600 hover:text-orange-800 font-medium">
                Start Recording →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-4">🏺</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Artifacts</h3>
              <p className="text-gray-600 mb-4">
                Document traditional objects, tools, and artifacts with detailed metadata and provenance.
              </p>
              <button className="text-orange-600 hover:text-orange-800 font-medium">
                Document Artifact →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-4">🎭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Traditions & Customs</h3>
              <p className="text-gray-600 mb-4">
                Share traditional practices, ceremonies, and cultural customs with proper context.
              </p>
              <button className="text-orange-600 hover:text-orange-800 font-medium">
                Share Tradition →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-4">🍲</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Traditional Recipes</h3>
              <p className="text-gray-600 mb-4">
                Preserve family recipes and traditional cooking methods with cultural significance.
              </p>
              <button className="text-orange-600 hover:text-orange-800 font-medium">
                Share Recipe →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Music & Dance</h3>
              <p className="text-gray-600 mb-4">
                Record traditional music, songs, and dance performances with cultural context.
              </p>
              <button className="text-orange-600 hover:text-orange-800 font-medium">
                Record Performance →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-4">🗣️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Languages & Dialects</h3>
              <p className="text-gray-600 mb-4">
                Preserve linguistic heritage including dialects, phrases, and language variations.
              </p>
              <button className="text-orange-600 hover:text-orange-800 font-medium">
                Document Language →
              </button>
            </div>
          </div>

          {/* Cultural Sensitivity Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-3">Cultural Sensitivity & Ubuntu Philosophy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-700">
              <div>
                <h4 className="font-medium mb-2">Respectful Documentation</h4>
                <ul className="space-y-1">
                  <li>• Ensure you have permission to share cultural content</li>
                  <li>• Respect sacred and sensitive information</li>
                  <li>• Provide accurate cultural context</li>
                  <li>• Honor traditional knowledge holders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Community Validation</h4>
                <ul className="space-y-1">
                  <li>• Content reviewed by cultural representatives</li>
                  <li>• Community endorsement for accuracy</li>
                  <li>• Protection of sacred content</li>
                  <li>• Collaborative preservation efforts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CulturalContentCreator
          onContentCreated={handleContentCreated}
          onCancel={() => setShowContentCreator(false)}
        />
      )}
    </div>
  )

  const renderKnowledge = () => (
    <SkillSharingMarketplace onMentorshipRequest={handleMentorshipRequest} />
  )

  const renderDiscovery = () => (
    <PersonalizedDashboard onContentSelect={handleContentSelect} />
  )

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cultural Knowledge & Heritage Hub</h1>
        <p className="text-gray-600">
          Discover, share, and preserve South African cultural heritage through collaborative learning and Ubuntu philosophy.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">1,247</div>
          <div className="text-sm text-gray-600">Heritage Items</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">856</div>
          <div className="text-sm text-gray-600">Active Mentors</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">2,134</div>
          <div className="text-sm text-gray-600">Learning Paths</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">3,421</div>
          <div className="text-sm text-gray-600">Cultural Bridges</div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveView('heritage')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <div className="text-3xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold mb-2">Cultural Heritage</h3>
          <p className="text-orange-100 mb-4">
            Document and preserve traditional stories, artifacts, and cultural practices for future generations.
          </p>
          <div className="flex items-center text-orange-100">
            <span>Explore Heritage →</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveView('knowledge')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <div className="text-3xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">Knowledge Sharing</h3>
          <p className="text-blue-100 mb-4">
            Connect with mentors and learners across cultures to share skills and build meaningful relationships.
          </p>
          <div className="flex items-center text-blue-100">
            <span>Start Learning →</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveView('discovery')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
        >
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Content Discovery</h3>
          <p className="text-green-100 mb-4">
            Discover personalized cultural content and trending topics that match your interests and learning goals.
          </p>
          <div className="flex items-center text-green-100">
            <span>Discover Content →</span>
          </div>
        </div>
      </div>

      {/* Ubuntu Philosophy Section */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">🤲</div>
          <h3 className="text-lg font-semibold text-orange-800">Ubuntu Philosophy: "I am because we are"</h3>
        </div>
        <p className="text-orange-700 mb-4">
          Our platform embodies the Ubuntu philosophy, recognizing that our individual growth and cultural understanding 
          are deeply connected to our community's collective wisdom and shared experiences.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Mutual Learning</h4>
            <p className="text-orange-700">Every interaction is an opportunity for both teaching and learning.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Cultural Respect</h4>
            <p className="text-orange-700">Honor and celebrate the diversity of South African cultures.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Community Building</h4>
            <p className="text-orange-700">Strengthen bonds across cultural boundaries through shared knowledge.</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      
      <main>
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'heritage' && renderHeritage()}
        {activeView === 'knowledge' && renderKnowledge()}
        {activeView === 'discovery' && renderDiscovery()}
      </main>
    </div>
  )
}

export default CulturalKnowledgePage
