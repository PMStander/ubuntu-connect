import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import QRCode from 'qrcode'

interface TwoFactorSetup {
  userId: string
  secret: string
  backupCodes: string[]
  isEnabled: boolean
  setupDate: Date
  lastUsed?: Date
  method: 'totp' | 'sms' | 'backup_codes'
}

interface TwoFactorVerification {
  userId: string
  code: string
  method: 'totp' | 'sms' | 'backup_codes'
  timestamp: Date
}

class TwoFactorAuthService {
  // Generate TOTP secret and setup data
  async generateTOTPSetup(userId: string, userEmail: string): Promise<{
    secret: string
    qrCodeUrl: string
    backupCodes: string[]
    manualEntryKey: string
  }> {
    try {
      // Generate a random secret (32 characters, base32)
      const secret = this.generateSecret()
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes()
      
      // Create TOTP URL for QR code
      const appName = 'Ubuntu Connect'
      const totpUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(totpUrl)
      
      // Store setup data (not enabled yet)
      await setDoc(doc(db, 'two-factor-setup', userId), {
        userId,
        secret,
        backupCodes,
        isEnabled: false,
        setupDate: new Date(),
        method: 'totp',
      })
      
      return {
        secret,
        qrCodeUrl,
        backupCodes,
        manualEntryKey: secret,
      }
    } catch (error) {
      console.error('Error generating TOTP setup:', error)
      throw new Error('Failed to generate 2FA setup')
    }
  }

  // Enable 2FA after user verifies setup
  async enableTwoFactor(userId: string, verificationCode: string): Promise<boolean> {
    try {
      const setupDoc = await getDoc(doc(db, 'two-factor-setup', userId))
      
      if (!setupDoc.exists()) {
        throw new Error('No 2FA setup found')
      }
      
      const setupData = setupDoc.data() as TwoFactorSetup
      
      // Verify the code
      const isValid = this.verifyTOTPCode(setupData.secret, verificationCode)
      
      if (!isValid) {
        return false
      }
      
      // Enable 2FA
      await updateDoc(doc(db, 'two-factor-setup', userId), {
        isEnabled: true,
        lastUsed: new Date(),
      })
      
      return true
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      throw new Error('Failed to enable 2FA')
    }
  }

  // Verify 2FA code during login
  async verifyTwoFactorCode(
    userId: string, 
    code: string, 
    method: 'totp' | 'sms' | 'backup_codes' = 'totp'
  ): Promise<boolean> {
    try {
      const setupDoc = await getDoc(doc(db, 'two-factor-setup', userId))
      
      if (!setupDoc.exists()) {
        return false
      }
      
      const setupData = setupDoc.data() as TwoFactorSetup
      
      if (!setupData.isEnabled) {
        return false
      }
      
      let isValid = false
      
      switch (method) {
        case 'totp':
          isValid = this.verifyTOTPCode(setupData.secret, code)
          break
        case 'backup_codes':
          isValid = await this.verifyBackupCode(userId, code, setupData)
          break
        case 'sms':
          // SMS verification would be implemented here
          // For now, we'll just return false
          isValid = false
          break
      }
      
      if (isValid) {
        // Update last used timestamp
        await updateDoc(doc(db, 'two-factor-setup', userId), {
          lastUsed: new Date(),
        })
        
        // Log verification attempt
        await this.logVerificationAttempt(userId, method, true)
      } else {
        await this.logVerificationAttempt(userId, method, false)
      }
      
      return isValid
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      return false
    }
  }

  // Disable 2FA
  async disableTwoFactor(userId: string, verificationCode: string): Promise<boolean> {
    try {
      const setupDoc = await getDoc(doc(db, 'two-factor-setup', userId))
      
      if (!setupDoc.exists()) {
        return false
      }
      
      const setupData = setupDoc.data() as TwoFactorSetup
      
      // Verify current code before disabling
      const isValid = this.verifyTOTPCode(setupData.secret, verificationCode)
      
      if (!isValid) {
        return false
      }
      
      // Delete 2FA setup
      await deleteDoc(doc(db, 'two-factor-setup', userId))
      
      return true
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      throw new Error('Failed to disable 2FA')
    }
  }

