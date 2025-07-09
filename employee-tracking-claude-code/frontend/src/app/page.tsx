'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  Badge 
} from '@/components/ui'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Mail, 
  FileSpreadsheet, 
  BarChart3, 
  Shield, 
  Clock, 
  Star, 
  Menu, 
  X 
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    console.log('Contact form submitted:', contactForm)
    alert('Thank you for your message! We\'ll get back to you soon.')
    setContactForm({ name: '', email: '', company: '', message: '' })
  }

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Comprehensive employee database with role-based access control and detailed profiles.'
    },
    {
      icon: Mail,
      title: 'Email Integration',
      description: 'Automatically parse absence requests from email with AI-powered content analysis.'
    },
    {
      icon: FileSpreadsheet,
      title: 'CSV Import/Export',
      description: 'Bulk import employee data and export reports with intelligent column mapping.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights into absenteeism patterns and team productivity metrics.'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Enterprise-grade security with encrypted data storage and compliance features.'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Live absence tracking with automated notifications and approval workflows.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director',
      company: 'TechCorp Inc.',
      content: 'This platform has completely transformed how we manage employee absences. The AI email parsing is incredibly accurate.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Operations Manager',
      company: 'StartupXYZ',
      content: 'The analytics dashboard gives us insights we never had before. Highly recommend for any growing company.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'People Operations',
      company: 'GlobalTech Ltd.',
      content: 'Easy to use, powerful features, and excellent customer support. Exactly what we needed for our team.',
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small teams',
      features: [
        'Up to 50 employees',
        'Basic analytics',
        'Email integration',
        'CSV import/export',
        'Standard support'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'For growing businesses',
      features: [
        'Up to 500 employees',
        'Advanced analytics',
        'AI-powered insights',
        'Custom workflows',
        'Priority support',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Unlimited employees',
        'Custom integrations',
        'Advanced security',
        'Dedicated support',
        'On-premise deployment',
        'SLA guarantee'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">AbsenceTracker</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900">Features</a>
              <a href="#pricing" className="text-neutral-600 hover:text-neutral-900">Pricing</a>
              <a href="#testimonials" className="text-neutral-600 hover:text-neutral-900">Testimonials</a>
              <a href="#contact" className="text-neutral-600 hover:text-neutral-900">Contact</a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Pricing</a>
              <a href="#testimonials" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Testimonials</a>
              <a href="#contact" className="block px-3 py-2 text-neutral-600 hover:text-neutral-900">Contact</a>
              <div className="pt-4 pb-3 border-t">
                <Link href="/auth/login">
                  <Button variant="ghost" fullWidth className="mb-2">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button fullWidth>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Streamline Employee
              <span className="text-primary-600"> Absence Tracking</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Automate absence management with AI-powered email parsing, real-time analytics, 
              and comprehensive employee management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" icon={ArrowRight}>
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-neutral-500 mt-4">
              ✓ 14-day free trial ✓ No credit card required ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Everything you need to manage employee absences efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Trusted by Growing Companies
            </h2>
            <p className="text-xl text-neutral-600">
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-600 mb-4">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-neutral-600">
              Choose the plan that's right for your team size and needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`p-8 relative ${plan.popular ? 'border-primary-500 border-2' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                    <p className="text-neutral-600 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                      <span className="text-neutral-600 ml-2">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary-600 mr-3" />
                        <span className="text-neutral-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    fullWidth 
                    variant={plan.popular ? "primary" : "outline"}
                    size="lg"
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-neutral-600">
                Have questions? We'd love to hear from you.
              </p>
            </div>

            <Card className="p-8">
              <CardContent className="p-0">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Message
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button type="submit" fullWidth size="lg">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary-400 mb-4">AbsenceTracker</h3>
              <p className="text-neutral-400">
                The modern solution for employee absence management.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 AbsenceTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
