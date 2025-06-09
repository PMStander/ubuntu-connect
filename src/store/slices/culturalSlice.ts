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
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]],
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
    set((state) => {
      state.userCulturalIdentities = identities
    })
  },

  addCulturalIdentity: (identity: string) => {
    set((state) => {
      if (!state.userCulturalIdentities.includes(identity)) {
        state.userCulturalIdentities.push(identity)
      }
    })
  },

  removeCulturalIdentity: (identity: string) => {
    set((state) => {
      state.userCulturalIdentities = state.userCulturalIdentities.filter(id => id !== identity)
    })
  },

  setSelectedCulture: (culture: string | null) => {
    set((state) => {
      state.selectedCulture = culture
    })
  },

  updateCulturalPreferences: (preferences) => {
    set((state) => {
      state.culturalPreferences = { ...state.culturalPreferences, ...preferences }
    })
  },

  trackCrossCulturalInteraction: (interaction) => {
    set((state) => {
      state.crossCulturalInteractions.totalInteractions += 1
      
      // Calculate diversity score based on interaction
      const diversityBonus = interaction.sourceCulture !== interaction.targetCulture ? 5 : 1
      const newScore = Math.min(100, state.crossCulturalInteractions.diversityScore + diversityBonus)
      state.crossCulturalInteractions.diversityScore = newScore
      
      // Update cultural learning progress
      if (interaction.targetCulture && interaction.sourceCulture !== interaction.targetCulture) {
        const currentProgress = state.crossCulturalInteractions.culturalLearningProgress[interaction.targetCulture] || 0
        state.crossCulturalInteractions.culturalLearningProgress[interaction.targetCulture] = Math.min(100, currentProgress + 2)
      }
    })
  },

  addCulturalBookmark: (contentId: string) => {
    set((state) => {
      if (!state.culturalContent.bookmarkedContent.includes(contentId)) {
        state.culturalContent.bookmarkedContent.push(contentId)
      }
    })
  },

  removeCulturalBookmark: (contentId: string) => {
    set((state) => {
      state.culturalContent.bookmarkedContent = state.culturalContent.bookmarkedContent.filter(id => id !== contentId)
    })
  },

  addContributedContent: (contentId: string) => {
    set((state) => {
      if (!state.culturalContent.contributedContent.includes(contentId)) {
        state.culturalContent.contributedContent.push(contentId)
      }
    })
  },

  updateDiversityScore: (score: number) => {
    set((state) => {
      state.crossCulturalInteractions.diversityScore = Math.max(0, Math.min(100, score))
    })
  },

  incrementBridgeConnections: () => {
    set((state) => {
      state.crossCulturalInteractions.bridgeConnections += 1
    })
  },

  updateCulturalLearningProgress: (culture: string, progress: number) => {
    set((state) => {
      state.crossCulturalInteractions.culturalLearningProgress[culture] = Math.max(0, Math.min(100, progress))
    })
  },
})
