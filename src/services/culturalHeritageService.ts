import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import { culturalValidationService } from './culturalValidationService'

export interface MediaFile {
  id: string
  url: string
  filename: string
  size: number
  type: string
  uploadedAt: Timestamp
  metadata?: Record<string, any>
}

export interface CulturalHeritageContent {
  id: string
  title: string
  description: string
  type: 'story' | 'tradition' | 'artifact' | 'recipe' | 'music' | 'dance' | 'language' | 'history'
  culturalGroup: string[]
  region: string
  media: {
    images: MediaFile[]
    videos: MediaFile[]
    audio: MediaFile[]
    documents: MediaFile[]
  }
  metadata: {
    creator: string // User ID
    contributors: string[] // User IDs
    culturalRepresentativeApproval?: string // Representative ID
    dateCreated: Timestamp
    lastModified: Timestamp
    provenance: string // Source and historical context
    culturalSignificance: 'public' | 'community_only' | 'sacred' | 'restricted'
    tags: string[]
    language: string
    region: string
  }
  validation: {
    status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision'
    reviewedBy: string[] // Cultural representative IDs
    reviewNotes: string[]
    communityEndorsements: number
    accuracyScore: number // 0-100
  }
  preservation: {
    archivalQuality: boolean
    backupLocations: string[]
    digitalPreservationMetadata: Record<string, any>
    culturalContextPreserved: boolean
  }
  engagement: {
    views: number
    likes: number
    shares: number
    comments: number
    culturalLearningInteractions: number
  }
}

export interface OralTraditionStory {
  id: string
  title: string
  culturalGroup: string
  storyteller: {
    userId: string
    name: string
    culturalCredibility: number
    approvedBy?: string // Cultural representative
  }
  story: {
    audioRecording?: MediaFile
    videoRecording?: MediaFile
    transcription: string
    translation?: Record<string, string> // language -> translation
  }
  culturalContext: {
    significance: string
    traditionalSetting: string
    culturalLessons: string[]
    relatedTraditions: string[]
    appropriateAudience: 'all' | 'adults_only' | 'community_members' | 'cultural_group_only'
  }
  preservation: {
    originalLanguage: string
    dialectVariations: string[]
    historicalAccuracy: number // 0-100
    culturalAuthenticity: number // 0-100
  }
}

