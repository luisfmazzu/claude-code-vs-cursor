'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
      return 'All fields are required'
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // First create company, then user
      // This is a simplified version - in a real app you'd have separate company creation
      await signUp(formData.email, formData.password, formData.name)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <span className="text-white font-bold text-xl">ET</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Employee Tracking</h1>
          <p className="text-neutral-600 mt-1">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get started today</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                icon={User}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                icon={Mail}
                required
              />

              <Input
                label="Company Name"
                type="text"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                icon={Building}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  icon={Lock}
                  hint="Must be at least 8 characters"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  icon={Lock}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-neutral-300 text-primary focus:ring-primary"
                  required
                />
                <span className="ml-2 text-sm text-neutral-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-primary-600">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary-600">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={!formData.name || !formData.email || !formData.password || !formData.companyName}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-600 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}