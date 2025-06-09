import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/services/firebase'

interface UserSession {
  sessionId: string
  userId: string
  deviceInfo: {
    userAgent: string
    platform: string
    browser: string
    isMobile: boolean
    screenResolution: string
  }
  location: {
    ipAddress: string
    country: string
    city: string
    timezone: string
  }
  createdAt: Date
  lastActivity: Date
  isActive: boolean
  loginMethod: 'email' | 'google' | 'facebook' | 'phone'
  twoFactorVerified: boolean
}

interface SecurityEvent {
  id: string
  userId: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity'
  details: {
    ipAddress: string
    userAgent: string
    location?: string
    additionalInfo?: any
  }
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class SessionManagementService {
  // Create new session
  async createSession(
    userId: string,
    deviceInfo: UserSession['deviceInfo'],
    location: UserSession['location'],
    loginMethod: UserSession['loginMethod'],
    twoFactorVerified: boolean = false
  ): Promise<string> {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const session: UserSession = {
        sessionId,
        userId,
        deviceInfo,
        location,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        loginMethod,
        twoFactorVerified,
      }

      await setDoc(doc(db, 'user-sessions', sessionId), session)
      
      // Log login event
      await this.logSecurityEvent(userId, 'login', {
        ipAddress: location.ipAddress,
        userAgent: deviceInfo.userAgent,
        location: `${location.city}, ${location.country}`,
        additionalInfo: { loginMethod, twoFactorVerified },
      }, 'low')

      return sessionId
    } catch (error) {
      console.error('Error creating session:', error)
      throw new Error('Failed to create session')
    }
  }

