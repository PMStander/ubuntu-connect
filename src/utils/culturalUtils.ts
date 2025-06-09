import { CulturalIdentityOption } from '@/types/cultural'

// South African cultural identities with comprehensive data
export const SOUTH_AFRICAN_CULTURES: CulturalIdentityOption[] = [
  {
    id: 'zulu',
    name: 'Zulu',
    description: 'The largest ethnic group in South Africa, known for rich traditions, warrior history, and vibrant cultural practices.',
    region: 'KwaZulu-Natal',
    languages: ['zu'],
    traditions: ['Umhlanga (Reed Dance)', 'Zulu Traditional Wedding', 'Stick Fighting', 'Praise Poetry'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'xhosa',
    name: 'Xhosa',
    description: 'Known for distinctive click languages, initiation ceremonies, and significant role in South African history.',
    region: 'Eastern Cape, Western Cape',
    languages: ['xh'],
    traditions: ['Ulwaluko (Initiation)', 'Traditional Beadwork', 'Praise Singing', 'Traditional Healing'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'afrikaans',
    name: 'Afrikaans',
    description: 'Afrikaans-speaking community with diverse heritage including Dutch, German, French, and indigenous influences.',
    region: 'Western Cape, Northern Cape, Free State',
    languages: ['af'],
    traditions: ['Braai Culture', 'Afrikaans Literature', 'Traditional Music', 'Wine Culture'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'english',
    name: 'English South African',
    description: 'English-speaking South African community with British colonial heritage and modern multicultural identity.',
    region: 'Gauteng, KwaZulu-Natal, Western Cape',
    languages: ['en'],
    traditions: ['Cricket Culture', 'Tea Culture', 'English Literature', 'Garden Culture'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'sotho',
    name: 'Sotho',
    description: 'Sesotho-speaking people known for their blanket culture, traditional architecture, and mountain kingdom heritage.',
    region: 'Free State, Gauteng, Lesotho',
    languages: ['st'],
    traditions: ['Blanket Culture', 'Traditional Huts', 'Praise Poetry', 'Traditional Dancing'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'tswana',
    name: 'Tswana',
    description: 'Setswana-speaking people known for their democratic traditions, cattle culture, and traditional courts.',
    region: 'North West, Gauteng, Botswana',
    languages: ['tn'],
    traditions: ['Kgotla (Traditional Court)', 'Cattle Culture', 'Traditional Dancing', 'Pottery'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'tsonga',
    name: 'Tsonga',
    description: 'Xitsonga-speaking people known for their vibrant music, traditional dances, and coastal heritage.',
    region: 'Limpopo, Mpumalanga, Mozambique',
    languages: ['ts'],
    traditions: ['Xibelani Dance', 'Traditional Music', 'Marula Festival', 'Traditional Crafts'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'venda',
    name: 'Venda',
    description: 'Tshivenda-speaking people known for their sacred sites, traditional leadership, and unique cultural practices.',
    region: 'Limpopo',
    languages: ['ve'],
    traditions: ['Domba Dance', 'Sacred Sites', 'Traditional Leadership', 'Wood Carving'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'swazi',
    name: 'Swazi',
    description: 'SiSwati-speaking people known for their monarchy, traditional ceremonies, and cultural preservation.',
    region: 'Mpumalanga, Eswatini',
    languages: ['ss'],
    traditions: ['Umhlanga (Reed Dance)', 'Incwala Ceremony', 'Traditional Crafts', 'Monarchy Culture'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'ndebele',
    name: 'Ndebele',
    description: 'IsiNdebele-speaking people famous for their geometric art, colorful house paintings, and beadwork.',
    region: 'Mpumalanga, Limpopo',
    languages: ['nr'],
    traditions: ['Geometric Art', 'House Painting', 'Beadwork', 'Traditional Dress'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'indian',
    name: 'Indian South African',
    description: 'South African Indian community with diverse heritage including Tamil, Hindi, Gujarati, and Muslim traditions.',
    region: 'KwaZulu-Natal, Gauteng',
    languages: ['en', 'hi', 'ta', 'gu'],
    traditions: ['Diwali', 'Eid', 'Tamil Culture', 'Bollywood', 'Curry Culture'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'coloured',
    name: 'Coloured',
    description: 'Mixed-race South African community with diverse heritage and unique cultural identity.',
    region: 'Western Cape, Northern Cape',
    languages: ['af', 'en'],
    traditions: ['Kaapse Klopse', 'Ghoema Music', 'Cape Malay Culture', 'Carnival'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other cultural backgrounds including recent immigrants, mixed heritage, and international communities.',
    region: 'All provinces',
    languages: ['en', 'pt', 'fr', 'de', 'zh'],
    traditions: ['Diverse International Traditions'],
    connectionTypes: ['heritage', 'interest', 'learning', 'family', 'community'],
  },
]

// Get cultural identity by ID
export const getCulturalIdentityById = (id: string): CulturalIdentityOption | undefined => {
  return SOUTH_AFRICAN_CULTURES.find(culture => culture.id === id)
}

// Get cultural identities by IDs
export const getCulturalIdentitiesByIds = (ids: string[]): CulturalIdentityOption[] => {
  return ids.map(id => getCulturalIdentityById(id)).filter(Boolean) as CulturalIdentityOption[]
}

// Validate cultural identity selection
export const validateCulturalIdentities = (identities: string[]): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  // Check if all identities exist
  const invalidIdentities = identities.filter(id => !getCulturalIdentityById(id))
  if (invalidIdentities.length > 0) {
    errors.push(`Invalid cultural identities: ${invalidIdentities.join(', ')}`)
  }
  
  // Check for reasonable number of identities (max 5)
  if (identities.length > 5) {
    errors.push('Maximum 5 cultural identities allowed')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Calculate cultural diversity score
export const calculateDiversityScore = (userCultures: string[], interactionCultures: string[]): number => {
  if (userCultures.length === 0) return 0
  
  const uniqueInteractionCultures = new Set(interactionCultures)
  const crossCulturalInteractions = Array.from(uniqueInteractionCultures).filter(
    culture => !userCultures.includes(culture)
  )
  
  // Base score from user's own cultural diversity
  const baseScore = Math.min(userCultures.length * 10, 30)
  
  // Bonus for cross-cultural interactions
  const crossCulturalBonus = Math.min(crossCulturalInteractions.length * 5, 70)
  
  return Math.min(baseScore + crossCulturalBonus, 100)
}

// Get cultural recommendations based on user's current identities
export const getCulturalRecommendations = (userCultures: string[]): CulturalIdentityOption[] => {
  if (userCultures.length === 0) {
    // If no cultures selected, recommend major groups
    return SOUTH_AFRICAN_CULTURES.filter(culture => 
      ['zulu', 'xhosa', 'afrikaans', 'english'].includes(culture.id)
    )
  }
  
  // Recommend cultures from different regions or language families
  const userRegions = new Set(
    getCulturalIdentitiesByIds(userCultures).map(culture => culture.region)
  )
  
  return SOUTH_AFRICAN_CULTURES.filter(culture => 
    !userCultures.includes(culture.id) && 
    !userRegions.has(culture.region)
  ).slice(0, 3)
}

// Format cultural identity names for display
export const formatCulturalIdentityNames = (
  identities: string[], 
  language: string = 'en'
): string => {
  if (identities.length === 0) return ''
  
  const names = getCulturalIdentitiesByIds(identities).map(culture => culture.name)
  
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' and ')
  
  return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1]
}

// Check if cultural content is appropriate for user
export const isCulturalContentAppropriate = (
  contentCulture: string,
  userCultures: string[],
  contentType: 'sacred' | 'general' | 'educational'
): boolean => {
  // Sacred content should only be shown to people from that culture
  if (contentType === 'sacred') {
    return userCultures.includes(contentCulture)
  }
  
  // General and educational content can be shown to everyone
  return true
}

// Generate cultural interaction context
export const generateCulturalContext = (
  sourceCulture: string,
  targetCulture: string
): string => {
  const source = getCulturalIdentityById(sourceCulture)
  const target = getCulturalIdentityById(targetCulture)
  
  if (!source || !target) return ''
  
  if (sourceCulture === targetCulture) {
    return `Connecting within the ${source.name} community`
  }
  
  return `Cross-cultural connection: ${source.name} ↔ ${target.name}`
}
