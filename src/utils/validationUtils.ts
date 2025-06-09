// Validation utilities with cultural sensitivity

// South African phone number validation
export const validateSouthAfricanPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Check for South African formats:
  // +27XXXXXXXXX (11 digits total)
  // 27XXXXXXXXX (11 digits total)
  // 0XXXXXXXXX (10 digits starting with 0)
  
  if (cleaned.length === 11 && cleaned.startsWith('27')) {
    return true
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return true
  }
  
  return false
}

// Format South African phone number for display
export const formatSouthAfricanPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  if (cleaned.length === 11 && cleaned.startsWith('27')) {
    // +27 XX XXX XXXX
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // 0XX XXX XXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  
  return phoneNumber
}

// Convert to international format for Firebase Auth
export const toInternationalPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Convert 0XXXXXXXXX to +27XXXXXXXXX
    return `+27${cleaned.slice(1)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('27')) {
    return `+${cleaned}`
  }
  
  return phoneNumber
}

// Email validation with cultural name support
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push('Password must be at least 8 characters long')
  }
  
  if (password.length >= 12) {
    score += 10
  }
  
  if (/[a-z]/.test(password)) {
    score += 15
  } else {
    feedback.push('Include lowercase letters')
  }
  
  if (/[A-Z]/.test(password)) {
    score += 15
  } else {
    feedback.push('Include uppercase letters')
  }
  
  if (/[0-9]/.test(password)) {
    score += 15
  } else {
    feedback.push('Include numbers')
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 15
  } else {
    feedback.push('Include special characters')
  }
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 10
    feedback.push('Avoid repeating characters')
  }
  
  if (/123|abc|qwe/i.test(password)) {
    score -= 15
    feedback.push('Avoid common sequences')
  }
  
  return {
    isValid: score >= 60,
    score: Math.max(0, Math.min(100, score)),
    feedback,
  }
}

// Cultural name validation (supports diacritics, multiple names, etc.)
export const validateCulturalName = (name: string): boolean => {
  // Allow letters (including diacritics), spaces, hyphens, apostrophes
  // Support for names like "Nomsa-Jane", "O'Brien", "José María"
  const nameRegex = /^[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/
  
  if (!nameRegex.test(name)) {
    return false
  }
  
  // Must be at least 2 characters
  if (name.trim().length < 2) {
    return false
  }
  
  // Must not be all spaces or special characters
  if (!/[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/.test(name)) {
    return false
  }
  
  return true
}

// POPIA compliance validation
export const validatePOPIAConsent = (consents: {
  dataProcessing: boolean
  marketing?: boolean
  culturalData?: boolean
}): {
  isValid: boolean
  requiredConsents: string[]
  missingConsents: string[]
} => {
  const requiredConsents = ['dataProcessing']
  const missingConsents: string[] = []
  
  if (!consents.dataProcessing) {
    missingConsents.push('Data processing consent is required')
  }
  
  return {
    isValid: missingConsents.length === 0,
    requiredConsents,
    missingConsents,
  }
}

// Age validation for POPIA compliance
export const validateAge = (birthDate: Date): {
  isValid: boolean
  age: number
  requiresParentalConsent: boolean
} => {
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age
  
  return {
    isValid: actualAge >= 13, // Minimum age for platform
    age: actualAge,
    requiresParentalConsent: actualAge < 18,
  }
}

// Validate cultural identity selection
export const validateCulturalIdentitySelection = (identities: string[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []
  
  // No validation errors for empty selection (it's optional)
  if (identities.length === 0) {
    return { isValid: true, errors, warnings }
  }
  
  // Check for reasonable number of identities
  if (identities.length > 5) {
    errors.push('Maximum 5 cultural identities can be selected')
  }
  
  // Check for duplicates
  const uniqueIdentities = new Set(identities)
  if (uniqueIdentities.size !== identities.length) {
    errors.push('Duplicate cultural identities detected')
  }
  
  // Warning for single identity (encourage diversity)
  if (identities.length === 1) {
    warnings.push('Consider adding additional cultural identities to enhance cross-cultural connections')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Sanitize user input for cultural content
export const sanitizeCulturalContent = (content: string): string => {
  // Remove potentially harmful content while preserving cultural terms
  return content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .slice(0, 5000) // Limit length
}

// Validate cultural content submission
export const validateCulturalContentSubmission = (submission: {
  title: string
  content: string
  culturalContext: string
  type: string
}): {
  isValid: boolean
  errors: string[]
  sanitizedSubmission: typeof submission
} => {
  const errors: string[] = []
  
  if (!submission.title || submission.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long')
  }
  
  if (!submission.content || submission.content.trim().length < 10) {
    errors.push('Content must be at least 10 characters long')
  }
  
  if (!submission.culturalContext || submission.culturalContext.trim().length === 0) {
    errors.push('Cultural context is required')
  }
  
  const sanitizedSubmission = {
    title: sanitizeCulturalContent(submission.title),
    content: sanitizeCulturalContent(submission.content),
    culturalContext: sanitizeCulturalContent(submission.culturalContext),
    type: submission.type,
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedSubmission,
  }
}
