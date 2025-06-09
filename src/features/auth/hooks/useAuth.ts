import { useEffect } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { useAuth as useAuthStore } from '@/store'
import { AuthUser } from '@/types/user'

export const useAuth = () => {
  const authStore = useAuthStore()

  // Map Firebase User to AuthUser
  const mapFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    phoneNumber: firebaseUser.phoneNumber,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const authUser = mapFirebaseUser(firebaseUser)
        authStore.setUser(authUser)
      } else {
        authStore.setUser(null)
      }
      authStore.setLoading(false)
    })

    return () => unsubscribe()
  }, [authStore])

  return {
    ...authStore,
    // Additional computed properties
    isEmailVerified: authStore.user?.emailVerified ?? false,
    hasPhoneNumber: !!authStore.user?.phoneNumber,
    userDisplayName: authStore.user?.displayName || authStore.user?.email || 'User',
  }
}

export default useAuth
