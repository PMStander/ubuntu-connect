import { StateCreator } from 'zustand'
import { CulturalContent, CrossCulturalInteraction } from '@/types/cultural'

export interface CulturalState {
  userCulturalIdentities: string[] // Multiple cultural identities allowed
  selectedCulture: string | null // Currently viewing cultural content
  culturalPreferences: {
    openToDiversity: boolean
    preferredLanguage: string
    culturalExchangeInterest: boolean
    respectfulInteractionMode: boolean
  }
  crossCulturalInteractions: {
    totalInteractions: number
    diversityScore: number // 0-100 cultural diversity engagement
    bridgeConnections: number // Successful cross-cultural connections made
    culturalLearningProgress: Record<string, number> // Learning progress per culture
  }
  culturalContent: {
    bookmarkedContent: string[]
    contributedContent: string[]
    moderationQueue: CulturalContent[]
  }
}

export interface CulturalSlice extends CulturalState {
  // Actions
  setCulturalIdentities: (identities: string[]) => void
  addCulturalIdentity: (identity: string) => void
  removeCulturalIdentity: (identity: string) => void
  setSelectedCulture: (culture: string | null) => void
  updateCulturalPreferences: (preferences: Partial<CulturalState['culturalPreferences']>) => void
  trackCrossCulturalInteraction: (interaction: Omit<CrossCulturalInteraction, 'id' | 'userId' | 'timestamp'>) => void
  addCulturalBookmark: (contentId: string) => void
  removeCulturalBookmark: (contentId: string) => void
  addContributedContent: (contentId: string) => void
  updateDiversityScore: (score: number) => void
  incrementBridgeConnections: () => void
  updateCulturalLearningProgress: (culture: string, progress: number) => void
}

export const culturalSlice: StateCreator<
  CulturalSlice,
  [],
  [],
  CulturalSlice
> = (set, get) => ({
  // Initial state
  userCulturalIdentities: [],
  selectedCulture: null,
  culturalPreferences: {
    openToDiversity: true,
    preferredLanguage: 'en',
    culturalExchangeInterest: true,
    respectfulInteractionMode: true,
  },
  crossCulturalInteractions: {
    totalInteractions: 0,
    diversityScore: 0,
    bridgeConnections: 0,
    culturalLearningProgress: {},
  },
  culturalContent: {
    bookmarkedContent: [],
    contributedContent: [],
    moderationQueue: [],
  },

  // Actions
  setCulturalIdentities: (identities: string[]) => {
    set((state) => ({
      ...state,
      userCulturalIdentities: identities
    }))
  },

  addCulturalIdentity: (identity: string) => {
    set((state) => ({
      ...state,
      userCulturalIdentities: state.userCulturalIdentities.includes(identity)
        ? state.userCulturalIdentities
        : [...state.userCulturalIdentities, identity]
    }))
  },

  removeCulturalIdentity: (identity: string) => {
    set((state) => ({
      ...state,
      userCulturalIdentities: state.userCulturalIdentities.filter(id => id !== identity)
    }))
  },

  setSelectedCulture: (culture: string | null) => {
    set((state) => ({
      ...state,
      selectedCulture: culture
    }))
  },

  updateCulturalPreferences: (preferences) => {
    set((state) => ({
      ...state,
      culturalPreferences: { ...state.culturalPreferences, ...preferences }
    }))
  },

  trackCrossCulturalInteraction: (interaction) => {
    set((state) => {
      const diversityBonus = interaction.sourceCulture !== interaction.targetCulture ? 5 : 1
      const newScore = Math.min(100, state.crossCulturalInteractions.diversityScore + diversityBonus)

      const updatedLearningProgress = { ...state.crossCulturalInteractions.culturalLearningProgress }
      if (interaction.targetCulture && interaction.sourceCulture !== interaction.targetCulture) {
        const currentProgress = updatedLearningProgress[interaction.targetCulture] || 0
        updatedLearningProgress[interaction.targetCulture] = Math.min(100, currentProgress + 2)
      }

      return {
        ...state,
        crossCulturalInteractions: {
          ...state.crossCulturalInteractions,
          totalInteractions: state.crossCulturalInteractions.totalInteractions + 1,
          diversityScore: newScore,
          culturalLearningProgress: updatedLearningProgress
        }
      }
    })
  },

  addCulturalBookmark: (contentId: string) => {
    set((state) => ({
      ...state,
      culturalContent: {
        ...state.culturalContent,
        bookmarkedContent: state.culturalContent.bookmarkedContent.includes(contentId)
          ? state.culturalContent.bookmarkedContent
          : [...state.culturalContent.bookmarkedContent, contentId]
      }
    }))
  },

  removeCulturalBookmark: (contentId: string) => {
    set((state) => ({
      ...state,
      culturalContent: {
        ...state.culturalContent,
        bookmarkedContent: state.culturalContent.bookmarkedContent.filter(id => id !== contentId)
      }
    }))
  },

  addContributedContent: (contentId: string) => {
    set((state) => ({
      ...state,
      culturalContent: {
        ...state.culturalContent,
        contributedContent: state.culturalContent.contributedContent.includes(contentId)
          ? state.culturalContent.contributedContent
          : [...state.culturalContent.contributedContent, contentId]
      }
    }))
  },

  updateDiversityScore: (score: number) => {
    set((state) => ({
      ...state,
      crossCulturalInteractions: {
        ...state.crossCulturalInteractions,
        diversityScore: Math.max(0, Math.min(100, score))
      }
    }))
  },

  incrementBridgeConnections: () => {
    set((state) => ({
      ...state,
      crossCulturalInteractions: {
        ...state.crossCulturalInteractions,
        bridgeConnections: state.crossCulturalInteractions.bridgeConnections + 1
      }
    }))
  },

  updateCulturalLearningProgress: (culture: string, progress: number) => {
    set((state) => ({
      ...state,
      crossCulturalInteractions: {
        ...state.crossCulturalInteractions,
        culturalLearningProgress: {
          ...state.crossCulturalInteractions.culturalLearningProgress,
          [culture]: Math.max(0, Math.min(100, progress))
        }
      }
    }))
  },
})