class CulturalHeritageService {
  // Create new cultural heritage content
  async createHeritageContent(content: Omit<CulturalHeritageContent, 'id' | 'engagement'>): Promise<string> {
    try {
      const contentId = `heritage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Validate cultural sensitivity
      const validation = await culturalValidationService.validateCulturalContent({
        id: contentId,
        title: content.title,
        content: content.description,
        type: content.type as any,
        culture: content.culturalGroup[0],
        media: content.media,
        author: {
          userId: content.metadata.creator,
          culturalCredibility: 'community_member',
        },
        verification: {
          status: 'pending',
          reviewedBy: [],
          reviewNotes: [],
          approvedAt: null,
        },
        engagement: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          crossCulturalViews: 0,
        },
        createdAt: content.metadata.dateCreated,
        lastModified: content.metadata.lastModified,
      })

      const heritageContent: CulturalHeritageContent = {
        ...content,
        id: contentId,
        validation: {
          status: validation.requiresReview ? 'pending_review' : 'draft',
          reviewedBy: [],
          reviewNotes: validation.concerns,
          communityEndorsements: 0,
          accuracyScore: 0,
        },
        engagement: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          culturalLearningInteractions: 0,
        },
      }

      await setDoc(doc(db, 'cultural-heritage', contentId), heritageContent)

      // Notify cultural representatives if review required
      if (validation.requiresReview) {
        await this.notifyCulturalRepresentatives(content.culturalGroup, contentId)
      }

      return contentId
    } catch (error) {
      console.error('Error creating heritage content:', error)
      throw new Error('Failed to create heritage content')
    }
  }

  // Upload media files for heritage content
  async uploadMediaFile(
    file: File, 
    contentId: string, 
    mediaType: 'images' | 'videos' | 'audio' | 'documents'
  ): Promise<MediaFile> {
    try {
      const fileId = `${contentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const storageRef = ref(storage, `cultural-heritage/${mediaType}/${fileId}`)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      const mediaFile: MediaFile = {
        id: fileId,
        url: downloadURL,
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: Timestamp.now(),
        metadata: {
          originalName: file.name,
          uploadedBy: 'current-user', // TODO: Get from auth context
        },
      }

      // Update content document with new media file
      const contentRef = doc(db, 'cultural-heritage', contentId)
      await updateDoc(contentRef, {
        [`media.${mediaType}`]: arrayUnion(mediaFile),
        'metadata.lastModified': Timestamp.now(),
      })

      return mediaFile
    } catch (error) {
      console.error('Error uploading media file:', error)
      throw new Error('Failed to upload media file')
    }
  }

  // Create oral tradition story
  async createOralTraditionStory(story: Omit<OralTraditionStory, 'id'>): Promise<string> {
    try {
      const storyId = `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const oralStory: OralTraditionStory = {
        ...story,
        id: storyId,
      }

      await setDoc(doc(db, 'oral-traditions', storyId), oralStory)

      // Create corresponding heritage content entry
      const heritageContent: Omit<CulturalHeritageContent, 'id' | 'engagement'> = {
        title: story.title,
        description: story.story.transcription,
        type: 'story',
        culturalGroup: [story.culturalGroup],
        region: 'south-africa', // TODO: Get from user profile
        media: {
          images: [],
          videos: story.story.videoRecording ? [story.story.videoRecording] : [],
          audio: story.story.audioRecording ? [story.story.audioRecording] : [],
          documents: [],
        },
        metadata: {
          creator: story.storyteller.userId,
          contributors: [],
          dateCreated: Timestamp.now(),
          lastModified: Timestamp.now(),
          provenance: `Oral tradition from ${story.culturalGroup}`,
          culturalSignificance: story.culturalContext.appropriateAudience === 'all' ? 'public' : 'community_only',
          tags: ['oral-tradition', 'story', story.culturalGroup],
          language: story.preservation.originalLanguage,
          region: 'south-africa',
        },
        validation: {
          status: 'pending_review',
          reviewedBy: [],
          reviewNotes: [],
          communityEndorsements: 0,
          accuracyScore: story.preservation.historicalAccuracy,
        },
        preservation: {
          archivalQuality: true,
          backupLocations: [],
          digitalPreservationMetadata: {
            originalLanguage: story.preservation.originalLanguage,
            dialectVariations: story.preservation.dialectVariations,
            culturalAuthenticity: story.preservation.culturalAuthenticity,
          },
          culturalContextPreserved: true,
        },
      }

      await this.createHeritageContent(heritageContent)

      return storyId
    } catch (error) {
      console.error('Error creating oral tradition story:', error)
      throw new Error('Failed to create oral tradition story')
    }
  }

  // Get heritage content by cultural group
  async getHeritageContentByCulture(
    culturalGroup: string, 
    limit_count: number = 20
  ): Promise<CulturalHeritageContent[]> {
    try {
      const q = query(
        collection(db, 'cultural-heritage'),
        where('culturalGroup', 'array-contains', culturalGroup),
        where('validation.status', '==', 'approved'),
        orderBy('engagement.views', 'desc'),
        limit(limit_count)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as CulturalHeritageContent)
    } catch (error) {
      console.error('Error getting heritage content by culture:', error)
      throw new Error('Failed to get heritage content')
    }
  }

  // Approve heritage content (cultural representative action)
  async approveHeritageContent(
    contentId: string, 
    representativeId: string, 
    reviewNotes?: string
  ): Promise<void> {
    try {
      const contentRef = doc(db, 'cultural-heritage', contentId)
      
      await updateDoc(contentRef, {
        'validation.status': 'approved',
        'validation.reviewedBy': arrayUnion(representativeId),
        'validation.reviewNotes': reviewNotes ? arrayUnion(reviewNotes) : [],
        'metadata.culturalRepresentativeApproval': representativeId,
        'metadata.lastModified': Timestamp.now(),
      })

      // TODO: Notify content creator of approval
    } catch (error) {
      console.error('Error approving heritage content:', error)
      throw new Error('Failed to approve heritage content')
    }
  }

  // Search heritage content
  async searchHeritageContent(
    searchTerm: string,
    filters?: {
      type?: string
      culturalGroup?: string
      region?: string
      language?: string
    }
  ): Promise<CulturalHeritageContent[]> {
    try {
      // TODO: Implement full-text search with Algolia or similar
      // For now, basic filtering
      let q = query(
        collection(db, 'cultural-heritage'),
        where('validation.status', '==', 'approved')
      )

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type))
      }

      if (filters?.culturalGroup) {
        q = query(q, where('culturalGroup', 'array-contains', filters.culturalGroup))
      }

      const snapshot = await getDocs(q)
      const results = snapshot.docs.map(doc => doc.data() as CulturalHeritageContent)

      // Filter by search term in title and description
      return results.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    } catch (error) {
      console.error('Error searching heritage content:', error)
      throw new Error('Failed to search heritage content')
    }
  }

  // Private helper methods
  private async notifyCulturalRepresentatives(culturalGroups: string[], contentId: string): Promise<void> {
    // TODO: Implement notification system for cultural representatives
    console.log(`Notifying cultural representatives for groups: ${culturalGroups.join(', ')} about content: ${contentId}`)
  }
}

export const culturalHeritageService = new CulturalHeritageService()
