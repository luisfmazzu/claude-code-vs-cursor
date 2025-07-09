'use client'

import React, { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input,
  Modal,
  Badge,
  Loading
} from '@/components/ui'
import { 
  Mail, 
  Plus, 
  Settings, 
  Trash2, 
  Play, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface EmailIntegration {
  id: string
  provider: 'gmail' | 'outlook' | 'exchange' | 'custom'
  email_address: string
  active: boolean
  last_sync?: string
  created_at: string
  updated_at: string
}

interface IntegrationFormData {
  provider: 'gmail' | 'outlook' | 'exchange' | 'custom'
  emailAddress: string
  host: string
  port: string
  secure: boolean
  username: string
  password: string
}

export default function EmailIntegrationPage() {
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [processingEmails, setProcessingEmails] = useState<Record<string, boolean>>({})
  const [testingConnection, setTestingConnection] = useState(false)

  const [formData, setFormData] = useState<IntegrationFormData>({
    provider: 'gmail',
    emailAddress: '',
    host: '',
    port: '587',
    secure: false,
    username: '',
    password: ''
  })

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual API integration
      const mockIntegrations: EmailIntegration[] = [
        {
          id: '1',
          provider: 'gmail',
          email_address: 'hr@company.com',
          active: true,
          last_sync: '2024-01-06T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-06T10:30:00Z'
        },
        {
          id: '2',
          provider: 'outlook',
          email_address: 'absence@company.com',
          active: false,
          last_sync: '2024-01-05T14:20:00Z',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-05T14:20:00Z'
        }
      ]
      setIntegrations(mockIntegrations)
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof IntegrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-fill host and port based on provider
    if (field === 'provider') {
      const providerDefaults = {
        gmail: { host: 'imap.gmail.com', port: '993', secure: true },
        outlook: { host: 'outlook.office365.com', port: '993', secure: true },
        exchange: { host: '', port: '993', secure: true },
        custom: { host: '', port: '587', secure: false }
      }
      
      const defaults = providerDefaults[value as keyof typeof providerDefaults]
      setFormData(prev => ({
        ...prev,
        provider: value as any,
        host: defaults.host,
        port: defaults.port,
        secure: defaults.secure
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      provider: 'gmail',
      emailAddress: '',
      host: '',
      port: '587',
      secure: false,
      username: '',
      password: ''
    })
  }

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true)
      // Simulate API call to test connection
      console.log('Testing connection:', formData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Connection test successful!')
    } catch (error) {
      console.error('Connection test failed:', error)
      alert('Connection test failed!')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      console.log('Creating integration:', formData)
      
      // Close modal and refresh list
      setShowAddModal(false)
      resetForm()
      fetchIntegrations()
    } catch (error) {
      console.error('Error creating integration:', error)
    }
  }

  const handleProcessEmails = async (integrationId: string) => {
    try {
      setProcessingEmails(prev => ({ ...prev, [integrationId]: true }))
      // Simulate API call to process emails
      console.log('Processing emails for integration:', integrationId)
      await new Promise(resolve => setTimeout(resolve, 3000))
      alert('Emails processed successfully!')
    } catch (error) {
      console.error('Error processing emails:', error)
      alert('Failed to process emails!')
    } finally {
      setProcessingEmails(prev => ({ ...prev, [integrationId]: false }))
    }
  }

  const handleToggleActive = async (integrationId: string, currentStatus: boolean) => {
    try {
      // Simulate API call to toggle active status
      console.log('Toggling active status for:', integrationId, !currentStatus)
      fetchIntegrations()
    } catch (error) {
      console.error('Error toggling integration status:', error)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return '📧'
      case 'outlook':
        return '📮'
      case 'exchange':
        return '📫'
      default:
        return '✉️'
    }
  }

  const getStatusBadge = (active: boolean) => {
    return active 
      ? <Badge variant="success" dot>Active</Badge>
      : <Badge variant="default" dot>Inactive</Badge>
  }

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never'
    const date = new Date(lastSync)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <Layout>
        <Loading text="Loading email integrations..." size="lg" />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Email Integration</h1>
            <p className="text-neutral-600 mt-1">
              Connect your email accounts to automatically parse absence requests
            </p>
          </div>
          <Button
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Integration
          </Button>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getProviderIcon(integration.provider)}</span>
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {integration.provider}
                      </CardTitle>
                      <p className="text-sm text-neutral-600 mt-1">
                        {integration.email_address}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(integration.active)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Last sync: {formatLastSync(integration.last_sync)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={integration.active ? "outline" : "primary"}
                      onClick={() => handleToggleActive(integration.id, integration.active)}
                    >
                      {integration.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    {integration.active && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={processingEmails[integration.id] ? RefreshCw : Play}
                        onClick={() => handleProcessEmails(integration.id)}
                        loading={processingEmails[integration.id]}
                      >
                        Process
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => console.log('Delete integration:', integration.id)}
                      className="text-error-600 hover:text-error-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {integrations.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Mail className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    No email integrations
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Connect your email account to start processing absence requests automatically.
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    Add Your First Integration
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">1. Configure Email</h3>
                <p className="text-sm text-neutral-600">
                  Set up your email account credentials and connection settings.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">2. Test Connection</h3>
                <p className="text-sm text-neutral-600">
                  Verify that the system can successfully connect to your email.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">3. Auto-Process</h3>
                <p className="text-sm text-neutral-600">
                  AI will automatically parse emails and update absence records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Integration Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Email Integration"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Provider
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  required
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="exchange">Exchange</option>
                  <option value="custom">Custom IMAP</option>
                </select>
              </div>

              <Input
                label="Email Address"
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="IMAP Host"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                required
              />
              
              <Input
                label="Port"
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Security
                </label>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={formData.secure}
                    onChange={(e) => handleInputChange('secure', e.target.checked)}
                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-600">Use SSL/TLS</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
              
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>

            <div className="bg-accent-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-accent-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-accent-800">Security Note</h4>
                  <p className="text-sm text-accent-700 mt-1">
                    Your email credentials are encrypted and stored securely. We recommend using 
                    app-specific passwords for better security.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                loading={testingConnection}
              >
                Test Connection
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Integration
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}