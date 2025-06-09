import React, { useState, useEffect } from 'react'
import { skillSharingService, SkillProfile, MentorshipMatch, LearningSession } from '../../../services/skillSharingService'
import { mentorshipMatchingEngine } from '../../../services/mentorshipMatchingEngine'
import { timeBankingService, TimeBankAccount } from '../../../services/timeBankingService'
import { useAuth } from '../../auth/hooks/useAuth'

interface SkillSharingDashboardProps {
  onNavigateToMarketplace?: () => void
  onNavigateToTimeBank?: () => void
}

export const SkillSharingDashboard: React.FC<SkillSharingDashboardProps> = ({
  onNavigateToMarketplace,
  onNavigateToTimeBank,
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'mentoring' | 'learning' | 'sessions'>('overview')
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null)
  const [mentorshipMatches, setMentorshipMatches] = useState<MentorshipMatch[]>([])
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([])
  const [timeBankAccount, setTimeBankAccount] = useState<TimeBankAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [profile, mentorMatches, menteeMatches, timeAccount] = await Promise.all([
        skillSharingService.getSkillProfileByUserId(user.uid),
        skillSharingService.getUserMentorshipMatches(user.uid, 'mentor'),
        skillSharingService.getUserMentorshipMatches(user.uid, 'mentee'),
        timeBankingService.getTimeBankAccount(user.uid),
      ])

      setSkillProfile(profile)
      setMentorshipMatches([...mentorMatches, ...menteeMatches])
      setTimeBankAccount(timeAccount)

      // Load recent sessions
      if (mentorMatches.length > 0 || menteeMatches.length > 0) {
        const allMatches = [...mentorMatches, ...menteeMatches]
        const sessionPromises = allMatches.slice(0, 3).map(match =>
          skillSharingService.getLearningSessionsForMatch(match.id)
        )
        const sessionResults = await Promise.all(sessionPromises)
        const allSessions = sessionResults.flat().sort((a, b) => 
          b.scheduledAt.seconds - a.scheduledAt.seconds
        )
        setLearningSessions(allSessions.slice(0, 10))
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🎓</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {skillProfile?.skillsToTeach.length || 0}
              </div>
              <div className="text-sm text-gray-600">Skills Teaching</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📚</div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {skillProfile?.skillsToLearn.length || 0}
              </div>
              <div className="text-sm text-gray-600">Skills Learning</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤝</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {mentorshipMatches.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Mentorships</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⏰</div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {timeBankAccount?.balance || 0}
              </div>
              <div className="text-sm text-gray-600">Time Credits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Find a Mentor</h3>
          <p className="text-blue-100 mb-4">
            Connect with experienced mentors to accelerate your learning journey.
          </p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Browse Mentors
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Become a Mentor</h3>
          <p className="text-green-100 mb-4">
            Share your expertise and help others while earning time credits.
          </p>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
            Start Mentoring
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Explore Marketplace</h3>
          <p className="text-purple-100 mb-4">
            Discover knowledge exchange opportunities in the marketplace.
          </p>
          <button 
            onClick={onNavigateToMarketplace}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Visit Marketplace
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Learning Sessions</h3>
        <div className="space-y-4">
          {learningSessions.slice(0, 5).map(session => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Session
                </h4>
                <p className="text-sm text-gray-600">
                  {session.duration} minutes • {session.location}
                </p>
                <div className="flex items-center mt-1">
                  {session.culturalElements.map(element => (
                    <span key={element.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">
                      {element.culture}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  session.status === 'completed' ? 'text-green-600' :
                  session.status === 'scheduled' ? 'text-blue-600' :
                  session.status === 'in_progress' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {session.status.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(session.scheduledAt.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {learningSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No learning sessions yet</p>
              <p className="text-sm">Start a mentorship to schedule your first session!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMentoring = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Mentoring Activities</h3>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Update Teaching Profile
        </button>
      </div>

      {/* Teaching Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Skills You Teach</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillProfile?.skillsToTeach.map(skill => (
            <div key={skill.skillId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{skill.skillName}</h5>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  skill.proficiencyLevel === 'expert' || skill.proficiencyLevel === 'master' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {skill.proficiencyLevel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {skill.yearsOfExperience} years experience
              </p>
              {skill.culturalContext && skill.culturalContext.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {skill.culturalContext.map(context => (
                    <span key={context.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {context.culture}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {skill.timeCreditsPerHour} credits/hour
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </div>
            </div>
          )) || (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎓</div>
              <p>No teaching skills added yet</p>
              <button className="mt-2 text-blue-600 hover:text-blue-800">
                Add your first teaching skill
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Mentees */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Your Mentees</h4>
        <div className="space-y-4">
          {mentorshipMatches
            .filter(match => match.mentorId === user?.uid && match.status === 'active')
            .map(match => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {match.skillId} Mentorship
                    </h5>
                    <p className="text-sm text-gray-600">
                      Progress: {match.actualProgress.skillProgress}% • 
                      {match.actualProgress.sessionsCompleted} sessions completed
                    </p>
                    {match.culturalContext && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-1 inline-block">
                        {match.culturalContext} Cultural Context
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                      Schedule Session
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                      View Progress
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderLearning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Learning Journey</h3>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          Add Learning Goal
        </button>
      </div>

      {/* Learning Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Learning Goals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillProfile?.skillsToLearn.map(goal => (
            <div key={goal.skillId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{goal.skillName}</h5>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {goal.currentLevel} → {goal.targetLevel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{goal.motivation}</p>
              <div className="text-sm text-gray-600 mb-3">
                Time commitment: {goal.timeCommitment} hours/week
              </div>
              {goal.culturalPreferences && goal.culturalPreferences.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {goal.culturalPreferences.map(pref => (
                    <span key={pref.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {pref.culture} ({pref.interest}% interest)
                    </span>
                  ))}
                </div>
              )}
              <button className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                Find Mentor
              </button>
            </div>
          )) || (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p>No learning goals set yet</p>
              <button className="mt-2 text-green-600 hover:text-green-800">
                Set your first learning goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Mentorships */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Your Mentors</h4>
        <div className="space-y-4">
          {mentorshipMatches
            .filter(match => match.menteeId === user?.uid && match.status === 'active')
            .map(match => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {match.skillId} Learning
                    </h5>
                    <p className="text-sm text-gray-600">
                      Progress: {match.actualProgress.skillProgress}% • 
                      {match.actualProgress.sessionsCompleted} sessions completed
                    </p>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${match.actualProgress.skillProgress}%` }}
                        />
                      </div>
                    </div>
                    {match.culturalContext && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-2 inline-block">
                        {match.culturalContext} Cultural Learning
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                      Continue Learning
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Learning Sessions</h3>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          Schedule New Session
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {learningSessions.map(session => (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Session
                  </h4>
                  <p className="text-sm text-gray-600">
                    {new Date(session.scheduledAt.seconds * 1000).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  session.status === 'completed' ? 'bg-green-100 text-green-800' :
                  session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <span className="text-sm text-gray-600 ml-1">{session.duration} minutes</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Location:</span>
                  <span className="text-sm text-gray-600 ml-1">{session.location}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Credits:</span>
                  <span className="text-sm text-gray-600 ml-1">{session.timeCreditsAwarded || 0}</span>
                </div>
              </div>

              {session.learningObjectives.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Objectives:</span>
                  <ul className="text-sm text-gray-600 ml-4 mt-1">
                    {session.learningObjectives.map((objective, index) => (
                      <li key={index} className="list-disc">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {session.culturalElements.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {session.culturalElements.map(element => (
                    <span key={element.culture} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {element.culture} Culture
                    </span>
                  ))}
                </div>
              )}

              {session.status === 'completed' && session.feedback && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Session Rating:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`text-lg ${
                          star <= session.feedback.overallRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {learningSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No sessions scheduled yet</p>
              <p className="text-sm">Start a mentorship to schedule your first session!</p>
            </div>
          )}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Sharing & Mentorship</h1>
        <p className="text-gray-600">
          Connect, learn, and share knowledge across cultures with Ubuntu philosophy: "I am because we are."
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'mentoring', label: 'Mentoring', icon: '🎓' },
            { id: 'learning', label: 'Learning', icon: '📚' },
            { id: 'sessions', label: 'Sessions', icon: '📅' },
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'mentoring' && renderMentoring()}
      {activeTab === 'learning' && renderLearning()}
      {activeTab === 'sessions' && renderSessions()}
    </div>
  )
}

export default SkillSharingDashboard
