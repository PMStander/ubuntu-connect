import React from 'react'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  message = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={clsx('flex flex-col items-center justify-center p-8', className)}>
      <div
        className={clsx(
          'spinner border-2 border-gray-200 border-t-cultural-500 rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner
