import { useState, useEffect, useCallback } from 'react'
import { useNetworkOptimization } from './useNetworkOptimization'

interface OfflineAction {
  id: string
  type: string
  data: any
  timestamp: number
  retryCount: number
}

interface OfflineSync {
  isOnline: boolean
  pendingActions: OfflineAction[]
  addOfflineAction: (type: string, data: any) => void
  syncPendingActions: () => Promise<void>
  clearPendingActions: () => void
}

const OFFLINE_STORAGE_KEY = 'ubuntu-connect-offline-actions'
const MAX_RETRY_COUNT = 3

export const useOfflineSync = (): OfflineSync => {
  const { networkInfo } = useNetworkOptimization()
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])

  // Load pending actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY)
    if (stored) {
      try {
        const actions = JSON.parse(stored)
        setPendingActions(actions)
      } catch (error) {
        console.error('Failed to parse offline actions:', error)
        localStorage.removeItem(OFFLINE_STORAGE_KEY)
      }
    }
  }, [])

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(pendingActions))
  }, [pendingActions])

  // Add an action to the offline queue
  const addOfflineAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    setPendingActions(prev => [...prev, action])
  }, [])

  // Sync pending actions when online
  const syncPendingActions = useCallback(async () => {
    if (!networkInfo.isOnline || pendingActions.length === 0) {
      return
    }

    const actionsToSync = [...pendingActions]
    const successfulActions: string[] = []
    const failedActions: OfflineAction[] = []

    for (const action of actionsToSync) {
      try {
        // Process different types of offline actions
        await processOfflineAction(action)
        successfulActions.push(action.id)
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error)
        
        // Retry logic
        if (action.retryCount < MAX_RETRY_COUNT) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1,
          })
        } else {
          console.warn(`Action ${action.id} exceeded max retry count, discarding`)
        }
      }
    }

    // Update pending actions
    setPendingActions(prev => 
      prev
        .filter(action => !successfulActions.includes(action.id))
        .map(action => {
          const failed = failedActions.find(f => f.id === action.id)
          return failed || action
        })
    )
  }, [networkInfo.isOnline, pendingActions])

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    setPendingActions([])
    localStorage.removeItem(OFFLINE_STORAGE_KEY)
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (networkInfo.isOnline && pendingActions.length > 0) {
      syncPendingActions()
    }
  }, [networkInfo.isOnline, syncPendingActions, pendingActions.length])

  return {
    isOnline: networkInfo.isOnline,
    pendingActions,
    addOfflineAction,
    syncPendingActions,
    clearPendingActions,
  }
}

// Process different types of offline actions
async function processOfflineAction(action: OfflineAction): Promise<void> {
  switch (action.type) {
    case 'user-registration':
      // Handle offline user registration
      await syncUserRegistration(action.data)
      break
    
    case 'cultural-identity-update':
      // Handle offline cultural identity updates
      await syncCulturalIdentityUpdate(action.data)
      break
    
    case 'profile-update':
      // Handle offline profile updates
      await syncProfileUpdate(action.data)
      break
    
    default:
      console.warn(`Unknown offline action type: ${action.type}`)
  }
}

// Sync functions for different action types
async function syncUserRegistration(data: any): Promise<void> {
  // Implementation would depend on your auth service
  console.log('Syncing user registration:', data)
  // await authService.completeOfflineRegistration(data)
}

async function syncCulturalIdentityUpdate(data: any): Promise<void> {
  console.log('Syncing cultural identity update:', data)
  // await culturalService.updateCulturalIdentities(data)
}

async function syncProfileUpdate(data: any): Promise<void> {
  console.log('Syncing profile update:', data)
  // await userService.updateProfile(data)
}
