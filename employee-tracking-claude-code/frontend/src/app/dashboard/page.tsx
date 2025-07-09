'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { Users, UserCheck, UserX, TrendingUp, Mail, FileSpreadsheet } from 'lucide-react'
import AbsenteeismChart from '@/components/charts/AbsenteeismChart'
import DepartmentChart from '@/components/charts/DepartmentChart'
import AbsenceTypesChart from '@/components/charts/AbsenceTypesChart'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total Employees',
      value: '247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Present Today',
      value: '231',
      change: '94%',
      changeType: 'positive' as const,
      icon: UserCheck,
    },
    {
      title: 'Absent Today',
      value: '16',
      change: '-3%',
      changeType: 'negative' as const,
      icon: UserX,
    },
    {
      title: 'This Month',
      value: '124',
      change: '+8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'absence',
      employee: 'John Doe',
      action: 'Sick leave request approved',
      time: '2 hours ago',
      status: 'approved',
    },
    {
      id: 2,
      type: 'email',
      employee: 'Jane Smith',
      action: 'Email processed - Vacation request',
      time: '4 hours ago',
      status: 'processed',
    },
    {
      id: 3,
      type: 'csv',
      employee: 'System',
      action: 'CSV import completed - 25 records',
      time: '6 hours ago',
      status: 'completed',
    },
    {
      id: 4,
      type: 'absence',
      employee: 'Bob Johnson',
      action: 'Personal leave request pending',
      time: '8 hours ago',
      status: 'pending',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <Badge variant="success">{status}</Badge>
      case 'pending':
        return <Badge variant="warning">{status}</Badge>
      case 'processed':
        return <Badge variant="info">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-accent-600" />
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-primary-600" />
      case 'absence':
        return <UserCheck className="w-4 h-4 text-success-600" />
      default:
        return <TrendingUp className="w-4 h-4 text-neutral-600" />
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-neutral-600 mt-1">
            Here's what's happening with your team today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} hover className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <span
                          className={`text-sm font-medium ${
                            stat.changeType === 'positive'
                              ? 'text-success-600'
                              : 'text-error-600'
                          }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-sm text-neutral-500 ml-1">
                          from last month
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-primary-50 rounded-xl">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-900">
                          {activity.employee}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        {activity.action}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                  <Users className="w-8 h-8 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-neutral-900">
                    Add Employee
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Register new team member
                  </p>
                </button>

                <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                  <FileSpreadsheet className="w-8 h-8 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-neutral-900">
                    Import CSV
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Bulk upload data
                  </p>
                </button>

                <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                  <Mail className="w-8 h-8 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-neutral-900">
                    Setup Email
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Configure integration
                  </p>
                </button>

                <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group">
                  <TrendingUp className="w-8 h-8 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-neutral-900">
                    View Reports
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Analytics & insights
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Absenteeism Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Absenteeism Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <AbsenteeismChart 
                  data={{
                    labels: ['Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6', 'Dec 7'],
                    absenteeism: [12, 15, 8, 18, 22, 14, 16],
                    attendance: [88, 85, 92, 82, 78, 86, 84]
                  }} 
                  height={250}
                />
              </div>
            </CardContent>
          </Card>

          {/* Absence Types Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Absence Types (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <AbsenceTypesChart 
                  data={[
                    { type: 'sick', count: 45, percentage: 56.25 },
                    { type: 'vacation', count: 20, percentage: 25 },
                    { type: 'personal', count: 10, percentage: 12.5 },
                    { type: 'other', count: 5, percentage: 6.25 }
                  ]} 
                  height={250}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <DepartmentChart 
                data={[
                  { department: 'Engineering', totalEmployees: 50, absentToday: 3, absenteeismRate: 6 },
                  { department: 'Marketing', totalEmployees: 25, absentToday: 2, absenteeismRate: 8 },
                  { department: 'Sales', totalEmployees: 40, absentToday: 5, absenteeismRate: 12.5 },
                  { department: 'HR', totalEmployees: 15, absentToday: 1, absenteeismRate: 6.67 },
                  { department: 'Finance', totalEmployees: 20, absentToday: 2, absenteeismRate: 10 }
                ]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}