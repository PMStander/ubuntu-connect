import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { RegistrationData } from '@/types/user'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface RegistrationFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string
  privacyConsent: boolean
  culturalConsent: boolean
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { t } = useTranslation()
  const { register: registerUser, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      privacyConsent: false,
      culturalConsent: false,
    },
  })

  const password = watch('password')

  const onSubmit = async (data: FormData) => {
    try {
      const registrationData: RegistrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        preferredLanguage: 'en', // Will be updated based on i18n
        privacyConsent: data.privacyConsent,
        culturalConsent: data.culturalConsent,
      }

      await registerUser(registrationData)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the auth store
      console.error('Registration failed:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto" variant="elevated">
      <CardHeader>
        <CardTitle className="text-center text-cultural-gradient">
          {t('auth.welcomeToUbuntu')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('app.description')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <Input
            label={t('auth.name')}
            type="text"
            leftIcon={<UserIcon className="w-5 h-5" />}
            fullWidth
            error={errors.name?.message}
            {...register('name', {
              required: t('validation.required'),
              minLength: {
                value: 2,
                message: t('validation.name'),
              },
            })}
          />

          {/* Email Field */}
          <Input
            label={t('auth.email')}
            type="email"
            leftIcon={<EnvelopeIcon className="w-5 h-5" />}
            fullWidth
            error={errors.email?.message}
            {...register('email', {
              required: t('validation.required'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('validation.email'),
              },
            })}
          />

          {/* Phone Number Field (Optional) */}
          <Input
            label={`${t('auth.phoneNumber')} (${t('common.optional')})`}
            type="tel"
            leftIcon={<PhoneIcon className="w-5 h-5" />}
            fullWidth
            helperText="South African format: +27 XX XXX XXXX"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber', {
              pattern: {
                value: /^\+27[0-9]{9}$/,
                message: t('validation.phoneNumber'),
              },
            })}
          />

          {/* Password Field */}
          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            }
            {...register('password', {
              required: t('validation.required'),
              minLength: {
                value: 8,
                message: t('validation.password'),
              },
            })}
          />

          {/* Confirm Password Field */}
          <Input
            label={t('auth.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            error={errors.confirmPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            }
            {...register('confirmPassword', {
              required: t('validation.required'),
              validate: (value) =>
                value === password || t('validation.passwordMatch'),
            })}
          />

          {/* Privacy Consent */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                {...register('privacyConsent', {
                  required: 'Privacy consent is required',
                })}
              />
              <span className="text-sm text-gray-700">
                {t('privacy.consent')}
                <a
                  href="/privacy"
                  className="text-cultural-600 hover:text-cultural-700 ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('privacy.dataUsage')}
                </a>
              </span>
            </label>
            {errors.privacyConsent && (
              <p className="text-sm text-red-600">{errors.privacyConsent.message}</p>
            )}

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-cultural-600 focus:ring-cultural-500 border-gray-300 rounded"
                {...register('culturalConsent')}
              />
              <span className="text-sm text-gray-700">
                {t('privacy.culturalConsent')} ({t('common.optional')})
              </span>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="cultural"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!isValid}
          >
            {t('auth.createAccount')}
          </Button>

          {/* Switch to Login */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-cultural-600 hover:text-cultural-700 font-medium"
              >
                {t('auth.login')}
              </button>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegistrationForm
