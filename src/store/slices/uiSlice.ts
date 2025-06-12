import { StateCreator } from 'zustand'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  culturalContext?: string
  actions?: {
    label: string
    action: () => void
  }[]
}

export interface Modal {
  id: string
  type: string
  props?: Record<string, any>
  isOpen: boolean
}

export interface UISlice {
  // State
  language: string
  theme: 'light' | 'dark' | 'auto'
  notifications: Notification[]
  modals: Modal[]
  isOffline: boolean
  networkQuality: 'fast' | 'slow' | 'offline'
  
  // Actions
  setLanguage: (language: string) => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  showNotification: (notification: Omit<Notification, 'id'>) => void
  hideNotification: (id: string) => void
  clearAllNotifications: () => void
  openModal: (modal: Omit<Modal, 'isOpen'>) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  setNetworkStatus: (isOffline: boolean, quality: 'fast' | 'slow' | 'offline') => void
}

export const uiSlice: StateCreator<
  UISlice,
  [],
  [],
  UISlice
> = (set, get) => ({
  // Initial state
  language: 'en',
  theme: 'light',
  notifications: [],
  modals: [],
  isOffline: false,
  networkQuality: 'fast',

  // Actions
  setLanguage: (language: string) => {
    set((state) => ({
      ...state,
      language
    }))

    // Update i18n language
    import('@/services/i18n').then(({ default: i18n }) => {
      i18n.changeLanguage(language)
    })
  },

  setTheme: (theme: 'light' | 'dark' | 'auto') => {
    set((state) => ({
      ...state,
      theme
    }))

    // Apply theme to document
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto theme - use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  },

  showNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    }

    set((state) => ({
      ...state,
      notifications: [...state.notifications, newNotification]
    }))

    // Auto-hide notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().hideNotification(id)
      }, newNotification.duration)
    }
  },

  hideNotification: (id: string) => {
    set((state) => ({
      ...state,
      notifications: state.notifications.filter(notification => notification.id !== id)
    }))
  },

  clearAllNotifications: () => {
    set((state) => ({
      ...state,
      notifications: []
    }))
  },

  openModal: (modal) => {
    const newModal: Modal = {
      ...modal,
      isOpen: true,
    }

    set((state) => ({
      ...state,
      modals: [
        ...state.modals.filter(m => m.id !== modal.id),
        newModal
      ]
    }))
  },

  closeModal: (id: string) => {
    set((state) => ({
      ...state,
      modals: state.modals.map(m =>
        m.id === id ? { ...m, isOpen: false } : m
      )
    }))

    // Remove modal after animation
    setTimeout(() => {
      set((state) => ({
        ...state,
        modals: state.modals.filter(m => m.id !== id)
      }))
    }, 300) // Match CSS transition duration
  },

  closeAllModals: () => {
    set((state) => ({
      ...state,
      modals: state.modals.map(modal => ({ ...modal, isOpen: false }))
    }))

    // Remove all modals after animation
    setTimeout(() => {
      set((state) => ({
        ...state,
        modals: []
      }))
    }, 300)
  },

  setNetworkStatus: (isOffline: boolean, quality: 'fast' | 'slow' | 'offline') => {
    set((state) => ({
      ...state,
      isOffline,
      networkQuality: quality
    }))
  },
})
