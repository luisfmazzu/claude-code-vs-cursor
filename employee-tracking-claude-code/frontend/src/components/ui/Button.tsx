import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5',
      secondary: 'bg-secondary text-primary-800 hover:bg-secondary-300 focus:ring-secondary-500',
      outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary-500',
      ghost: 'text-primary hover:bg-primary-50 focus:ring-primary-500',
      destructive: 'bg-error text-white hover:bg-error-600 focus:ring-error-500 shadow-sm hover:shadow-md'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    }

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
            {children && <span>{children}</span>}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {Icon && iconPosition === 'left' && (
              <Icon className={iconSizes[size]} />
            )}
            {children && <span>{children}</span>}
            {Icon && iconPosition === 'right' && (
              <Icon className={iconSizes[size]} />
            )}
          </div>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button