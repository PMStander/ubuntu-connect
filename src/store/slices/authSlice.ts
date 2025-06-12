import { StateCreator } from 'zustand'
import { User as FirebaseUser } from 'firebase/auth'
import { AuthUser, RegistrationData } from '@/types/user'
import { authService } from '@/features/auth/services/authService'

export interface AuthSlice {
  // State
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<void>
  loginWithPhone: (phoneNumber: string) => Promise<void>
  verifyPhoneCode: (code: string) => Promise<void>
  register: (data: RegistrationData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const authSlice: StateCreator<
  AuthSlice,
  [],
  [],
  AuthSlice
> = (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      const user = await authService.signInWithEmailAndPassword(email, password)
      set((state) => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      }))
      throw error
    }
  },

  loginWithProvider: async (provider: 'google' | 'facebook') => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      const user = await authService.signInWithProvider(provider)
      set((state) => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Provider login failed',
        isLoading: false
      }))
      throw error
    }
  },

  loginWithPhone: async (phoneNumber: string) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      await authService.signInWithPhoneNumber(phoneNumber)
      // Phone verification is a two-step process
      set((state) => ({
        ...state,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Phone login failed',
        isLoading: false
      }))
      throw error
    }
  },

  verifyPhoneCode: async (code: string) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      const user = await authService.verifyPhoneCode(code)
      set((state) => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Phone verification failed',
        isLoading: false
      }))
      throw error
    }
  },

  register: async (data: RegistrationData) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      const user = await authService.createUserWithEmailAndPassword(data)
      set((state) => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false
      }))
      throw error
    }
  },

  logout: async () => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      await authService.signOut()
      set((state) => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false
      }))
      throw error
    }
  },

  resetPassword: async (email: string) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      await authService.sendPasswordResetEmail(email)
      set((state) => ({
        ...state,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Password reset failed',
        isLoading: false
      }))
      throw error
    }
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }))

    try {
      const updatedUser = await authService.updateUserProfile(data)
      set((state) => ({
        ...state,
        user: updatedUser,
        isLoading: false
      }))
    } catch (error) {
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Profile update failed',
        isLoading: false
      }))
      throw error
    }
  },

  setUser: (user: AuthUser | null) => {
    set((state) => ({
      ...state,
      user,
      isAuthenticated: !!user
    }))
  },

  setLoading: (loading: boolean) => {
    set((state) => ({
      ...state,
      isLoading: loading
    }))
  },

  setError: (error: string | null) => {
    set((state) => ({
      ...state,
      error
    }))
  },

  clearError: () => {
    set((state) => ({
      ...state,
      error: null
    }))
  },
})
