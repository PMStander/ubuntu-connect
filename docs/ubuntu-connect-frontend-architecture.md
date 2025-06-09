# Ubuntu Connect Frontend Architecture Document

## Table of Contents

- [Introduction](#introduction)
- [Overall Frontend Philosophy & Patterns](#overall-frontend-philosophy--patterns)
- [Detailed Frontend Directory Structure](#detailed-frontend-directory-structure)
- [Component Breakdown & Implementation Details](#component-breakdown--implementation-details)
- [State Management In-Depth](#state-management-in-depth)
- [API Interaction Layer](#api-interaction-layer)
- [Routing Strategy](#routing-strategy)
- [Build, Bundling, and Deployment](#build-bundling-and-deployment)
- [Frontend Testing Strategy](#frontend-testing-strategy)
- [Accessibility (AX) Implementation Details](#accessibility-ax-implementation-details)
- [Performance Considerations](#performance-considerations)
- [Internationalization (i18n) and Localization (l10n) Strategy](#internationalization-i18n-and-localization-l10n-strategy)
- [Cultural Sensitivity Implementation](#cultural-sensitivity-implementation)
- [Frontend Security Considerations](#frontend-security-considerations)
- [Browser Support and Progressive Enhancement](#browser-support-and-progressive-enhancement)

## Introduction

This document details the frontend architecture for Ubuntu Connect, a culturally sensitive Progressive Web App designed to unite South Africa through cross-cultural collaboration. It complements the main Ubuntu Connect Architecture Document and focuses on React-based PWA implementation with Firebase integration, mobile-first design for South African networks, and cultural sensitivity across 11 official languages.

- **Link to Main Architecture Document:** `docs/ubuntu-connect-architecture.md`
- **Link to UI/UX Specification:** To be created by Design Architect UI/UX mode
- **Link to Cultural Guidelines:** `docs/cultural-guidelines.md` (to be developed with cultural representatives)

## Overall Frontend Philosophy & Patterns

- **Framework & Core Libraries:** React 18.2+ with TypeScript 5.3+, Vite 5.x for build tooling, Firebase v9 modular SDK for backend integration. These choices support PWA capabilities, real-time features, and mobile-first performance requirements.

- **Component Architecture:** Feature-based atomic design with cultural sensitivity patterns. Components organized by cultural domains (heritage, community, collaboration) with shared UI primitives. Headless UI for accessibility, Tailwind CSS for responsive design with South African cultural themes.

- **State Management Strategy:** Zustand for lightweight global state management with feature-based stores. Local state for UI interactions, Zustand for cross-cultural user data, community memberships, and real-time collaboration state. Firebase real-time listeners integrated with Zustand for live updates.

- **Data Flow:** Unidirectional data flow with Firebase real-time subscriptions. Cultural content flows through moderation pipelines, community interactions trigger cross-cultural analytics, real-time collaboration uses Firebase Realtime Database with optimistic updates.

- **Styling Approach:** Tailwind CSS with custom South African cultural design system. Configuration in `tailwind.config.js` with Rainbow Nation color palette, cultural-neutral iconography, and mobile-first responsive breakpoints. Custom components for cultural content preservation.

- **Key Design Patterns Used:** Provider pattern for cultural context, custom hooks for Firebase integration, compound components for cultural content display, render props for cross-cultural matching, observer pattern for real-time collaboration.

## Detailed Frontend Directory Structure

```plaintext
src/
├── components/                 # Shared/Reusable UI Components
│   ├── ui/                     # Base UI elements (Button, Input, Card)
│   │   ├── Button.tsx          # MUST contain only generic, reusable UI elements
│   │   ├── Input.tsx           # MUST NOT contain business logic
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts            # Barrel exports for ui components
│   ├── layout/                 # Layout components (Header, Footer, Navigation)
│   │   ├── Header.tsx          # MUST contain navigation and cultural language selector
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── CulturalNavigation.tsx # Cultural heritage navigation component
│   └── shared/                 # Cross-feature shared components
│       ├── CulturalContentCard.tsx
│       ├── CrossCulturalIndicator.tsx
│       └── TranslationWrapper.tsx
├── features/                   # Feature-specific logic and components
│   ├── auth/
│   │   ├── components/         # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── CulturalIdentitySelector.tsx
│   │   │   └── ProgressiveProfileBuilder.tsx
│   │   ├── hooks/              # Auth-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useCulturalIdentity.ts
│   │   ├── services/           # Auth API interactions
│   │   │   └── authService.ts
│   │   └── store.ts            # Auth state slice
│   ├── cultural/               # Cultural heritage content management
│   │   ├── components/
│   │   │   ├── CulturalMap.tsx # Interactive South Africa cultural map
│   │   │   ├── HeritageTimeline.tsx
│   │   │   ├── ContentSubmissionForm.tsx
│   │   │   └── ModerationWorkflow.tsx
│   │   ├── hooks/
│   │   │   ├── useCulturalContent.ts
│   │   │   └── useContentModeration.ts
│   │   ├── services/
│   │   │   └── culturalService.ts
│   │   └── store.ts
│   ├── community/              # Community formation and management
│   │   ├── components/
│   │   │   ├── CommunityDiscovery.tsx
│   │   │   ├── CrossCulturalMatcher.tsx
│   │   │   ├── CommunityCard.tsx
│   │   │   └── DiversityIndicator.tsx
│   │   ├── hooks/
│   │   │   ├── useCommunityDiscovery.ts
│   │   │   └── useCrossCulturalMatching.ts
│   │   ├── services/
│   │   │   └── communityService.ts
│   │   └── store.ts
│   ├── knowledge/              # Knowledge exchange and mentorship
│   │   ├── components/
│   │   │   ├── SkillMarketplace.tsx
│   │   │   ├── MentorshipMatcher.tsx
│   │   │   ├── TimeBankingSystem.tsx
│   │   │   └── CrossCulturalLearning.tsx
│   │   ├── hooks/
│   │   │   ├── useSkillMatching.ts
│   │   │   └── useTimeBank.ts
│   │   ├── services/
│   │   │   └── knowledgeService.ts
│   │   └── store.ts
│   ├── collaboration/          # Real-time cross-cultural collaboration
│   │   ├── components/
│   │   │   ├── ProjectWorkspace.tsx
│   │   │   ├── RealTimeChat.tsx
│   │   │   ├── TranslationInterface.tsx
│   │   │   └── CulturalContextPreserver.tsx
│   │   ├── hooks/
│   │   │   ├── useRealTimeCollaboration.ts
│   │   │   └── useCulturalTranslation.ts
│   │   ├── services/
│   │   │   └── collaborationService.ts
│   │   └── store.ts
│   └── achievement/            # Achievement showcase and recognition
│       ├── components/
│       │   ├── AchievementGallery.tsx
│       │   ├── CulturalContributionTracker.tsx
│       │   └── CrossCulturalRecognition.tsx
│       ├── hooks/
│       │   └── useAchievements.ts
│       ├── services/
│       │   └── achievementService.ts
│       └── store.ts
├── hooks/                      # Global/sharable custom React Hooks
│   ├── useFirebase.ts          # Firebase integration hook
│   ├── useOfflineSync.ts       # PWA offline synchronization
│   ├── useCulturalContext.ts   # Cultural sensitivity context
│   ├── useTranslation.ts       # Multi-language translation
│   └── useNetworkOptimization.ts # Mobile network optimization
├── services/                   # Global API service clients
│   ├── firebase.ts             # Firebase configuration and initialization
│   ├── apiClient.ts            # HTTP client for external APIs
│   ├── translationService.ts   # Google Translate API integration
│   ├── geolocationService.ts   # Location services for communities
│   └── offlineService.ts       # PWA offline capabilities
├── store/                      # Global state management
│   ├── index.ts                # Main Zustand store configuration
│   ├── slices/                 # Global state slices
│   │   ├── userSlice.ts        # Global user state
│   │   ├── uiSlice.ts          # UI state (modals, notifications)
│   │   ├── culturalSlice.ts    # Cultural context and preferences
│   │   └── networkSlice.ts     # Network status and optimization
│   └── middleware/             # Store middleware
│       ├── persistenceMiddleware.ts # Local storage persistence
│       └── culturalAnalyticsMiddleware.ts # Cross-cultural interaction tracking
├── utils/                      # Utility functions and helpers
│   ├── culturalUtils.ts        # Cultural data processing utilities
│   ├── translationUtils.ts     # Translation and localization helpers
│   ├── networkUtils.ts         # Mobile network optimization utilities
│   ├── accessibilityUtils.ts   # Accessibility helper functions
│   └── validationUtils.ts      # Form validation with cultural sensitivity
├── types/                      # Global TypeScript type definitions
│   ├── cultural.ts             # Cultural content and identity types
│   ├── community.ts            # Community and collaboration types
│   ├── user.ts                 # User profile and preferences types
│   └── api.ts                  # API response and request types
├── assets/                     # Static assets
│   ├── images/                 # Cultural imagery and icons
│   │   ├── cultural/           # Cultural heritage images
│   │   ├── flags/              # South African cultural symbols
│   │   └── icons/              # Cultural-neutral iconography
│   ├── audio/                  # Cultural audio content
│   └── fonts/                  # Multi-language font support
├── styles/                     # Global styles and themes
│   ├── globals.css             # Global CSS with Tailwind base
│   ├── cultural-themes.css     # South African cultural design themes
│   └── components.css          # Custom component styles
└── App.tsx                     # Main application component with cultural context providers
```

### Notes on Frontend Structure:

Components are organized by cultural domains to maintain cultural sensitivity and enable feature-based development. The `features/` directory contains complete feature modules with their own components, hooks, services, and state management. Global utilities in `utils/` handle cultural data processing, translation, and mobile optimization. The AI Agent MUST adhere to this structure and place cultural content in appropriate cultural domain directories.

## Component Breakdown & Implementation Details

### Component Naming & Organization

- **Component Naming Convention:** PascalCase for files and component names: `CulturalContentCard.tsx`, `CrossCulturalMatcher.tsx`. All component files MUST follow this convention with descriptive names indicating cultural context where applicable.
- **Organization:** Globally reusable components in `src/components/ui/` and `src/components/layout/`. Cultural domain-specific components co-located within their feature directory. Shared cultural components in `src/components/shared/`.

### Template for Component Specification

#### Component: `CulturalMap`

- **Purpose:** Interactive South Africa map displaying cultural regions with clickable areas leading to cultural heritage content. Central navigation component for cultural discovery.
- **Source File(s):** `src/features/cultural/components/CulturalMap.tsx`
- **Visual Reference:** Interactive map with South African provinces, cultural region overlays, and constellation-style connections between cultures
- **Props (Properties):**
  | Prop Name | Type | Required? | Default Value | Description |
  | :-------------- | :---------------------------------------- | :-------- | :------------ | :--------------------------------------------------------------------------------------------------------- |
  | `selectedCulture` | `string \| null` | No | `null` | Currently selected cultural region identifier. MUST be from approved cultural list. |
  | `onCultureSelect` | `(cultureId: string) => void` | Yes | N/A | Callback when user selects a cultural region. |
  | `showDiversityConnections` | `boolean` | No | `true` | Whether to display cross-cultural connection lines. |
  | `accessibilityMode` | `boolean` | No | `false` | Enhanced accessibility mode with keyboard navigation and screen reader support. |
  | `language` | `string` | No | `'en'` | Interface language for cultural region labels. MUST be one of 11 official SA languages. |

- **Internal State:**
  | State Variable | Type | Initial Value | Description |
  | :-------------- | :-------- | :------------ | :----------------------------------------------------------------------------- |
  | `hoveredRegion` | `string \| null` | `null` | Currently hovered cultural region for preview display. |
  | `mapLoaded` | `boolean` | `false` | Tracks if map SVG and cultural data have loaded successfully. |
  | `touchInteraction` | `boolean` | `false` | Tracks if user is using touch interface for mobile optimization. |

- **Key UI Elements / Structure:**
  ```html
  <div className="cultural-map-container relative w-full h-screen bg-gradient-to-b from-blue-100 to-green-100">
    <svg className="w-full h-full" viewBox="0 0 800 600" aria-label="Interactive South Africa Cultural Map">
      {/* South Africa outline with cultural region overlays */}
      <g className="cultural-regions">
        {culturalRegions.map(region => (
          <path
            key={region.id}
            d={region.path}
            className={`cultural-region ${selectedCulture === region.id ? 'selected' : ''} ${hoveredRegion === region.id ? 'hovered' : ''}`}
            onClick={() => onCultureSelect(region.id)}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            aria-label={`${region.name} cultural region`}
            role="button"
            tabIndex={0}
          />
        ))}
      </g>
      {showDiversityConnections && (
        <g className="diversity-connections">
          {/* Constellation-style lines connecting cultural regions */}
        </g>
      )}
    </svg>
    {hoveredRegion && (
      <div className="cultural-preview absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <CulturalPreviewCard cultureId={hoveredRegion} />
      </div>
    )}
  </div>
  ```

- **Events Handled / Emitted:**
  - **Handles:** `onClick` on cultural regions (triggers `onCultureSelect`), `onMouseEnter/onMouseLeave` for hover effects, keyboard navigation (Enter/Space for selection, Arrow keys for region navigation)
  - **Emits:** `onCultureSelect: (cultureId: string) => void` when user selects a cultural region

- **Actions Triggered (Side Effects):**
  - **State Management:** Dispatches `culturalSlice.actions.setSelectedCulture(cultureId)` and `culturalSlice.actions.trackCulturalInteraction({ type: 'map_selection', cultureId, timestamp: Date.now() })`
  - **API Calls:** Calls `culturalService.getCulturalRegionData(cultureId)` on region selection to preload cultural content

- **Styling Notes:**
  - Container uses `relative w-full h-screen bg-gradient-to-b from-blue-100 to-green-100` for full-screen cultural map experience
  - Cultural regions use hover and selected states with Tailwind classes: `hover:fill-yellow-200 selected:fill-orange-300`
  - Diversity connections use animated SVG lines with `stroke-dasharray` animation for constellation effect
  - Mobile-responsive with touch-optimized region sizes and gesture support

- **Accessibility Notes:**
  - SVG has `aria-label="Interactive South Africa Cultural Map"` and each region has descriptive `aria-label`
  - Keyboard navigation: Tab moves between regions, Enter/Space selects, Arrow keys navigate adjacent regions
  - Screen reader announces region names and cultural context in user's preferred language
  - High contrast mode available with `accessibilityMode` prop for enhanced visibility

#### Component: `CrossCulturalMatcher`

- **Purpose:** Intelligent matching component that suggests cross-cultural connections for communities, mentorship, and collaboration based on user preferences and diversity algorithms.
- **Source File(s):** `src/features/community/components/CrossCulturalMatcher.tsx`
- **Visual Reference:** Card-based interface with cultural diversity indicators, matching scores, and bridge-building opportunities
- **Props (Properties):**
  | Prop Name | Type | Required? | Default Value | Description |
  | :-------------- | :---------------------------------------- | :-------- | :------------ | :--------------------------------------------------------------------------------------------------------- |
  | `userId` | `string` | Yes | N/A | Current user ID for personalized matching. MUST be valid Firebase Auth UID. |
  | `matchingType` | `'community' \| 'mentorship' \| 'collaboration'` | Yes | N/A | Type of cross-cultural matching to perform. |
  | `culturalPreferences` | `CulturalPreferences` | No | `{ openToDiversity: true, preferredCultures: [], avoidCultures: [] }` | User's cultural interaction preferences. |
  | `onMatchSelect` | `(match: CrossCulturalMatch) => void` | Yes | N/A | Callback when user selects a suggested match. |
  | `maxMatches` | `number` | No | `5` | Maximum number of matches to display. MUST be between 1-10. |

- **Internal State:**
  | State Variable | Type | Initial Value | Description |
  | :-------------- | :-------- | :------------ | :----------------------------------------------------------------------------- |
  | `matches` | `CrossCulturalMatch[]` | `[]` | Array of suggested cross-cultural matches with diversity scores. |
  | `loading` | `boolean` | `true` | Loading state while calculating cultural matches. |
  | `diversityScore` | `number` | `0` | Overall diversity score for current match set (0-100). |

- **Key UI Elements / Structure:**
  ```html
  <div className="cross-cultural-matcher bg-white rounded-lg shadow-md p-6">
    <div className="header flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-800">Cross-Cultural Connections</h3>
      <div className="diversity-indicator flex items-center">
        <span className="text-sm text-gray-600 mr-2">Diversity Score:</span>
        <div className="w-16 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full transition-all duration-300"
            style={{ width: `${diversityScore}%` }}
          />
        </div>
        <span className="text-sm font-medium ml-2">{diversityScore}%</span>
      </div>
    </div>

    {loading ? (
      <div className="loading-state flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        <span className="ml-3 text-gray-600">Finding diverse connections...</span>
      </div>
    ) : (
      <div className="matches-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map(match => (
          <CrossCulturalMatchCard
            key={match.id}
            match={match}
            onSelect={() => onMatchSelect(match)}
            showCulturalContext={true}
          />
        ))}
      </div>
    )}

    <div className="cultural-bridge-tip mt-4 p-3 bg-blue-50 rounded-lg">
      <p className="text-sm text-blue-800">
        💡 Building bridges across cultures strengthens our Rainbow Nation. Each connection creates understanding.
      </p>
    </div>
  </div>
  ```

- **Events Handled / Emitted:**
  - **Handles:** Match card selection, diversity preference updates, refresh matching algorithm
  - **Emits:** `onMatchSelect: (match: CrossCulturalMatch) => void` when user selects a cross-cultural match

- **Actions Triggered (Side Effects):**
  - **State Management:** Dispatches `communitySlice.actions.setCrossCulturalMatches(matches)` and tracks diversity interactions
  - **API Calls:** Calls `communityService.getCrossCulturalMatches({ userId, type: matchingType, preferences: culturalPreferences })` to fetch personalized matches

- **Styling Notes:**
  - Uses card-based layout with `bg-white rounded-lg shadow-md` for clean presentation
  - Diversity score indicator with gradient `from-orange-400 to-green-500` representing Rainbow Nation colors
  - Grid layout responsive: `grid gap-4 md:grid-cols-2 lg:grid-cols-3` for optimal viewing across devices
  - Cultural bridge tip uses `bg-blue-50` with encouraging messaging about cross-cultural connections

- **Accessibility Notes:**
  - Diversity score has `aria-label="Cultural diversity score: {diversityScore} percent"`
  - Match cards are keyboard navigable with Enter/Space for selection
  - Screen reader announces cultural backgrounds and matching reasons
  - Loading state provides clear feedback: "Finding diverse connections" with spinner

## State Management In-Depth

**Chosen Solution:** Zustand 4.x for lightweight, TypeScript-friendly state management with Firebase real-time integration

**Decision Guide for State Location:**
- **Global State (Zustand):** Cross-cultural user data, community memberships, real-time collaboration state, cultural preferences, offline sync status. MUST be used for data shared across cultural features.
- **React Context API:** Cultural theme context, translation context, accessibility preferences. MUST be used for cultural settings that affect entire component subtrees.
- **Local Component State:** UI interactions, form inputs, modal states, loading states specific to individual components. MUST be the default choice for component-specific state.

### Store Structure / Slices

**Core Cultural Slice (`src/store/slices/culturalSlice.ts`):**
- **Purpose:** Manages user's cultural identity, preferences, and cross-cultural interaction tracking
- **State Shape:**
  ```typescript
  interface CulturalState {
    userCulturalIdentities: string[]; // Multiple cultural identities allowed
    selectedCulture: string | null; // Currently viewing cultural content
    culturalPreferences: {
      openToDiversity: boolean;
      preferredLanguage: string;
      culturalExchangeInterest: boolean;
      respectfulInteractionMode: boolean;
    };
    crossCulturalInteractions: {
      totalInteractions: number;
      diversityScore: number; // 0-100 cultural diversity engagement
      bridgeConnections: number; // Successful cross-cultural connections made
      culturalLearningProgress: Record<string, number>; // Learning progress per culture
    };
    culturalContent: {
      bookmarkedContent: string[];
      contributedContent: string[];
      moderationQueue: CulturalContent[];
    };
  }
  ```
- **Key Actions:** `setCulturalIdentities`, `updateCulturalPreferences`, `trackCrossCulturalInteraction`, `addCulturalBookmark`
- **Async Thunks:** `loadUserCulturalProfile`, `submitCulturalContent`, `moderateCulturalContent`
- **Selectors:** `selectUserCultures`, `selectDiversityScore`, `selectCulturalPreferences`

**Community Slice (`src/features/community/store.ts`):**
- **Purpose:** Manages community memberships, discovery, and cross-cultural community features
- **State Shape:**
  ```typescript
  interface CommunityState {
    userCommunities: Community[];
    discoveredCommunities: Community[];
    crossCulturalMatches: CrossCulturalMatch[];
    communityFilters: {
      type: 'location' | 'culture' | 'activity' | 'all';
      culturalDiversity: boolean;
      location: GeoPoint | null;
      interests: string[];
    };
    realTimeUpdates: {
      newMembers: CommunityMember[];
      activeProjects: Project[];
      culturalEvents: Event[];
    };
  }
  ```

**Collaboration Slice (`src/features/collaboration/store.ts`):**
- **Purpose:** Real-time collaboration state with cultural context preservation
- **State Shape:**
  ```typescript
  interface CollaborationState {
    activeProjects: Project[];
    realTimeMessages: Message[];
    translationCache: Record<string, TranslatedMessage>;
    culturalContext: {
      preservedTerms: Record<string, string>; // Cultural terms to preserve in translation
      culturalEtiquette: CulturalEtiquetteRule[];
      crossCulturalGuidelines: string[];
    };
    collaborationMetrics: {
      culturalDiversityInProjects: number;
      successfulCrossCulturalProjects: number;
      culturalLearningOutcomes: string[];
    };
  }
  ```

### Key Selectors

**Cultural Selectors:**
- `selectUserCulturalIdentities`: Returns user's cultural identities array
- `selectDiversityScore`: Calculates user's cross-cultural engagement score
- `selectCulturalPreferences`: Returns cultural interaction preferences
- `selectCrossCulturalProgress`: Combines interaction data for progress tracking

**Community Selectors:**
- `selectUserCommunities`: Returns communities user belongs to
- `selectCrossCulturalCommunities`: Filters communities by cultural diversity
- `selectCommunityRecommendations`: Suggests diverse communities based on user profile

### Key Actions / Reducers / Thunks

**Core Cultural Action: `trackCrossCulturalInteraction`**
- **Purpose:** Records cross-cultural interactions for diversity scoring and analytics
- **Parameters:** `{ type: 'message' | 'collaboration' | 'content_view', sourceCulture: string, targetCulture: string, context: string }`
- **Dispatch Flow:**
  1. On `pending`: Updates interaction loading state
  2. Calls `culturalService.recordInteraction(interactionData)` with cultural analytics
  3. On `fulfilled`: Updates diversity score, increments bridge connections, logs cultural learning
  4. On `rejected`: Logs error while preserving user privacy

**Real-time Collaboration Action: `syncCollaborationState`**
- **Purpose:** Synchronizes real-time collaboration state with Firebase Realtime Database
- **Parameters:** `{ projectId: string, userId: string }`
- **Dispatch Flow:**
  1. Establishes Firebase real-time listener for project collaboration
  2. Updates local state with real-time messages, preserving cultural context
  3. Handles translation caching and cultural term preservation
  4. Manages optimistic updates for smooth user experience

## API Interaction Layer

### Client/Service Structure

**HTTP Client Setup:** Axios instance in `src/services/apiClient.ts` with Firebase Auth token injection, cultural context headers, and mobile optimization for South African networks.

**Cultural Service (`src/features/cultural/services/culturalService.ts`):**
- **Purpose:** Handles all cultural content API interactions with moderation workflows
- **Functions:**
  - `getCulturalContent(cultureId: string, language?: string): Promise<CulturalContent[]>`
  - `submitCulturalContent(content: CulturalContentSubmission): Promise<CulturalContent>`
  - `moderateCulturalContent(contentId: string, decision: ModerationDecision): Promise<void>`
  - `getCulturalRegions(): Promise<CulturalRegion[]>`
  - `trackCulturalInteraction(interaction: CrossCulturalInteraction): Promise<void>`

**Translation Service (`src/services/translationService.ts`):**
- **Purpose:** Google Translate API integration with cultural context preservation
- **Functions:**
  - `translateText(text: string, sourceLang: string, targetLang: string, preserveCulturalTerms?: string[]): Promise<TranslatedText>`
  - `detectLanguage(text: string): Promise<string>`
  - `getCulturalTermsToPreserve(text: string, culture: string): Promise<string[]>`

### Error Handling & Retries (Frontend)

**Global Error Handling:** Axios interceptor catches API errors, preserves cultural context in error messages, dispatches to `uiSlice.actions.showCulturallyAwareError({ message, culture, context })`

**Cultural Content Errors:** Special handling for cultural sensitivity violations, escalation to cultural representatives, preservation of cultural context in error reporting

**Retry Logic:** Exponential backoff for network errors (max 3 retries), special handling for translation API failures with fallback to cached translations, cultural content submission retries with moderation queue preservation

## Routing Strategy

**Routing Library:** React Router 6.x with cultural route parameters and mobile-optimized navigation

### Route Definitions

| Path Pattern | Component | Protection | Notes |
| :----------- | :-------- | :--------- | :---- |
| `/` | `HomePage.tsx` | `Public` | Landing page with cultural map and unity messaging |
| `/auth/login` | `LoginPage.tsx` | `Public` (redirect if auth) | Cultural identity-aware login |
| `/auth/register` | `RegisterPage.tsx` | `Public` (redirect if auth) | Progressive cultural profile building |
| `/cultural/:cultureId` | `CulturalHeritagePage.tsx` | `Public` | Cultural heritage content pages |
| `/cultural/:cultureId/:contentId` | `CulturalContentPage.tsx` | `Public` | Individual cultural content items |
| `/communities` | `CommunityDiscoveryPage.tsx` | `Authenticated` | Community discovery with cross-cultural matching |
| `/communities/:communityId` | `CommunityPage.tsx` | `Authenticated`, `Member` | Community dashboard and activities |
| `/knowledge` | `KnowledgeMarketplacePage.tsx` | `Authenticated` | Skill sharing and mentorship marketplace |
| `/knowledge/mentor/:mentorId` | `MentorshipPage.tsx` | `Authenticated` | Individual mentorship sessions |
| `/collaborate/:projectId` | `CollaborationWorkspacePage.tsx` | `Authenticated`, `ProjectMember` | Real-time project collaboration |
| `/achievements` | `AchievementGalleryPage.tsx` | `Public` | South African achievements showcase |
| `/profile` | `UserProfilePage.tsx` | `Authenticated` | User profile with cultural identity management |
| `/settings` | `SettingsPage.tsx` | `Authenticated` | Cultural preferences and accessibility settings |

### Route Guards / Protection

**Authentication Guard:** `src/components/guards/AuthGuard.tsx` checks Firebase Auth state from `authSlice`, redirects unauthenticated users to `/auth/login` with return URL preservation

**Cultural Access Guard:** `src/components/guards/CulturalAccessGuard.tsx` ensures respectful access to cultural content, tracks cross-cultural viewing for analytics

**Community Membership Guard:** Validates community membership for private communities, tracks cultural diversity in community access

## Build, Bundling, and Deployment

### Build Process & Scripts

**Key Build Scripts:**
- `"dev": "vite"` - Development server with Firebase emulators
- `"build": "vite build"` - Production build with cultural content optimization
- `"preview": "vite preview"` - Preview production build locally
- `"build:analyze": "vite-bundle-analyzer"` - Bundle analysis for mobile optimization

**Environment Configuration:** `.env.development`, `.env.staging`, `.env.production` files with Firebase config, Google Translate API keys, cultural content CDN URLs

### Key Bundling Optimizations

**Code Splitting:** Route-based splitting with `React.lazy()` for cultural content pages, dynamic imports for translation modules, feature-based chunks for cultural domains

**Cultural Content Optimization:** Lazy loading for cultural images and videos, progressive enhancement for cultural audio content, optimized SVG cultural maps

**Mobile Optimization:** Aggressive tree shaking for unused cultural content, compression for South African network conditions, service worker caching for offline cultural content

### Deployment to CDN/Hosting

**Target Platform:** Firebase Hosting with global CDN and African Points of Presence for optimal South African performance

**Cultural Asset Caching:** Immutable cultural content with long cache headers, dynamic cultural data with short cache, translation cache with cultural context preservation

## Frontend Testing Strategy

### Component Testing

**Tools:** Vitest with React Testing Library, cultural content mocking, accessibility testing with jest-axe

**Cultural Testing Focus:** Cultural content rendering with multiple languages, cross-cultural interaction components, cultural sensitivity in UI elements, translation component behavior

**Cultural Test Data:** Comprehensive test datasets for all 11 South African cultural groups, mock cultural content with moderation states, cross-cultural interaction scenarios

### Feature/Flow Testing (UI Integration)

**Cultural Flow Testing:** Complete cultural content submission and moderation workflow, cross-cultural community joining flow, cultural identity selection and profile building, real-time collaboration with translation

**Cultural Context Testing:** Cultural preference persistence across sessions, cultural content filtering and discovery, cross-cultural matching algorithm validation

### End-to-End UI Testing Tools & Scope

**Tools:** Playwright with mobile device simulation for South African network conditions

**Cultural E2E Scenarios:**
1. **Cultural Discovery Journey:** User explores cultural map, views heritage content, bookmarks cultural items
2. **Cross-Cultural Community Building:** User joins diverse community, participates in cross-cultural project, builds cultural bridges
3. **Knowledge Exchange Flow:** User offers cultural skill, matches with cross-cultural learner, completes mentorship session
4. **Real-time Collaboration:** Multi-cultural team collaborates on project with real-time translation and cultural context preservation
5. **Cultural Content Contribution:** User submits cultural content, goes through moderation workflow, content gets approved and published

## Accessibility (AX) Implementation Details

**Semantic HTML:** Prioritize semantic elements for cultural content (`<article>` for cultural stories, `<section>` for cultural regions, `<nav>` for cultural navigation)

**Cultural ARIA Implementation:**
- Cultural map regions with `role="button"` and descriptive `aria-label` in user's language
- Cultural content cards with `aria-describedby` for cultural context
- Cross-cultural indicators with `aria-label` explaining diversity benefits

**Keyboard Navigation:** Cultural map navigable with arrow keys, cultural content browsable with Tab/Shift+Tab, cultural identity selector accessible via keyboard

**Cultural Focus Management:** Modal cultural content traps focus, cultural region selection moves focus to content area, cultural language switching maintains focus context

**Multi-language Accessibility:** Screen reader support for all 11 official languages, cultural term pronunciation guides, cultural context preservation in accessibility announcements

## Performance Considerations

**Cultural Image Optimization:** WebP format for cultural heritage images, responsive images for cultural content, lazy loading for cultural galleries

**Mobile-First Cultural Performance:**
- Cultural map SVG optimization for mobile rendering
- Progressive enhancement for cultural audio/video content
- Aggressive caching for frequently accessed cultural content
- Data-conscious design for limited bandwidth scenarios

**Cultural Content Caching:** Service worker caches essential cultural content for offline access, cultural translation cache with context preservation, cultural preference persistence across sessions

**Real-time Performance:** Optimized Firebase real-time listeners for cultural collaboration, debounced cultural search with 300ms delay, virtualized cultural content lists for large datasets

## Internationalization (i18n) and Localization (l10n) Strategy

**Requirement Level:** Fully internationalized for all 11 South African official languages with cultural context preservation

**Chosen i18n Library:** react-i18next with cultural namespace organization and context-aware translations

**Translation File Structure:**
```
src/locales/
├── en/
│   ├── cultural.json
│   ├── community.json
│   ├── collaboration.json
│   └── common.json
├── af/
├── zu/
├── xh/
└── [other SA languages]/
```

**Cultural Translation Key Convention:** `cultural.heritage.{cultureId}.{contentType}`, `community.crossCultural.{interactionType}`, `collaboration.translation.{contextType}`

**Cultural Context Preservation:** Special handling for cultural terms that should not be translated, cultural name preservation across languages, cultural etiquette guidelines per language

**Cultural Date/Time Formatting:** South African date formats, cultural calendar integration, time zone handling for distributed cultural communities

## Cultural Sensitivity Implementation

**Cultural Content Guidelines:** All cultural content must be reviewed by cultural representatives, cultural appropriation prevention through community moderation, respectful cultural representation in UI elements

**Cross-Cultural Interaction Design:** Diversity indicators encourage cross-cultural connections, cultural bridge metaphors in UI design, cultural learning opportunities highlighted throughout interface

**Cultural Context Preservation:** Translation system preserves cultural terms and context, cultural etiquette guidelines integrated into collaboration tools, cultural sensitivity warnings for potentially sensitive content

**Cultural Analytics:** Track cross-cultural interactions for diversity metrics, measure cultural bridge-building success, monitor cultural representation balance across platform

## Frontend Security Considerations

**Cultural Content Security:** XSS prevention for user-generated cultural content using DOMPurify, cultural content moderation pipeline with AI and human oversight, cultural representative authentication for moderation actions

**Cultural Data Privacy:** Optional cultural identity disclosure with granular privacy controls, cultural interaction data anonymization for analytics, cultural preference encryption in local storage

**Cross-Cultural Communication Security:** End-to-end encryption for sensitive cultural discussions, cultural context preservation in encrypted communications, secure cultural content sharing with attribution

## Browser Support and Progressive Enhancement

**Target Browsers:** Latest 2 versions of Chrome, Firefox, Safari, Edge with mobile-first focus for South African mobile users

**Progressive Enhancement for Cultural Content:** Core cultural content accessible without JavaScript, cultural map degrades gracefully to text-based navigation, cultural audio/video with fallback descriptions

**Cultural Accessibility Fallbacks:** High contrast mode for cultural content, cultural audio descriptions for visual content, cultural content available in multiple formats (text, audio, visual)

## Change Log

| Change | Date | Version | Description | Author |
| ------ | ---- | ------- | ----------- | ------ |
| Initial Frontend Architecture | 2024-12-19 | 1.0 | Comprehensive frontend architecture for Ubuntu Connect | Karen (Design Architect) |

--- Below, Prompt for Design Architect (UI/UX Specification Mode) ----

## Prompt for Design Architect (UI/UX Specification Mode)

**Objective:** Create detailed UI/UX specifications for Ubuntu Connect's culturally sensitive interface design with South African cultural themes and mobile-first approach.

**Mode:** UI/UX Specification Mode

**Input:** This completed Frontend Architecture Document and the Ubuntu Connect PRD

**Key Tasks:**

1. **Cultural Design System:** Create comprehensive design system with South African Rainbow Nation themes, cultural-neutral iconography, and constellation/tapestry/bridge visual metaphors for unity in diversity

2. **Mobile-First Interface Design:** Design responsive interfaces optimized for 79% mobile usage with touch-optimized cultural interactions and data-conscious design for South African networks

3. **Cross-Cultural Interaction Patterns:** Define UI patterns for cultural discovery, cross-cultural matching, and diversity encouragement with visual diversity indicators and cultural bridge metaphors

4. **Cultural Content Presentation:** Design layouts for cultural heritage content that respect cultural context while enabling cross-cultural learning and appreciation

5. **Real-time Collaboration Interface:** Create UI specifications for real-time cross-cultural collaboration with translation interfaces and cultural context preservation

6. **Accessibility & Multi-language Design:** Ensure design supports WCAG 2.1 AA compliance across 11 South African languages with cultural sensitivity in visual design

Please create detailed UI/UX specifications that will guide the visual design and user experience implementation of this culturally sensitive platform.
