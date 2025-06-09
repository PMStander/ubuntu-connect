import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu', name: 'Zulu', nativeName: 'IsiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'IsiXhosa', flag: '🇿🇦' },
]

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={clsx(
          'flex items-center space-x-2 px-3 py-2 text-sm font-medium',
          'text-gray-700 bg-white border border-gray-300 rounded-md',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cultural-500',
          'transition-colors duration-200'
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <LanguageIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.nativeName}</span>
        <ChevronDownIcon
          className={clsx(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1" role="listbox">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm hover:bg-gray-100',
                    'focus:outline-none focus:bg-gray-100',
                    'flex items-center space-x-3',
                    language.code === i18n.language && 'bg-cultural-50 text-cultural-700'
                  )}
                  onClick={() => handleLanguageChange(language.code)}
                  role="option"
                  aria-selected={language.code === i18n.language}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {language.code === i18n.language && (
                    <div className="w-2 h-2 bg-cultural-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSelector
