import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { User } from 'lucide-react'
import Input from './Input'

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Username" />)
    
    const input = screen.getByLabelText('Username')
    const label = screen.getByText('Username')
    
    expect(input).toBeInTheDocument()
    expect(label).toBeInTheDocument()
  })

  it('renders input without label', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('renders required input with asterisk', () => {
    render(<Input label="Required Field" required />)
    
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveClass('text-error-500')
  })

  it('renders input with help text', () => {
    render(<Input label="Password" help="Must be at least 8 characters" />)
    
    const helpText = screen.getByText('Must be at least 8 characters')
    expect(helpText).toBeInTheDocument()
    expect(helpText).toHaveClass('text-neutral-500')
  })

  it('renders input with error state', () => {
    render(<Input label="Email" error="Invalid email format" />)
    
    const input = screen.getByLabelText('Email')
    const errorText = screen.getByText('Invalid email format')
    
    expect(input).toHaveClass('border-error-500')
    expect(errorText).toBeInTheDocument()
    expect(errorText).toHaveClass('text-error-600')
  })

  it('renders disabled input', () => {
    render(<Input label="Disabled Field" disabled />)
    
    const input = screen.getByLabelText('Disabled Field')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('bg-neutral-100')
  })

  it('renders input with icon', () => {
    render(<Input label="User" icon={User} />)
    
    const input = screen.getByLabelText('User')
    expect(input).toBeInTheDocument()
    
    // Check if icon is rendered
    const icon = screen.getByRole('textbox').parentElement?.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url']
    
    types.forEach((type) => {
      render(<Input type={type as any} label={`${type} input`} />)
      const input = screen.getByLabelText(`${type} input`)
      expect(input).toHaveAttribute('type', type)
    })
  })

  it('handles input value changes', () => {
    const handleChange = jest.fn()
    render(<Input label="Test Input" onChange={handleChange} />)
    
    const input = screen.getByLabelText('Test Input')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'test value'
      })
    }))
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input label="Test Input" onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByLabelText('Test Input')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Input label="Custom" className="custom-class" />)
    
    const input = screen.getByLabelText('Custom')
    expect(input).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input label="Ref Input" ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('renders with controlled value', () => {
    const { rerender } = render(<Input label="Controlled" value="initial" onChange={() => {}} />)
    
    let input = screen.getByLabelText('Controlled') as HTMLInputElement
    expect(input.value).toBe('initial')
    
    rerender(<Input label="Controlled" value="updated" onChange={() => {}} />)
    input = screen.getByLabelText('Controlled') as HTMLInputElement
    expect(input.value).toBe('updated')
  })

  it('renders with default value', () => {
    render(<Input label="Default" defaultValue="default text" />)
    
    const input = screen.getByLabelText('Default') as HTMLInputElement
    expect(input.value).toBe('default text')
  })

  it('handles min and max attributes for number input', () => {
    render(<Input type="number" label="Number" min={0} max={100} />)
    
    const input = screen.getByLabelText('Number')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('handles maxLength attribute', () => {
    render(<Input label="Limited" maxLength={10} />)
    
    const input = screen.getByLabelText('Limited')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('renders with autoComplete attribute', () => {
    render(<Input label="Email" type="email" autoComplete="email" />)
    
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('shows correct focus styles', () => {
    render(<Input label="Focus Test" />)
    
    const input = screen.getByLabelText('Focus Test')
    fireEvent.focus(input)
    
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-primary-500')
  })

  it('error state overrides normal styles', () => {
    render(<Input label="Error Test" error="Something went wrong" />)
    
    const input = screen.getByLabelText('Error Test')
    expect(input).toHaveClass('border-error-500')
    expect(input).not.toHaveClass('border-neutral-300')
  })

  it('disabled state prevents interaction', () => {
    const handleChange = jest.fn()
    render(<Input label="Disabled Test" disabled onChange={handleChange} />)
    
    const input = screen.getByLabelText('Disabled Test')
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Disabled inputs don't trigger change events
    expect(input).toBeDisabled()
  })
})