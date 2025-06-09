import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { authSlice, AuthSlice } from './slices/authSlice'
import { culturalSlice, CulturalSlice } from './slices/culturalSlice'
import { uiSlice, UISlice } from './slices/uiSlice'

// Combined store interface
export interface RootState extends AuthSlice, CulturalSlice, UISlice {}

// Create the main store with all slices
export const useStore = create<RootState>()(
  devtools(
    persist(
      immer((...args) => ({
        ...authSlice(...args),
        ...culturalSlice(...args),
        ...uiSlice(...args),
      })),
      {
        name: 'ubuntu-connect-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          auth: {
            user: state.user,
            isAuthenticated: state.isAuthenticated,
          },
          cultural: {
            userCulturalIdentities: state.userCulturalIdentities,
            culturalPreferences: state.culturalPreferences,
            selectedCulture: state.selectedCulture,
          },
          ui: {
            language: state.language,
            theme: state.theme,
          },
        }),
        // Don't persist sensitive data or temporary state
        skipHydration: false,
      }
    ),
    {
      name: 'ubuntu-connect-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// Selector hooks for better performance
export const useAuth = () => useStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  login: state.login,
  logout: state.logout,
  register: state.register,
  updateProfile: state.updateProfile,
}))

export const useCultural = () => useStore((state) => ({
  userCulturalIdentities: state.userCulturalIdentities,
  selectedCulture: state.selectedCulture,
  culturalPreferences: state.culturalPreferences,
  crossCulturalInteractions: state.crossCulturalInteractions,
  culturalContent: state.culturalContent,
  setCulturalIdentities: state.setCulturalIdentities,
  updateCulturalPreferences: state.updateCulturalPreferences,
  trackCrossCulturalInteraction: state.trackCrossCulturalInteraction,
  addCulturalBookmark: state.addCulturalBookmark,
}))

export const useUI = () => useStore((state) => ({
  language: state.language,
  theme: state.theme,
  notifications: state.notifications,
  modals: state.modals,
  setLanguage: state.setLanguage,
  setTheme: state.setTheme,
  showNotification: state.showNotification,
  hideNotification: state.hideNotification,
  openModal: state.openModal,
  closeModal: state.closeModal,
}))

export default useStore
