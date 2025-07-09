import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label,
    error,
    hint,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = true,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2)}`
    
    const inputStyles = cn(
      'block w-full px-3 py-2 text-base border rounded-lg shadow-sm transition-colors duration-200',
      'placeholder:text-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      error 
        ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
        : 'border-neutral-300 text-neutral-900',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
      Icon && iconPosition === 'left' && 'pl-10',
      Icon && iconPosition === 'right' && 'pr-10',
      className
    )

    const iconStyles = cn(
      'absolute w-5 h-5 text-neutral-400 transform -translate-y-1/2',
      iconPosition === 'left' ? 'left-3' : 'right-3',
      'top-1/2'
    )

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            {...props}
          />
          
          {Icon && (
            <Icon className={iconStyles} />
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error-600">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input