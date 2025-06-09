import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from '../locales/en.json'
import afTranslations from '../locales/af.json'
import zuTranslations from '../locales/zu.json'
import xhTranslations from '../locales/xh.json'

const resources = {
  en: {
    translation: enTranslations
  },
  af: {
    translation: afTranslations
  },
  zu: {
    translation: zuTranslations
  },
  xh: {
    translation: xhTranslations
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    // South African language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ubuntu-connect-language',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Cultural context preservation
    returnObjects: true,
    returnEmptyString: false,
    
    // Namespace configuration for cultural content
    defaultNS: 'translation',
    ns: ['translation', 'cultural', 'auth', 'community'],
    
    // React specific options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    }
  })

export default i18n
