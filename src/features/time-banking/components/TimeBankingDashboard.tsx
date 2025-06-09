import React, { useState, useEffect } from 'react'
import { timeBankingService, TimeBankAccount, TimeTransaction, FairExchangeMetrics } from '../../../services/timeBankingService'
import { useAuth } from '../../auth/hooks/useAuth'

interface TimeBankingDashboardProps {
  onNavigateToMarketplace?: () => void
  onNavigateToSkillSharing?: () => void
}

export const TimeBankingDashboard: React.FC<TimeBankingDashboardProps> = ({
  onNavigateToMarketplace,
  onNavigateToSkillSharing,
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'metrics' | 'disputes'>('overview')
  const [timeBankAccount, setTimeBankAccount] = useState<TimeBankAccount | null>(null)
  const [transactions, setTransactions] = useState<TimeTransaction[]>([])
  const [fairExchangeMetrics, setFairExchangeMetrics] = useState<FairExchangeMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTimeBankingData()
    }
  }, [user])

  const loadTimeBankingData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [account, transactionHistory, metrics] = await Promise.all([
        timeBankingService.getTimeBankAccount(user.uid),
        timeBankingService.getUserTransactionHistory(user.uid, 50),
        timeBankingService.calculateFairExchangeMetrics(user.uid),
      ])

      setTimeBankAccount(account)
      setTransactions(transactionHistory)
      setFairExchangeMetrics(metrics)
    } catch (error) {
      console.error('Error loading time banking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Account Balance Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Time Credit Balance</h3>
            <div className="text-3xl font-bold">{timeBankAccount?.balance || 0}</div>
            <p className="text-orange-100 mt-1">Credits available for exchanges</p>
          </div>
          <div className="text-right">
            <div className="text-orange-100 text-sm">Quality Multiplier</div>
            <div className="text-xl font-semibold">{timeBankAccount?.qualityMultiplier.toFixed(1) || '1.0'}x</div>
            <div className="text-orange-100 text-sm">Cultural Bonus</div>
            <div className="text-lg font-medium">{((timeBankAccount?.culturalBonusRate || 0) * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💰</div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {timeBankAccount?.totalEarned || 0}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💸</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {timeBankAccount?.totalSpent || 0}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⭐</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {timeBankAccount?.reputationScore || 0}
              </div>
              <div className="text-sm text-gray-600">Reputation Score</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🔒</div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {timeBankAccount?.totalReserved || 0}
              </div>
              <div className="text-sm text-gray-600">Reserved Credits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fair Exchange Metrics */}
      {fairExchangeMetrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fair Exchange Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {fairExchangeMetrics.overallFairnessScore}/100
              </div>
              <div className="text-sm text-gray-600">Overall Fairness</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${fairExchangeMetrics.overallFairnessScore}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {fairExchangeMetrics.culturalContribution}/100
              </div>
              <div className="text-sm text-gray-600">Cultural Contribution</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${fairExchangeMetrics.culturalContribution}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {fairExchangeMetrics.crossCulturalBridging}/100
              </div>
              <div className="text-sm text-gray-600">Cross-Cultural Bridging</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${fairExchangeMetrics.crossCulturalBridging}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${
                  transaction.type === 'earn' || transaction.type === 'bonus' ? 'text-green-600' :
                  transaction.type === 'spend' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {transaction.type === 'earn' || transaction.type === 'bonus' ? '💰' :
                   transaction.type === 'spend' ? '💸' : '⏰'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{transaction.description}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()}
                  </div>
                  {transaction.culturalContext && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-1 inline-block">
                      {transaction.culturalContext.primaryCulture}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  transaction.type === 'earn' || transaction.type === 'bonus' ? 'text-green-600' :
                  transaction.type === 'spend' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {transaction.type === 'earn' || transaction.type === 'bonus' ? '+' : 
                   transaction.type === 'spend' ? '-' : ''}
                  {transaction.amount}
                </div>
                <div className="text-xs text-gray-500">
                  {transaction.status}
                </div>
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No transactions yet</p>
              <p className="text-sm">Start participating in knowledge exchanges to see your transaction history!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl mb-3">🎓</div>
          <h4 className="font-semibold text-gray-900 mb-2">Earn Credits</h4>
          <p className="text-sm text-gray-600 mb-4">
            Share your skills and knowledge to earn time credits
          </p>
          <button 
            onClick={onNavigateToSkillSharing}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Teaching
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl mb-3">📚</div>
          <h4 className="font-semibold text-gray-900 mb-2">Spend Credits</h4>
          <p className="text-sm text-gray-600 mb-4">
            Use your credits to learn new skills and knowledge
          </p>
          <button 
            onClick={onNavigateToMarketplace}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Find Learning
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl mb-3">🤝</div>
          <h4 className="font-semibold text-gray-900 mb-2">Cultural Exchange</h4>
          <p className="text-sm text-gray-600 mb-4">
            Participate in cross-cultural exchanges for bonus credits
          </p>
          <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Explore Cultures
          </button>
        </div>
      </div>
    </div>
  )

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Types</option>
            <option value="earn">Earned</option>
            <option value="spend">Spent</option>
            <option value="bonus">Bonus</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cultural Context
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'earn' || transaction.type === 'bonus' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'spend' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={
                      transaction.type === 'earn' || transaction.type === 'bonus' ? 'text-green-600' :
                      transaction.type === 'spend' ? 'text-red-600' :
                      'text-gray-600'
                    }>
                      {transaction.type === 'earn' || transaction.type === 'bonus' ? '+' : 
                       transaction.type === 'spend' ? '-' : ''}
                      {transaction.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.culturalContext ? (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        {transaction.culturalContext.primaryCulture}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">
              Your transaction history will appear here as you participate in knowledge exchanges.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderMetrics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Fair Exchange Metrics</h3>

      {fairExchangeMetrics ? (
        <>
          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {fairExchangeMetrics.overallFairnessScore}/100
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Fairness Score</h4>
              <p className="text-gray-600">
                Your overall fairness in knowledge exchanges based on Ubuntu principles
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                  style={{ width: `${fairExchangeMetrics.overallFairnessScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Exchange Patterns</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Exchange Equity</span>
                    <span>{fairExchangeMetrics.exchangeEquity}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${fairExchangeMetrics.exchangeEquity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Knowledge Sharing</span>
                    <span>{fairExchangeMetrics.knowledgeSharing}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${fairExchangeMetrics.knowledgeSharing}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Learning Engagement</span>
                    <span>{fairExchangeMetrics.learningEngagement}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${fairExchangeMetrics.learningEngagement}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Cultural Impact</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cultural Contribution</span>
                    <span>{fairExchangeMetrics.culturalContribution}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${fairExchangeMetrics.culturalContribution}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cross-Cultural Bridging</span>
                    <span>{fairExchangeMetrics.crossCulturalBridging}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${fairExchangeMetrics.crossCulturalBridging}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Community Impact</span>
                    <span>{fairExchangeMetrics.communityImpact}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${fairExchangeMetrics.communityImpact}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-3">Improve Your Fairness Score</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h5 className="font-medium mb-2">Increase Cultural Contribution:</h5>
                <ul className="space-y-1">
                  <li>• Participate in cross-cultural exchanges</li>
                  <li>• Share traditional knowledge respectfully</li>
                  <li>• Engage with diverse cultural communities</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Enhance Exchange Equity:</h5>
                <ul className="space-y-1">
                  <li>• Balance teaching and learning activities</li>
                  <li>• Provide fair value in all exchanges</li>
                  <li>• Complete commitments reliably</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics available yet</h3>
          <p className="text-gray-600">
            Participate in knowledge exchanges to see your fairness metrics.
          </p>
        </div>
      )}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Banking Dashboard</h1>
        <p className="text-gray-600">
          Manage your time credits and track fair exchange metrics based on Ubuntu principles.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'transactions', label: 'Transactions', icon: '💰' },
            { id: 'metrics', label: 'Fairness Metrics', icon: '⚖️' },
            { id: 'disputes', label: 'Disputes', icon: '⚠️' },
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'metrics' && renderMetrics()}
      {activeTab === 'disputes' && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes</h3>
          <p className="text-gray-600">
            Great! You have no active disputes. Keep up the fair exchanges!
          </p>
        </div>
      )}
    </div>
  )
}

export default TimeBankingDashboard
