import React from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cultural'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-target', // Ensure minimum touch target size
    ]

    const variantClasses = {
      primary: [
        'bg-cultural-500 hover:bg-cultural-600 text-white',
        'focus:ring-cultural-500',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-ubuntu-500 hover:bg-ubuntu-600 text-white',
        'focus:ring-ubuntu-500',
        'shadow-sm hover:shadow-md',
      ],
      outline: [
        'border-2 border-cultural-500 text-cultural-500',
        'hover:bg-cultural-500 hover:text-white',
        'focus:ring-cultural-500',
      ],
      ghost: [
        'text-gray-700 hover:bg-gray-100',
        'focus:ring-gray-500',
      ],
      cultural: [
        'bg-gradient-to-r from-cultural-500 to-ubuntu-500',
        'hover:from-cultural-600 hover:to-ubuntu-600',
        'text-white shadow-md hover:shadow-lg',
        'focus:ring-cultural-500',
      ],
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    )

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="spinner w-4 h-4 mr-2" />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
