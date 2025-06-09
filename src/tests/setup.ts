import { beforeAll, vi } from 'vitest'

// Mock Firebase
beforeAll(() => {
  // Mock Firebase Auth
  vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signInWithPhoneNumber: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    FacebookAuthProvider: vi.fn(),
    RecaptchaVerifier: vi.fn(),
  }))

  // Mock Firestore
  vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
  }))

  // Mock Firebase Storage
  vi.mock('firebase/storage', () => ({
    getStorage: vi.fn(),
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
  }))

  // Mock i18next
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
      },
    }),
  }))

  // Mock React Router
  vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    Routes: ({ children }: { children: React.ReactNode }) => children,
    Route: ({ children }: { children: React.ReactNode }) => children,
    Navigate: () => null,
  }))

  // Mock QRCode
  vi.mock('qrcode', () => ({
    default: {
      toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
    },
  }))

  // Mock browser APIs
  Object.defineProperty(window, 'navigator', {
    value: {
      onLine: true,
      userAgent: 'Mozilla/5.0 (Test Browser)',
      platform: 'Test Platform',
      clipboard: {
        writeText: vi.fn(),
      },
    },
    writable: true,
  })

  Object.defineProperty(window, 'screen', {
    value: {
      width: 1920,
      height: 1080,
    },
    writable: true,
  })

  // Mock Intl
  Object.defineProperty(window, 'Intl', {
    value: {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'Africa/Johannesburg' }),
      }),
    },
    writable: true,
  })
})
