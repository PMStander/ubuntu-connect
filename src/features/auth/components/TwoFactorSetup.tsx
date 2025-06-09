import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { 
  ShieldCheckIcon, 
  QrCodeIcon, 
  KeyIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { twoFactorAuthService } from '@/features/auth/services/twoFactorAuthService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { clsx } from 'clsx'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

type SetupStep = 'intro' | 'qr-code' | 'verify' | 'backup-codes' | 'complete'

interface VerificationForm {
  code: string
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<SetupStep>('intro')
  const [setupData, setSetupData] = useState<{
    secret: string
    qrCodeUrl: string
    backupCodes: string[]
    manualEntryKey: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerificationForm>()

  // Generate 2FA setup when reaching QR code step
  useEffect(() => {
    if (currentStep === 'qr-code' && !setupData && user?.email) {
      generateSetup()
    }
  }, [currentStep, setupData, user?.email])

  const generateSetup = async () => {
    if (!user?.uid || !user?.email) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await twoFactorAuthService.generateTOTPSetup(user.uid, user.email)
      setSetupData(data)
    } catch (error) {
      setError('Failed to generate 2FA setup. Please try again.')
      console.error('2FA setup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAndEnable = async (formData: VerificationForm) => {
    if (!user?.uid) return

    setIsLoading(true)
    setError(null)

    try {
      const isValid = await twoFactorAuthService.enableTwoFactor(user.uid, formData.code)
      
      if (isValid) {
        setCurrentStep('backup-codes')
        reset()
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.')
      console.error('2FA verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n')
      navigator.clipboard.writeText(codesText)
      setCopiedBackupCodes(true)
      setTimeout(() => setCopiedBackupCodes(false), 3000)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShieldCheckIcon className="w-16 h-16 text-cultural-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Your Account with Two-Factor Authentication
              </h3>
              <p className="text-gray-600">
                Add an extra layer of security to protect your cultural profile and community connections.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">✅ Benefits of 2FA</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Protects your cultural identity and personal information</li>
                  <li>• Prevents unauthorized access even if your password is compromised</li>
                  <li>• Required for cultural representatives and community leaders</li>
                  <li>• Builds trust within the Ubuntu Connect community</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📱 What You'll Need</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• A smartphone with an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• About 5 minutes to complete the setup</li>
                  <li>• A secure place to store backup codes</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel} fullWidth>
                Maybe Later
              </Button>
              <Button variant="cultural" onClick={() => setCurrentStep('qr-code')} fullWidth>
                Set Up 2FA
              </Button>
            </div>
          </div>
        )

      case 'qr-code':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <QrCodeIcon className="w-12 h-12 text-cultural-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Scan QR Code
              </h3>
              <p className="text-gray-600">
                Use your authenticator app to scan this QR code
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="spinner w-8 h-8 mx-auto mb-4" />
                <p className="text-gray-600">Generating QR code...</p>
              </div>
            ) : setupData ? (
              <div className="space-y-6">
                <div className="text-center">
                  <img
                    src={setupData.qrCodeUrl}
                    alt="2FA QR Code"
                    className="mx-auto border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Manual Entry</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm font-mono">
                      {setupData.manualEntryKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(setupData.manualEntryKey)}
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setCurrentStep('intro')} fullWidth>
                    Back
                  </Button>
                  <Button variant="cultural" onClick={() => setCurrentStep('verify')} fullWidth>
                    I've Added It
                  </Button>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="outline" onClick={generateSetup}>
                  Try Again
                </Button>
              </div>
            ) : null}
          </div>
        )

      case 'verify':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <KeyIcon className="w-12 h-12 text-cultural-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verify Setup
              </h3>
              <p className="text-gray-600">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleSubmit(verifyAndEnable)} className="space-y-4">
              <Input
                label="Verification Code"
                placeholder="000000"
                maxLength={6}
                error={errors.code?.message}
                {...register('code', {
                  required: 'Verification code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must be 6 digits',
                  },
                })}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('qr-code')}
                  fullWidth
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="cultural"
                  isLoading={isLoading}
                  fullWidth
                >
                  Verify & Enable
                </Button>
              </div>
            </form>
          </div>
        )

      case 'backup-codes':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2FA Enabled Successfully!
              </h3>
              <p className="text-gray-600">
                Save these backup codes in a secure location
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important</h4>
              <p className="text-sm text-yellow-700">
                These backup codes can be used to access your account if you lose your phone. 
                Each code can only be used once.
              </p>
            </div>

            {setupData?.backupCodes && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">Backup Codes</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyBackupCodes}
                      leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}
                    >
                      {copiedBackupCodes ? 'Copied!' : 'Copy All'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="p-2 bg-white border border-gray-300 rounded text-sm font-mono text-center"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                <Button
                  variant="cultural"
                  onClick={() => setCurrentStep('complete')}
                  fullWidth
                >
                  I've Saved My Backup Codes
                </Button>
              </div>
            )}
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Two-Factor Authentication is Active
              </h3>
              <p className="text-gray-600">
                Your account is now protected with an additional layer of security.
              </p>
            </div>

            <div className="p-4 bg-cultural-50 border border-cultural-200 rounded-lg">
              <h4 className="font-medium text-cultural-800 mb-2">🛡️ What's Next?</h4>
              <ul className="text-sm text-cultural-700 space-y-1 text-left">
                <li>• You'll be asked for a code when signing in from new devices</li>
                <li>• Keep your authenticator app and backup codes safe</li>
                <li>• You can manage 2FA settings in your account preferences</li>
                <li>• Consider enabling 2FA for other important accounts too</li>
              </ul>
            </div>

            <Button variant="cultural" onClick={onComplete} fullWidth>
              Complete Setup
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto" variant="elevated">
      <CardHeader>
        <CardTitle className="text-center">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-center">
          Secure your Ubuntu Connect account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStep()}
      </CardContent>
    </Card>
  )
}

export default TwoFactorSetup
