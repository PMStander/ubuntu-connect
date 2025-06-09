import React, { useState, useEffect } from 'react'
import { knowledgeSharingService, SkillProfile, MentorshipMatch } from '../../../services/knowledgeSharingService'
import { useAuth } from '../../auth/hooks/useAuth'

interface SkillSharingMarketplaceProps {
  onMentorshipRequest?: (matchId: string) => void
}

export const SkillSharingMarketplace: React.FC<SkillSharingMarketplaceProps> = ({
  onMentorshipRequest,
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'browse' | 'mentor' | 'learn'>('browse')
  const [skillProfiles, setSkillProfiles] = useState<SkillProfile[]>([])
  const [mentorshipMatches, setMentorshipMatches] = useState<MentorshipMatch[]>([])
  const [selectedSkill, setSelectedSkill] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const skillCategories = [
    'Technology', 'Business', 'Arts & Crafts', 'Languages', 'Cooking',
    'Music', 'Traditional Skills', 'Agriculture', 'Healthcare', 'Education'
  ]

  const culturalSkills = [
    'Traditional Beadwork', 'Pottery Making', 'Traditional Cooking',
    'Storytelling', 'Traditional Music', 'Dance', 'Language Teaching',
    'Cultural History', 'Traditional Medicine Knowledge', 'Craft Making'
  ]

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load user's skill profile
      const profile = await knowledgeSharingService.getSkillProfile(user.uid)
      if (profile) {
        // Load mentorship matches for user's skills
        const skills = Object.keys(profile.skills)
        if (skills.length > 0) {
          const matches = await knowledgeSharingService.findMentorshipMatches(
            user.uid,
            skills[0],
            'mentor'
          )
          setMentorshipMatches(matches)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkillSearch = async (skill: string, role: 'mentor' | 'mentee') => {
    if (!user || !skill) return

    setLoading(true)
    try {
      const matches = await knowledgeSharingService.findMentorshipMatches(
        user.uid,
        skill,
        role
      )
      setMentorshipMatches(matches)
    } catch (error) {
      console.error('Error searching for mentorship matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderBrowseTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search skills, cultural knowledge, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Skills</option>
          {skillCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured Cultural Skills */}
        <div className="col-span-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Cultural Skills</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {culturalSkills.map(skill => (
              <button
                key={skill}
                onClick={() => handleSkillSearch(skill, 'mentee')}
                className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 hover:bg-orange-100 transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Mentorship Matches */}
        {mentorshipMatches.map(match => (
          <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{match.skillArea}</h4>
                {match.culturalContext && (
                  <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 inline-block">
                    {match.culturalContext} Cultural Context
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  {match.matchScore}% Match
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Goals:</strong> {match.goals.skillGoals.join(', ') || 'Not specified'}
              </div>
              {match.goals.culturalLearningGoals.length > 0 && (
                <div className="text-sm text-gray-600">
                  <strong>Cultural Learning:</strong> {match.goals.culturalLearningGoals.join(', ')}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <strong>Communication:</strong> {match.communication.preferredMethod} • {match.communication.frequency}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onMentorshipRequest?.(match.id)}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Connect
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMentorTab = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-2">Share Your Knowledge</h3>
        <p className="text-orange-700 mb-4">
          Embody Ubuntu philosophy by sharing your skills and cultural knowledge with others. 
          Help build bridges across communities through mentorship.
        </p>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          Set Up Mentor Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Skills You Can Teach</h4>
          <div className="space-y-2">
            {skillCategories.slice(0, 5).map(skill => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill}</span>
                <button
                  onClick={() => handleSkillSearch(skill, 'mentor')}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  Find Learners
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Cultural Knowledge</h4>
          <div className="space-y-2">
            {culturalSkills.slice(0, 5).map(skill => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill}</span>
                <button
                  onClick={() => handleSkillSearch(skill, 'mentor')}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  Share Knowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Mentorships */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Active Mentorships</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentorshipMatches.filter(m => m.status === 'active').map(match => (
            <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{match.skillArea}</h4>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Progress: {match.progress.skillProgress}% • {match.progress.sessionsCompleted} sessions
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
                  Schedule Session
                </button>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                  View Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLearnTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Learn & Grow</h3>
        <p className="text-blue-700 mb-4">
          Discover new skills and deepen your cultural understanding through mentorship 
          and collaborative learning experiences.
        </p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Set Learning Goals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Skills to Learn</h4>
          <div className="space-y-2">
            {skillCategories.map(skill => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill}</span>
                <button
                  onClick={() => handleSkillSearch(skill, 'mentee')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Find Mentors
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Cultural Learning</h4>
          <div className="space-y-2">
            {culturalSkills.map(skill => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill}</span>
                <button
                  onClick={() => handleSkillSearch(skill, 'mentee')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentorshipMatches.filter(m => m.status === 'active').map(match => (
            <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{match.skillArea}</h4>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Learning
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{match.progress.skillProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${match.progress.skillProgress}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {match.progress.sessionsCompleted} sessions completed
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                  Continue Learning
                </button>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Sharing Marketplace</h1>
        <p className="text-gray-600">
          Connect, learn, and share knowledge across cultural boundaries. Embrace Ubuntu: "I am because we are."
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'browse', label: 'Browse Skills', icon: '🔍' },
            { id: 'mentor', label: 'Mentor Others', icon: '🎓' },
            { id: 'learn', label: 'Learn & Grow', icon: '📚' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
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
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'browse' && renderBrowseTab()}
          {activeTab === 'mentor' && renderMentorTab()}
          {activeTab === 'learn' && renderLearnTab()}
        </>
      )}
    </div>
  )
}

export default SkillSharingMarketplace