  // Get 2FA status for user
  async getTwoFactorStatus(userId: string): Promise<{
    isEnabled: boolean
    method?: string
    setupDate?: Date
    lastUsed?: Date
    hasBackupCodes: boolean
  }> {
    try {
      const setupDoc = await getDoc(doc(db, 'two-factor-setup', userId))
      
      if (!setupDoc.exists()) {
        return {
          isEnabled: false,
          hasBackupCodes: false,
        }
      }
      
      const setupData = setupDoc.data() as TwoFactorSetup
      
      return {
        isEnabled: setupData.isEnabled,
        method: setupData.method,
        setupDate: setupData.setupDate,
        lastUsed: setupData.lastUsed,
        hasBackupCodes: setupData.backupCodes && setupData.backupCodes.length > 0,
      }
    } catch (error) {
      console.error('Error getting 2FA status:', error)
      return {
        isEnabled: false,
        hasBackupCodes: false,
      }
    }
  }

  // Generate new backup codes
  async regenerateBackupCodes(userId: string, verificationCode: string): Promise<string[] | null> {
    try {
      const setupDoc = await getDoc(doc(db, 'two-factor-setup', userId))
      
      if (!setupDoc.exists()) {
        return null
      }
      
      const setupData = setupDoc.data() as TwoFactorSetup
      
      // Verify current code
      const isValid = this.verifyTOTPCode(setupData.secret, verificationCode)
      
      if (!isValid) {
        return null
      }
      
      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes()
      
      // Update in database
      await updateDoc(doc(db, 'two-factor-setup', userId), {
        backupCodes: newBackupCodes,
      })
      
      return newBackupCodes
    } catch (error) {
      console.error('Error regenerating backup codes:', error)
      return null
    }
  }

  // Private helper methods
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  private verifyTOTPCode(secret: string, code: string): boolean {
    // This is a simplified TOTP verification
    // In a real implementation, you would use a proper TOTP library
    // that handles time windows and counter synchronization
    
    const timeStep = Math.floor(Date.now() / 1000 / 30)
    
    // Check current time window and adjacent windows for clock drift
    for (let i = -1; i <= 1; i++) {
      const testCode = this.generateTOTPCode(secret, timeStep + i)
      if (testCode === code) {
        return true
      }
    }
    
    return false
  }

  private generateTOTPCode(secret: string, timeStep: number): string {
    // Simplified TOTP generation - in production use a proper crypto library
    const hash = this.hmacSha1(secret, timeStep.toString())
    const offset = hash.charCodeAt(hash.length - 1) & 0xf
    const code = ((hash.charCodeAt(offset) & 0x7f) << 24) |
                 ((hash.charCodeAt(offset + 1) & 0xff) << 16) |
                 ((hash.charCodeAt(offset + 2) & 0xff) << 8) |
                 (hash.charCodeAt(offset + 3) & 0xff)
    
    return (code % 1000000).toString().padStart(6, '0')
  }

  private hmacSha1(key: string, data: string): string {
    // Simplified HMAC-SHA1 - in production use a proper crypto library
    return btoa(key + data).substr(0, 20)
  }

  private async verifyBackupCode(
    userId: string, 
    code: string, 
    setupData: TwoFactorSetup
  ): Promise<boolean> {
    const codeIndex = setupData.backupCodes.indexOf(code.toUpperCase())
    
    if (codeIndex === -1) {
      return false
    }
    
    // Remove used backup code
    const updatedCodes = [...setupData.backupCodes]
    updatedCodes.splice(codeIndex, 1)
    
    await updateDoc(doc(db, 'two-factor-setup', userId), {
      backupCodes: updatedCodes,
    })
    
    return true
  }

  private async logVerificationAttempt(
    userId: string, 
    method: string, 
    success: boolean
  ): Promise<void> {
    try {
      const logId = `2fa-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      await setDoc(doc(db, 'two-factor-logs', logId), {
        userId,
        method,
        success,
        timestamp: new Date(),
        ipAddress: 'unknown', // Would be captured from request in real implementation
      })
    } catch (error) {
      console.error('Error logging 2FA attempt:', error)
    }
  }
}

export const twoFactorAuthService = new TwoFactorAuthService()
