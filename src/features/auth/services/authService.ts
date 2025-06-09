import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import { AuthUser, RegistrationData, UserProfile } from '@/types/user'

class AuthService {
  private phoneConfirmationResult: ConfirmationResult | null = null
  private recaptchaVerifier: RecaptchaVerifier | null = null

  // Convert Firebase User to our AuthUser type
  private mapFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      phoneNumber: firebaseUser.phoneNumber,
    }
  }

  // Email/Password Authentication
  async createUserWithEmailAndPassword(data: RegistrationData): Promise<AuthUser> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password)
      
      // Update display name
      await updateProfile(user, {
        displayName: data.name,
      })

      // Send email verification
      await sendEmailVerification(user)

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: data.email,
        displayName: data.name,
        culturalIdentities: data.culturalIdentities || [],
        culturalPreferences: {
          openToDiversity: true,
          preferredLanguage: data.preferredLanguage,
          culturalExchangeInterest: true,
        },
        privacy: {
          profileVisibility: 'communities',
          culturalIdentityVisible: false,
          locationSharing: false,
        },
        createdAt: new Date() as any,
        lastActive: new Date() as any,
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)

      return this.mapFirebaseUser(user)
    } catch (error) {
      console.error('Registration error:', error)
      throw this.handleAuthError(error)
    }
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      
      // Update last active timestamp
      await this.updateLastActive(user.uid)
      
      return this.mapFirebaseUser(user)
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleAuthError(error)
    }
  }

  // Social Authentication
  async signInWithProvider(provider: 'google' | 'facebook'): Promise<AuthUser> {
    try {
      let authProvider
      
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider()
        authProvider.addScope('profile')
        authProvider.addScope('email')
      } else if (provider === 'facebook') {
        authProvider = new FacebookAuthProvider()
        authProvider.addScope('email')
      } else {
        throw new Error('Unsupported provider')
      }

      const { user } = await signInWithPopup(auth, authProvider)
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          culturalIdentities: [],
          culturalPreferences: {
            openToDiversity: true,
            preferredLanguage: 'en',
            culturalExchangeInterest: true,
          },
          privacy: {
            profileVisibility: 'communities',
            culturalIdentityVisible: false,
            locationSharing: false,
          },
          createdAt: new Date() as any,
          lastActive: new Date() as any,
        }

        await setDoc(doc(db, 'users', user.uid), userProfile)
      } else {
        await this.updateLastActive(user.uid)
      }
      
      return this.mapFirebaseUser(user)
    } catch (error) {
      console.error('Provider login error:', error)
      throw this.handleAuthError(error)
    }
  }

  // Phone Authentication
  async signInWithPhoneNumber(phoneNumber: string): Promise<void> {
    try {
      // Initialize reCAPTCHA verifier if not already done
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        })
      }

      this.phoneConfirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        this.recaptchaVerifier
      )
    } catch (error) {
      console.error('Phone authentication error:', error)
      throw this.handleAuthError(error)
    }
  }

  async verifyPhoneCode(code: string): Promise<AuthUser> {
    try {
      if (!this.phoneConfirmationResult) {
        throw new Error('No phone confirmation result available')
      }

      const { user } = await this.phoneConfirmationResult.confirm(code)
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.phoneNumber || '',
          culturalIdentities: [],
          culturalPreferences: {
            openToDiversity: true,
            preferredLanguage: 'en',
            culturalExchangeInterest: true,
          },
          privacy: {
            profileVisibility: 'communities',
            culturalIdentityVisible: false,
            locationSharing: false,
          },
          createdAt: new Date() as any,
          lastActive: new Date() as any,
        }

        await setDoc(doc(db, 'users', user.uid), userProfile)
      } else {
        await this.updateLastActive(user.uid)
      }
      
      return this.mapFirebaseUser(user)
    } catch (error) {
      console.error('Phone verification error:', error)
      throw this.handleAuthError(error)
    }
  }

  // Password Reset
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Password reset error:', error)
      throw this.handleAuthError(error)
    }
  }

  // Profile Update
  async updateUserProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Update Firebase Auth profile
      if (data.displayName !== undefined) {
        await updateProfile(user, {
          displayName: data.displayName,
        })
      }

      // Update Firestore profile
      const updateData: any = {}
      if (data.displayName !== undefined) updateData.displayName = data.displayName
      
      await updateDoc(doc(db, 'users', user.uid), updateData)
      
      return this.mapFirebaseUser(user)
    } catch (error) {
      console.error('Profile update error:', error)
      throw this.handleAuthError(error)
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
      this.phoneConfirmationResult = null
      this.recaptchaVerifier = null
    } catch (error) {
      console.error('Sign out error:', error)
      throw this.handleAuthError(error)
    }
  }

  // Helper Methods
  private async updateLastActive(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastActive: new Date(),
      })
    } catch (error) {
      console.error('Error updating last active:', error)
    }
  }

  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred'
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address'
          break
        case 'auth/wrong-password':
          message = 'Incorrect password'
          break
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists'
          break
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters'
          break
        case 'auth/invalid-email':
          message = 'Invalid email address'
          break
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later'
          break
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection'
          break
        default:
          message = error.message || message
      }
    }
    
    return new Error(message)
  }
}

export const authService = new AuthService()
