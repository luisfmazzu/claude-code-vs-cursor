import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { User } from 'lucide-react'
import Button from './Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('renders button with primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-600')
  })

  it('renders button with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-neutral-300')
    expect(button).not.toHaveClass('bg-primary-600')
  })

  it('renders button with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-neutral-100')
  })

  it('renders disabled button', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })

  it('renders button with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('renders full width button', () => {
    render(<Button fullWidth>Full Width</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  it('renders button with icon', () => {
    render(<Button icon={User}>With Icon</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    // Check if icon is rendered
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    // Check if loading spinner is rendered
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not handle click when disabled', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not handle click when loading', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('renders as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>)
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('applies correct variant classes', () => {
    const variants = [
      { variant: 'primary' as const, class: 'bg-primary-600' },
      { variant: 'secondary' as const, class: 'bg-neutral-600' },
      { variant: 'success' as const, class: 'bg-success-600' },
      { variant: 'warning' as const, class: 'bg-warning-600' },
      { variant: 'error' as const, class: 'bg-error-600' },
    ]

    variants.forEach(({ variant, class: expectedClass }) => {
      render(<Button variant={variant}>Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass(expectedClass)
    })
  })
})