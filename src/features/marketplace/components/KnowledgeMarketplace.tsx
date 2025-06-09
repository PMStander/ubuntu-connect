import React, { useState, useEffect } from 'react'
import { marketplaceService, MarketplaceListing, KnowledgeExchange } from '../../../services/marketplaceService'
import { timeBankingService, TimeBankAccount } from '../../../services/timeBankingService'
import { useAuth } from '../../auth/hooks/useAuth'

interface KnowledgeMarketplaceProps {
  onNavigateToTimeBank?: () => void
  onNavigateToSkillSharing?: () => void
}

export const KnowledgeMarketplace: React.FC<KnowledgeMarketplaceProps> = ({
  onNavigateToTimeBank,
  onNavigateToSkillSharing,
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'browse' | 'my_listings' | 'exchanges' | 'create'>('browse')
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([])
  const [exchanges, setExchanges] = useState<KnowledgeExchange[]>([])
  const [timeBankAccount, setTimeBankAccount] = useState<TimeBankAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCulture, setSelectedCulture] = useState('')

  const categories = [
    'Technology', 'Business', 'Arts & Crafts', 'Languages', 'Cooking',
    'Music', 'Traditional Skills', 'Agriculture', 'Healthcare', 'Education'
  ]

  const cultures = [
    'zulu', 'xhosa', 'afrikaans', 'english', 'sotho', 'tswana',
    'tsonga', 'swati', 'venda', 'ndebele', 'coloured'
  ]

  useEffect(() => {
    if (user) {
      loadMarketplaceData()
    }
  }, [user])

  const loadMarketplaceData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [allListings, userListings, userExchanges, timeAccount] = await Promise.all([
        marketplaceService.searchMarketplaceListings({}, 20),
        marketplaceService.getUserMarketplaceListings(user.uid),
        marketplaceService.getUserKnowledgeExchanges(user.uid),
        timeBankingService.getTimeBankAccount(user.uid),
      ])

      setListings(allListings)
      setMyListings(userListings)
      setExchanges(userExchanges)
      setTimeBankAccount(timeAccount)
    } catch (error) {
      console.error('Error loading marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const searchResults = await marketplaceService.searchMarketplaceListings({
        query: searchQuery,
        category: selectedCategory,
        culturalContext: selectedCulture,
      })
      setListings(searchResults)
    } catch (error) {
      console.error('Error searching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInitiateExchange = async (listingId: string) => {
    if (!user) return

    try {
      const proposalMessage = "I'm interested in this knowledge exchange opportunity. Let's discuss the details!"
      
      const exchangeId = await marketplaceService.initiateKnowledgeExchange(
        listingId,
        user.uid,
        proposalMessage,
        {
          learningObjectives: ['Gain practical skills', 'Cultural understanding'],
          compensationTerms: {
            type: 'time_credits',
            amount: 0, // Will be negotiated
            schedule: 'per_session',
          },
        }
      )

      alert(`Exchange request sent! Exchange ID: ${exchangeId}`)
      loadMarketplaceData() // Refresh data
    } catch (error) {
      console.error('Error initiating exchange:', error)
      alert('Failed to initiate exchange. Please try again.')
    }
  }

  const renderBrowse = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search skills, knowledge, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={selectedCulture}
            onChange={(e) => setSelectedCulture(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Cultures</option>
            {cultures.map(culture => (
              <option key={culture} value={culture} className="capitalize">{culture}</option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Knowledge Exchanges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 6).map(listing => (
            <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    listing.listingType === 'skill_offering' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {listing.listingType === 'skill_offering' ? 'Offering' : 'Seeking'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-orange-600">
                    {listing.pricing.baseRate} credits/hour
                  </div>
                  <div className="text-xs text-gray-500">
                    {listing.views} views
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {listing.description}
              </p>

              {listing.culturalContext.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {listing.culturalContext.map(context => (
                    <span key={context.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {context.culture}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {listing.responses} responses
                </div>
                <button
                  onClick={() => handleInitiateExchange(listing.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
          <div className="text-sm text-gray-600">Active Listings</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {listings.filter(l => l.listingType === 'skill_offering').length}
          </div>
          <div className="text-sm text-gray-600">Skills Available</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(listings.flatMap(l => l.culturalContext.map(c => c.culture))).size}
          </div>
          <div className="text-sm text-gray-600">Cultures Represented</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {timeBankAccount?.balance || 0}
          </div>
          <div className="text-sm text-gray-600">Your Credits</div>
        </div>
      </div>
    </div>
  )

  const renderMyListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Marketplace Listings</h3>
        <button
          onClick={() => setActiveTab('create')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Create New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myListings.map(listing => (
          <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{listing.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  listing.status === 'active' ? 'bg-green-100 text-green-800' :
                  listing.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-orange-600">
                  {listing.pricing.baseRate} credits/hour
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{listing.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-500">Views:</span>
                <span className="text-sm font-medium text-gray-900 ml-1">{listing.views}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Responses:</span>
                <span className="text-sm font-medium text-gray-900 ml-1">{listing.responses}</span>
              </div>
            </div>

            {listing.culturalContext.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {listing.culturalContext.map(context => (
                  <span key={context.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {context.culture}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                View Responses
              </button>
            </div>
          </div>
        ))}

        {myListings.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first marketplace listing to start sharing your knowledge or find what you need to learn.
            </p>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Create Your First Listing
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderExchanges = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Your Knowledge Exchanges</h3>

      <div className="space-y-4">
        {exchanges.map(exchange => (
          <div key={exchange.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {exchange.skillId} Exchange
                </h4>
                <p className="text-sm text-gray-600">
                  {exchange.requesterId === user?.uid ? 'You are learning' : 'You are teaching'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                exchange.status === 'active' || exchange.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                exchange.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                exchange.status === 'proposed' || exchange.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {exchange.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="text-sm text-gray-600 ml-1 capitalize">
                  {exchange.exchangeType.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Start Date:</span>
                <span className="text-sm text-gray-600 ml-1">
                  {new Date(exchange.startDate.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Expected End:</span>
                <span className="text-sm text-gray-600 ml-1">
                  {new Date(exchange.expectedEndDate.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            {exchange.culturalElements.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Cultural Elements:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exchange.culturalElements.map(element => (
                    <span key={element.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {element.culture}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                View Details
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                Messages
              </button>
              {exchange.status === 'proposed' && exchange.providerId === user?.uid && (
                <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                  Accept
                </button>
              )}
            </div>
          </div>
        ))}

        {exchanges.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exchanges yet</h3>
            <p className="text-gray-600 mb-4">
              Start connecting with others to begin your knowledge exchange journey.
            </p>
            <button
              onClick={() => setActiveTab('browse')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderCreate = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Marketplace Listing</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="listingType" value="skill_offering" className="mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Offering Skills</div>
                  <div className="text-sm text-gray-600">Share your expertise</div>
                </div>
              </label>
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="listingType" value="skill_request" className="mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Seeking Skills</div>
                  <div className="text-sm text-gray-600">Find what you need to learn</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Expert Zulu Language Tutoring with Cultural Context"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what you're offering or seeking, including cultural context and learning approach..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Context
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select culture (optional)</option>
                {cultures.map(culture => (
                  <option key={culture} value={culture} className="capitalize">{culture}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate (Time Credits per Hour)
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15"
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Cultural Sensitivity Guidelines</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Ensure respectful representation of cultural knowledge</li>
              <li>• Provide proper cultural context and significance</li>
              <li>• Respect traditional knowledge and intellectual property</li>
              <li>• Follow Ubuntu principles of mutual respect and benefit</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('browse')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Create Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Exchange Marketplace</h1>
        <p className="text-gray-600">
          Discover, share, and exchange knowledge across cultures with fair time-based compensation.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'browse', label: 'Browse', icon: '🔍' },
            { id: 'my_listings', label: 'My Listings', icon: '📝' },
            { id: 'exchanges', label: 'Exchanges', icon: '🤝' },
            { id: 'create', label: 'Create', icon: '➕' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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
      {activeTab === 'browse' && renderBrowse()}
      {activeTab === 'my_listings' && renderMyListings()}
      {activeTab === 'exchanges' && renderExchanges()}
      {activeTab === 'create' && renderCreate()}
    </div>
  )
}

export default KnowledgeMarketplace