  // Update session activity
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'user-sessions', sessionId), {
        lastActivity: new Date(),
      })
    } catch (error) {
      console.error('Error updating session activity:', error)
    }
  }

  // End session
  async endSession(sessionId: string): Promise<void> {
    try {
      const sessionDoc = await getDoc(doc(db, 'user-sessions', sessionId))
      
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data() as UserSession
        
        await updateDoc(doc(db, 'user-sessions', sessionId), {
          isActive: false,
          endedAt: new Date(),
        })

        // Log logout event
        await this.logSecurityEvent(sessionData.userId, 'logout', {
          ipAddress: sessionData.location.ipAddress,
          userAgent: sessionData.deviceInfo.userAgent,
        }, 'low')
      }
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  // Get active sessions for user
  async getActiveSessions(userId: string): Promise<UserSession[]> {
    try {
      const q = query(
        collection(db, 'user-sessions'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as UserSession)
    } catch (error) {
      console.error('Error getting active sessions:', error)
      return []
    }
  }

  // End all sessions except current
  async endAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    try {
      const activeSessions = await this.getActiveSessions(userId)
      
      const otherSessions = activeSessions.filter(session => 
        session.sessionId !== currentSessionId
      )

      for (const session of otherSessions) {
        await this.endSession(session.sessionId)
      }

      // Log security event
      await this.logSecurityEvent(userId, 'logout', {
        ipAddress: 'multiple',
        userAgent: 'multiple',
        additionalInfo: { 
          action: 'end_all_other_sessions',
          sessionsEnded: otherSessions.length 
        },
      }, 'medium')
    } catch (error) {
      console.error('Error ending other sessions:', error)
      throw new Error('Failed to end other sessions')
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean
    reasons: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }> {
    try {
      const reasons: string[] = []
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

      // Get recent sessions
      const recentSessions = await this.getRecentSessions(userId, 24) // Last 24 hours
      
      // Check for multiple locations
      const uniqueCountries = new Set(recentSessions.map(s => s.location.country))
      if (uniqueCountries.size > 2) {
        reasons.push('Multiple countries detected in recent sessions')
        riskLevel = 'high'
      }

      // Check for multiple devices
      const uniqueDevices = new Set(recentSessions.map(s => 
        `${s.deviceInfo.platform}-${s.deviceInfo.browser}`
      ))
      if (uniqueDevices.size > 3) {
        reasons.push('Multiple devices used recently')
        riskLevel = riskLevel === 'high' ? 'high' : 'medium'
      }

      // Check for rapid succession logins
      const loginTimes = recentSessions.map(s => s.createdAt.getTime()).sort()
      for (let i = 1; i < loginTimes.length; i++) {
        if (loginTimes[i] - loginTimes[i - 1] < 60000) { // Less than 1 minute apart
          reasons.push('Rapid succession logins detected')
          riskLevel = 'high'
          break
        }
      }

      // Check for failed login attempts
      const failedLogins = await this.getRecentSecurityEvents(userId, 'failed_login', 1)
      if (failedLogins.length > 5) {
        reasons.push('Multiple failed login attempts')
        riskLevel = 'critical'
      }

      // Check for sessions without 2FA
      const sessions2FA = recentSessions.filter(s => !s.twoFactorVerified)
      if (sessions2FA.length > 0 && recentSessions.length > 1) {
        reasons.push('Sessions without two-factor authentication')
        riskLevel = riskLevel === 'critical' ? 'critical' : 'medium'
      }

      const isSuspicious = reasons.length > 0

      if (isSuspicious) {
        await this.logSecurityEvent(userId, 'suspicious_activity', {
          ipAddress: 'multiple',
          userAgent: 'analysis',
          additionalInfo: { reasons, riskLevel },
        }, riskLevel)
      }

      return {
        isSuspicious,
        reasons,
        riskLevel,
      }
    } catch (error) {
      console.error('Error detecting suspicious activity:', error)
      return {
        isSuspicious: false,
        reasons: [],
        riskLevel: 'low',
      }
    }
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      const sessionDoc = await getDoc(doc(db, 'user-sessions', sessionId))
      
      if (sessionDoc.exists()) {
        return sessionDoc.data() as UserSession
      }
      
      return null
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiryTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      
      const q = query(
        collection(db, 'user-sessions'),
        where('lastActivity', '<', expiryTime)
      )
      
      const querySnapshot = await getDocs(q)
      
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error)
    }
  }

  // Log security event
  private async logSecurityEvent(
    userId: string,
    type: SecurityEvent['type'],
    details: SecurityEvent['details'],
    severity: SecurityEvent['severity']
  ): Promise<void> {
    try {
      const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const event: SecurityEvent = {
        id: eventId,
        userId,
        type,
        details,
        timestamp: new Date(),
        severity,
      }

      await setDoc(doc(db, 'security-events', eventId), event)
    } catch (error) {
      console.error('Error logging security event:', error)
    }
  }

  // Get recent sessions
  private async getRecentSessions(userId: string, hours: number): Promise<UserSession[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const q = query(
        collection(db, 'user-sessions'),
        where('userId', '==', userId),
        where('createdAt', '>', cutoffTime),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as UserSession)
    } catch (error) {
      console.error('Error getting recent sessions:', error)
      return []
    }
  }

  // Get recent security events
  private async getRecentSecurityEvents(
    userId: string,
    type: SecurityEvent['type'],
    hours: number
  ): Promise<SecurityEvent[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const q = query(
        collection(db, 'security-events'),
        where('userId', '==', userId),
        where('type', '==', type),
        where('timestamp', '>', cutoffTime),
        orderBy('timestamp', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as SecurityEvent)
    } catch (error) {
      console.error('Error getting recent security events:', error)
      return []
    }
  }

  // Get device info from browser
  getDeviceInfo(): UserSession['deviceInfo'] {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    
    return {
      userAgent,
      platform,
      browser,
      isMobile,
      screenResolution: `${screen.width}x${screen.height}`,
    }
  }

  // Get location info (simplified - in production use a proper geolocation service)
  async getLocationInfo(): Promise<UserSession['location']> {
    try {
      // In a real implementation, you would use a geolocation API
      // For now, return default South African location
      return {
        ipAddress: 'unknown',
        country: 'South Africa',
        city: 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    } catch (error) {
      return {
        ipAddress: 'unknown',
        country: 'Unknown',
        city: 'Unknown',
        timezone: 'UTC',
      }
    }
  }
}

export const sessionManagementService = new SessionManagementService()
