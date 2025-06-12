import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

interface FormData {
  email: string
  password: string
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { t } = useTranslation()
  const { login, loginWithProvider, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
  })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login failed:', error)
    }
  }

  const handleProviderLogin = async (provider: 'google' | 'facebook') => {
    try {
      await loginWithProvider(provider)
      onSuccess?.()
    } catch (error) {
      console.error('Provider login failed:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto" variant="elevated">
      <CardHeader>
        <CardTitle className="text-center text-cultural-gradient">
          {t('auth.welcomeBack')}
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to continue your cultural journey
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Password Field */}
          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            error={errors.password?.message}
            rightIconInteractive={true}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            })}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-cultural-600 hover:text-cultural-700"
            >
              {t('auth.forgotPassword')}
            </button>
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
            {t('auth.login')}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => handleProviderLogin('google')}
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              {t('auth.signInWith', { provider: 'Google' })}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => handleProviderLogin('facebook')}
              leftIcon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              }
            >
              {t('auth.signInWith', { provider: 'Facebook' })}
            </Button>
          </div>

          {/* Switch to Register */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-cultural-600 hover:text-cultural-700 font-medium"
              >
                {t('auth.register')}
              </button>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default LoginForm
