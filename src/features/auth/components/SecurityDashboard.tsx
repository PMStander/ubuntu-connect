import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { sessionManagementService } from '@/services/sessionManagementService'
import { twoFactorAuthService } from '@/features/auth/services/twoFactorAuthService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { clsx } from 'clsx'

interface SecurityDashboardProps {
  onSetup2FA: () => void
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  onSetup2FA,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const [twoFactorStatus, setTwoFactorStatus] = useState<any>(null)
  const [suspiciousActivity, setSuspiciousActivity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      loadSecurityData()
    }
  }, [user?.uid])

  const loadSecurityData = async () => {
    if (!user?.uid) return

    setIsLoading(true)
    try {
      const [sessions, twoFAStatus, suspiciousCheck] = await Promise.all([
        sessionManagementService.getActiveSessions(user.uid),
        twoFactorAuthService.getTwoFactorStatus(user.uid),
        sessionManagementService.detectSuspiciousActivity(user.uid),
      ])

      setActiveSessions(sessions)
      setTwoFactorStatus(twoFAStatus)
      setSuspiciousActivity(suspiciousCheck)
    } catch (error) {
      console.error('Error loading security data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    try {
      await sessionManagementService.endSession(sessionId)
      await loadSecurityData() // Refresh data
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const handleEndAllOtherSessions = async () => {
    if (!user?.uid) return

    try {
      const currentSessionId = 'current' // In real implementation, get current session ID
      await sessionManagementService.endAllOtherSessions(user.uid, currentSessionId)
      await loadSecurityData()
    } catch (error) {
      console.error('Error ending other sessions:', error)
    }
  }

  const getDeviceIcon = (deviceInfo: any) => {
    return deviceInfo.isMobile ? (
      <DevicePhoneMobileIcon className="w-5 h-5" />
    ) : (
      <ComputerDesktopIcon className="w-5 h-5" />
    )
  }

  const formatLastActivity = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-6 h-6 text-cultural-600" />
            <span>Security Overview</span>
          </CardTitle>
          <CardDescription>
            Monitor your account security and manage access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 2FA Status */}
            <div className={clsx(
              'p-4 rounded-lg border-2',
              twoFactorStatus?.isEnabled
                ? 'border-green-200 bg-green-50'
                : 'border-yellow-200 bg-yellow-50'
            )}>
              <div className="flex items-center space-x-2 mb-2">
                {twoFactorStatus?.isEnabled ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium">Two-Factor Authentication</span>
              </div>
              <p className={clsx(
                'text-sm',
                twoFactorStatus?.isEnabled ? 'text-green-700' : 'text-yellow-700'
              )}>
                {twoFactorStatus?.isEnabled ? 'Enabled' : 'Not enabled'}
              </p>
              {!twoFactorStatus?.isEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSetup2FA}
                  className="mt-2"
                >
                  Enable 2FA
                </Button>
              )}
            </div>

            {/* Active Sessions */}
            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Active Sessions</span>
              </div>
              <p className="text-sm text-blue-700">
                {activeSessions.length} active {activeSessions.length === 1 ? 'session' : 'sessions'}
              </p>
            </div>

            {/* Security Status */}
            <div className={clsx(
              'p-4 rounded-lg border-2',
              suspiciousActivity?.isSuspicious
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50'
            )}>
              <div className="flex items-center space-x-2 mb-2">
                {suspiciousActivity?.isSuspicious ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium">Account Security</span>
              </div>
              <p className={clsx(
                'text-sm',
                suspiciousActivity?.isSuspicious ? 'text-red-700' : 'text-green-700'
              )}>
                {suspiciousActivity?.isSuspicious ? 'Needs attention' : 'Secure'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suspicious Activity Alert */}
      {suspiciousActivity?.isSuspicious && (
        <Card variant="elevated" className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <span>Security Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-red-700">
                We've detected potentially suspicious activity on your account:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                {suspiciousActivity.reasons.map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Review Activity
                </Button>
                <Button variant="primary" size="sm" onClick={handleEndAllOtherSessions}>
                  End All Other Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices that are currently signed in to your account
              </CardDescription>
            </div>
            {activeSessions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndAllOtherSessions}
              >
                End All Other Sessions
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session, index) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-gray-600">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {session.deviceInfo.browser} on {session.deviceInfo.platform}
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{session.location.city}, {session.location.country}</span>
                      </span>
                      <span>Last active: {formatLastActivity(session.lastActivity)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Signed in via {session.loginMethod}
                      {session.twoFactorVerified && (
                        <span className="ml-2 text-green-600">• 2FA verified</span>
                      )}
                    </div>
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEndSession(session.sessionId)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    End Session
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>
            Improve your account security with these suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!twoFactorStatus?.isEnabled && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Add an extra layer of security to protect your cultural profile and community connections.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSetup2FA}
                    className="mt-2"
                  >
                    Set Up 2FA
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">Regular Security Reviews</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Review your active sessions and security settings regularly to ensure your account stays secure.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-cultural-50 border border-cultural-200 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-cultural-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-cultural-800">Cultural Data Protection</h4>
                <p className="text-sm text-cultural-700 mt-1">
                  Your cultural identity data is encrypted and protected according to POPIA requirements.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityDashboard
