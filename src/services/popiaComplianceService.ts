import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

interface DataProcessingConsent {
  userId: string
  consentType: 'data_processing' | 'marketing' | 'cultural_analytics' | 'location_sharing'
  granted: boolean
  timestamp: Date
  ipAddress: string
  userAgent: string
  version: string // Consent form version
}

interface DataRetentionPolicy {
  dataType: 'profile' | 'cultural_identity' | 'messages' | 'analytics' | 'security_logs'
  retentionPeriod: number // in days
  autoDelete: boolean
  legalBasis: string
}

interface DataExportRequest {
  userId: string
  requestId: string
  requestDate: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  completionDate?: Date
  downloadUrl?: string
  expiryDate?: Date
}

interface DataDeletionRequest {
  userId: string
  requestId: string
  requestDate: Date
  deletionType: 'partial' | 'complete'
  dataTypes: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  completionDate?: Date
  verificationRequired: boolean
}

class POPIAComplianceService {
  private readonly retentionPolicies: DataRetentionPolicy[] = [
    {
      dataType: 'profile',
      retentionPeriod: 2555, // 7 years as per POPIA
      autoDelete: false,
      legalBasis: 'Legitimate interest for community building',
    },
    {
      dataType: 'cultural_identity',
      retentionPeriod: 2555, // 7 years
      autoDelete: false,
      legalBasis: 'Consent for cultural matching',
    },
    {
      dataType: 'messages',
      retentionPeriod: 1095, // 3 years
      autoDelete: true,
      legalBasis: 'Legitimate interest for community communication',
    },
    {
      dataType: 'analytics',
      retentionPeriod: 730, // 2 years
      autoDelete: true,
      legalBasis: 'Legitimate interest for service improvement',
    },
    {
      dataType: 'security_logs',
      retentionPeriod: 365, // 1 year
      autoDelete: true,
      legalBasis: 'Legal obligation for security',
    },
  ]

  // Record consent
  async recordConsent(
    userId: string,
    consentType: DataProcessingConsent['consentType'],
    granted: boolean,
    ipAddress: string,
    userAgent: string,
    version: string = '1.0'
  ): Promise<void> {
    try {
      const consentId = `consent-${userId}-${consentType}-${Date.now()}`
      
      const consent: DataProcessingConsent = {
        userId,
        consentType,
        granted,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        version,
      }

      await setDoc(doc(db, 'data-consents', consentId), consent)
    } catch (error) {
      console.error('Error recording consent:', error)
      throw new Error('Failed to record consent')
    }
  }

  // Get current consent status
  async getConsentStatus(userId: string): Promise<Record<string, boolean>> {
    try {
      const q = query(
        collection(db, 'data-consents'),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const consents = querySnapshot.docs.map(doc => doc.data() as DataProcessingConsent)
      
      // Get latest consent for each type
      const latestConsents: Record<string, boolean> = {}
      
      consents.forEach(consent => {
        const existing = latestConsents[consent.consentType]
        if (!existing || consent.timestamp > existing) {
          latestConsents[consent.consentType] = consent.granted
        }
      })
      
      return latestConsents
    } catch (error) {
      console.error('Error getting consent status:', error)
      return {}
    }
  }

  // Request data export
  async requestDataExport(userId: string): Promise<string> {
    try {
      const requestId = `export-${userId}-${Date.now()}`
      
      const exportRequest: DataExportRequest = {
        userId,
        requestId,
        requestDate: new Date(),
        status: 'pending',
      }

      await setDoc(doc(db, 'data-export-requests', requestId), exportRequest)
      
      // Start processing (in a real implementation, this would be a background job)
      this.processDataExport(requestId)
      
      return requestId
    } catch (error) {
      console.error('Error requesting data export:', error)
      throw new Error('Failed to request data export')
    }
  }

  // Request data deletion
  async requestDataDeletion(
    userId: string,
    deletionType: 'partial' | 'complete',
    dataTypes: string[] = []
  ): Promise<string> {
    try {
      const requestId = `deletion-${userId}-${Date.now()}`
      
      const deletionRequest: DataDeletionRequest = {
        userId,
        requestId,
        requestDate: new Date(),
        deletionType,
        dataTypes,
        status: 'pending',
        verificationRequired: deletionType === 'complete',
      }

      await setDoc(doc(db, 'data-deletion-requests', requestId), deletionRequest)
      
      return requestId
    } catch (error) {
      console.error('Error requesting data deletion:', error)
      throw new Error('Failed to request data deletion')
    }
  }

  // Get data retention policies
  getRetentionPolicies(): DataRetentionPolicy[] {
    return this.retentionPolicies
  }

  // Check if data should be deleted based on retention policy
  async checkDataRetention(userId: string): Promise<{
    dataToDelete: { dataType: string; reason: string }[]
    warnings: string[]
  }> {
    try {
      const dataToDelete: { dataType: string; reason: string }[] = []
      const warnings: string[] = []

      for (const policy of this.retentionPolicies) {
        if (policy.autoDelete) {
          const cutoffDate = new Date(Date.now() - policy.retentionPeriod * 24 * 60 * 60 * 1000)
          
          // Check if user has data older than retention period
          const hasOldData = await this.hasDataOlderThan(userId, policy.dataType, cutoffDate)
          
          if (hasOldData) {
            dataToDelete.push({
              dataType: policy.dataType,
              reason: `Data older than ${policy.retentionPeriod} days (retention policy)`,
            })
          }
        }
      }

      return { dataToDelete, warnings }
    } catch (error) {
      console.error('Error checking data retention:', error)
      return { dataToDelete: [], warnings: ['Error checking retention policies'] }
    }
  }

  // Generate privacy report
  async generatePrivacyReport(userId: string): Promise<{
    dataTypes: string[]
    consentStatus: Record<string, boolean>
    retentionInfo: { dataType: string; retentionPeriod: number; nextReview: Date }[]
    rights: string[]
  }> {
    try {
      const consentStatus = await this.getConsentStatus(userId)
      
      const dataTypes = [
        'Profile Information',
        'Cultural Identity Data',
        'Communication Messages',
        'Usage Analytics',
        'Security Logs',
        'Location Data',
      ]

      const retentionInfo = this.retentionPolicies.map(policy => ({
        dataType: policy.dataType,
        retentionPeriod: policy.retentionPeriod,
        nextReview: new Date(Date.now() + policy.retentionPeriod * 24 * 60 * 60 * 1000),
      }))

      const rights = [
        'Right to access your personal information',
        'Right to correct inaccurate information',
        'Right to delete your personal information',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object to processing',
        'Right to withdraw consent',
        'Right to lodge a complaint with the Information Regulator',
      ]

      return {
        dataTypes,
        consentStatus,
        retentionInfo,
        rights,
      }
    } catch (error) {
      console.error('Error generating privacy report:', error)
      throw new Error('Failed to generate privacy report')
    }
  }

  // Anonymize user data (for analytics)
  anonymizeUserData(userData: any): any {
    const anonymized = { ...userData }
    
    // Remove personally identifiable information
    delete anonymized.email
    delete anonymized.name
    delete anonymized.phoneNumber
    delete anonymized.profileImage
    
    // Hash user ID for analytics
    anonymized.userId = this.hashString(userData.userId)
    
    // Generalize location data
    if (anonymized.location) {
      delete anonymized.location.city
      delete anonymized.location.ipAddress
      // Keep only province/country for cultural analytics
    }
    
    return anonymized
  }

  // Encrypt sensitive cultural data
  async encryptCulturalData(data: any): Promise<string> {
    try {
      // In a real implementation, use proper encryption
      // For now, just base64 encode (NOT secure - use AES-256 in production)
      const jsonString = JSON.stringify(data)
      return btoa(jsonString)
    } catch (error) {
      console.error('Error encrypting cultural data:', error)
      throw new Error('Failed to encrypt cultural data')
    }
  }

  // Decrypt sensitive cultural data
  async decryptCulturalData(encryptedData: string): Promise<any> {
    try {
      // In a real implementation, use proper decryption
      const jsonString = atob(encryptedData)
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Error decrypting cultural data:', error)
      throw new Error('Failed to decrypt cultural data')
    }
  }

  // Private helper methods
  private async processDataExport(requestId: string): Promise<void> {
    try {
      // Update status to processing
      await updateDoc(doc(db, 'data-export-requests', requestId), {
        status: 'processing',
      })

      // In a real implementation, this would:
      // 1. Collect all user data from various collections
      // 2. Format it according to POPIA requirements
      // 3. Create a downloadable file
      // 4. Generate a secure download URL
      // 5. Set expiry date for the download

      // Simulate processing time
      setTimeout(async () => {
        const downloadUrl = `https://example.com/exports/${requestId}.zip`
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        await updateDoc(doc(db, 'data-export-requests', requestId), {
          status: 'completed',
          completionDate: new Date(),
          downloadUrl,
          expiryDate,
        })
      }, 5000)
    } catch (error) {
      console.error('Error processing data export:', error)
      await updateDoc(doc(db, 'data-export-requests', requestId), {
        status: 'failed',
      })
    }
  }

  private async hasDataOlderThan(
    userId: string,
    dataType: string,
    cutoffDate: Date
  ): Promise<boolean> {
    try {
      // This would check specific collections based on dataType
      // For now, return false (no old data)
      return false
    } catch (error) {
      console.error('Error checking old data:', error)
      return false
    }
  }

  private hashString(input: string): string {
    // Simple hash function - use a proper crypto hash in production
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }
}

export const popiaComplianceService = new POPIAComplianceService()
