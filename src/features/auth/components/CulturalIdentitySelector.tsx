import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { clsx } from 'clsx'

interface CulturalIdentityOption {
  id: string
  name: string
  description: string
  region?: string
}

interface CulturalIdentitySelectorProps {
  selectedIdentities: string[]
  onSelectionChange: (identities: string[]) => void
  onContinue: () => void
  onSkip: () => void
}

const CulturalIdentitySelector: React.FC<CulturalIdentitySelectorProps> = ({
  selectedIdentities,
  onSelectionChange,
  onContinue,
  onSkip,
}) => {
  const { t } = useTranslation()
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // South African cultural identities
  const culturalIdentities: CulturalIdentityOption[] = [
    {
      id: 'zulu',
      name: t('cultural.identities.zulu'),
      description: 'The largest ethnic group in South Africa, primarily in KwaZulu-Natal',
      region: 'KwaZulu-Natal',
    },
    {
      id: 'xhosa',
      name: t('cultural.identities.xhosa'),
      description: 'Primarily in Eastern Cape and Western Cape provinces',
      region: 'Eastern Cape, Western Cape',
    },
    {
      id: 'afrikaans',
      name: t('cultural.identities.afrikaans'),
      description: 'Afrikaans-speaking community across South Africa',
      region: 'Western Cape, Northern Cape',
    },
    {
      id: 'english',
      name: t('cultural.identities.english'),
      description: 'English-speaking South African community',
      region: 'Gauteng, KwaZulu-Natal',
    },
    {
      id: 'sotho',
      name: t('cultural.identities.sotho'),
      description: 'Sesotho-speaking community, primarily in Free State',
      region: 'Free State, Gauteng',
    },
    {
      id: 'tswana',
      name: t('cultural.identities.tswana'),
      description: 'Setswana-speaking community in North West province',
      region: 'North West, Gauteng',
    },
    {
      id: 'tsonga',
      name: t('cultural.identities.tsonga'),
      description: 'Xitsonga-speaking community in Limpopo and Mpumalanga',
      region: 'Limpopo, Mpumalanga',
    },
    {
      id: 'venda',
      name: t('cultural.identities.venda'),
      description: 'Tshivenda-speaking community in Limpopo',
      region: 'Limpopo',
    },
    {
      id: 'swazi',
      name: t('cultural.identities.swazi'),
      description: 'SiSwati-speaking community in Mpumalanga',
      region: 'Mpumalanga',
    },
    {
      id: 'ndebele',
      name: t('cultural.identities.ndebele'),
      description: 'IsiNdebele-speaking community in Mpumalanga and Limpopo',
      region: 'Mpumalanga, Limpopo',
    },
    {
      id: 'indian',
      name: t('cultural.identities.indian'),
      description: 'South African Indian community',
      region: 'KwaZulu-Natal, Gauteng',
    },
    {
      id: 'coloured',
      name: t('cultural.identities.coloured'),
      description: 'Mixed-race South African community',
      region: 'Western Cape, Northern Cape',
    },
    {
      id: 'other',
      name: t('cultural.identities.other'),
      description: 'Other cultural backgrounds and mixed heritage',
      region: 'All provinces',
    },
  ]

  const handleIdentityToggle = (identityId: string) => {
    const newSelection = selectedIdentities.includes(identityId)
      ? selectedIdentities.filter(id => id !== identityId)
      : [...selectedIdentities, identityId]
    
    onSelectionChange(newSelection)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" variant="cultural">
      <CardHeader>
        <CardTitle className="text-center text-cultural-gradient">
          {t('auth.culturalIdentity.title')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.culturalIdentity.description')}
        </CardDescription>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            {t('auth.culturalIdentity.multiple')}
          </span>
          <span className="flex items-center">
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            {t('auth.culturalIdentity.optional')}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Cultural Identity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {culturalIdentities.map((identity) => (
              <div
                key={identity.id}
                className={clsx(
                  'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:shadow-md focus-within:ring-2 focus-within:ring-cultural-500',
                  selectedIdentities.includes(identity.id)
                    ? 'border-cultural-500 bg-cultural-50'
                    : 'border-gray-200 hover:border-cultural-300'
                )}
                onClick={() => handleIdentityToggle(identity.id)}
                onMouseEnter={() => setShowTooltip(identity.id)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{identity.name}</h3>
                    {identity.region && (
                      <p className="text-sm text-gray-500 mt-1">{identity.region}</p>
                    )}
                  </div>
                  
                  <div className={clsx(
                    'w-5 h-5 rounded border-2 flex items-center justify-center',
                    selectedIdentities.includes(identity.id)
                      ? 'border-cultural-500 bg-cultural-500'
                      : 'border-gray-300'
                  )}>
                    {selectedIdentities.includes(identity.id) && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Tooltip */}
                {showTooltip === identity.id && (
                  <div className="absolute z-10 bottom-full left-0 right-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                    {identity.description}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selection Summary */}
          {selectedIdentities.length > 0 && (
            <div className="p-4 bg-ubuntu-50 border border-ubuntu-200 rounded-lg">
              <h4 className="font-medium text-ubuntu-800 mb-2">
                Selected Cultural Identities ({selectedIdentities.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedIdentities.map((identityId) => {
                  const identity = culturalIdentities.find(i => i.id === identityId)
                  return (
                    <span
                      key={identityId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ubuntu-100 text-ubuntu-800"
                    >
                      {identity?.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔒 {t('auth.culturalIdentity.privacy')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={onSkip}
            >
              {t('auth.culturalIdentity.skip')}
            </Button>
            
            <Button
              variant="cultural"
              size="lg"
              fullWidth
              onClick={onContinue}
            >
              {t('auth.culturalIdentity.continue')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CulturalIdentitySelector
