'use client'

import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  Modal,
  Input
} from '@/components/ui'
import { 
  CreditCard, 
  CheckCircle, 
  Download, 
  Calendar, 
  Receipt, 
  AlertCircle,
  Crown,
  Zap,
  Users,
  Star
} from 'lucide-react'

interface BillingInfo {
  plan: string
  status: 'active' | 'cancelled' | 'past_due'
  nextBilling: string
  amount: number
  employees: number
  maxEmployees: number
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  downloadUrl?: string
}

export default function BillingPage() {
  const [billingInfo] = useState<BillingInfo>({
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-01-15',
    amount: 79,
    employees: 127,
    maxEmployees: 500
  })

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      date: '2024-01-01',
      amount: 79,
      status: 'paid'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-01',
      amount: 79,
      status: 'paid'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-01',
      amount: 29,
      status: 'paid'
    }
  ])

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: ''
  })

  const plans = [
    {
      name: 'Starter',
      price: 29,
      employees: 50,
      features: ['Basic analytics', 'Email integration', 'CSV import/export', 'Standard support'],
      current: false
    },
    {
      name: 'Professional',
      price: 79,
      employees: 500,
      features: ['Advanced analytics', 'AI-powered insights', 'Custom workflows', 'Priority support', 'API access'],
      current: true
    },
    {
      name: 'Enterprise',
      price: 199,
      employees: -1, // unlimited
      features: ['Custom integrations', 'Advanced security', 'Dedicated support', 'On-premise deployment', 'SLA guarantee'],
      current: false
    }
  ]

  const handleUpgrade = (planName: string) => {
    console.log('Upgrading to:', planName)
    setShowUpgradeModal(false)
    alert(`Successfully upgraded to ${planName} plan!`)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Payment submitted:', paymentForm)
    setShowPaymentModal(false)
    alert('Payment method updated successfully!')
  }

  const downloadInvoice = (invoice: Invoice) => {
    console.log('Downloading invoice:', invoice.id)
    // Simulate download
    alert(`Downloading invoice ${invoice.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>
      case 'past_due':
        return <Badge variant="warning">Past Due</Badge>
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'failed':
        return <Badge variant="error">Failed</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Billing & Subscription</h1>
            <p className="text-neutral-600 mt-1">
              Manage your subscription, billing information, and invoices
            </p>
          </div>
          <Button
            icon={CreditCard}
            onClick={() => setShowPaymentModal(true)}
          >
            Update Payment
          </Button>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary-600" />
              <span>Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{billingInfo.plan}</h3>
                  {getStatusBadge(billingInfo.status)}
                </div>
                <p className="text-2xl font-bold text-primary-600">${billingInfo.amount}/month</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-600 mb-1">Employee Usage</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {billingInfo.employees} / {billingInfo.maxEmployees === -1 ? '∞' : billingInfo.maxEmployees}
                </p>
                <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ 
                      width: billingInfo.maxEmployees === -1 ? '20%' : `${(billingInfo.employees / billingInfo.maxEmployees) * 100}%` 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-600 mb-1">Next Billing</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatDate(billingInfo.nextBilling)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(true)}
                  icon={Zap}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Active Employees</p>
                  <p className="text-2xl font-bold text-neutral-900">{billingInfo.employees}</p>
                </div>
                <Users className="w-8 h-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">This Month</p>
                  <p className="text-2xl font-bold text-neutral-900">${billingInfo.amount}</p>
                </div>
                <CreditCard className="w-8 h-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Plan Status</p>
                  <p className="text-2xl font-bold text-success-600">Active</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Billing History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-neutral-100">
                      <td className="py-3 px-4 text-neutral-900">{invoice.id}</td>
                      <td className="py-3 px-4 text-neutral-600">{formatDate(invoice.date)}</td>
                      <td className="py-3 px-4 text-neutral-900">${invoice.amount}</td>
                      <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Download}
                          onClick={() => downloadInvoice(invoice)}
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Modal */}
        <Modal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Upgrade Your Plan"
          size="xl"
        >
          <div className="space-y-6">
            <p className="text-neutral-600">
              Choose the plan that best fits your team's needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.name} className={`p-4 ${plan.current ? 'border-primary-500 border-2' : ''}`}>
                  <CardContent className="p-0">
                    <div className="text-center mb-4">
                      {plan.current && (
                        <Badge className="mb-2 bg-primary-500 text-white">Current Plan</Badge>
                      )}
                      <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-neutral-900 mt-2">
                        ${plan.price}<span className="text-sm text-neutral-600">/month</span>
                      </p>
                      <p className="text-sm text-neutral-600">
                        Up to {plan.employees === -1 ? 'unlimited' : plan.employees} employees
                      </p>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-primary-600 mr-2" />
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      fullWidth
                      variant={plan.current ? "outline" : "primary"}
                      disabled={plan.current}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Update Payment Method"
          size="lg"
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="bg-accent-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-accent-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-accent-800">Secure Payment</h4>
                  <p className="text-sm text-accent-700 mt-1">
                    Your payment information is encrypted and secure. We never store your full card details.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                required
              />
              
              <Input
                label="Name on Card"
                value={paymentForm.nameOnCard}
                onChange={(e) => setPaymentForm({...paymentForm, nameOnCard: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentForm.expiryDate}
                onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                required
              />
              
              <Input
                label="CVV"
                placeholder="123"
                value={paymentForm.cvv}
                onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                required
              />
            </div>
            
            <Input
              label="Billing Address"
              value={paymentForm.billingAddress}
              onChange={(e) => setPaymentForm({...paymentForm, billingAddress: e.target.value})}
              required
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Payment Method
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}