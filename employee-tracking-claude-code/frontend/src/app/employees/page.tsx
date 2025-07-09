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
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react'

interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  department?: string
  position?: string
  hire_date?: string
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  created_at: string
  updated_at: string
}

interface EmployeeFormData {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  hireDate: string
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])

  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
    status: 'active'
  })

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchPositions()
  }, [searchTerm, statusFilter, departmentFilter])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual API integration
      const mockEmployees: Employee[] = [
        {
          id: '1',
          employee_id: 'EMP001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          department: 'Engineering',
          position: 'Software Developer',
          hire_date: '2023-01-15',
          status: 'active',
          created_at: '2023-01-15T00:00:00Z',
          updated_at: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          employee_id: 'EMP002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@company.com',
          phone: '+1-555-0124',
          department: 'Marketing',
          position: 'Marketing Manager',
          hire_date: '2023-02-01',
          status: 'active',
          created_at: '2023-02-01T00:00:00Z',
          updated_at: '2023-02-01T00:00:00Z'
        },
        {
          id: '3',
          employee_id: 'EMP003',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob.johnson@company.com',
          phone: '+1-555-0125',
          department: 'Engineering',
          position: 'Senior Developer',
          hire_date: '2022-11-10',
          status: 'on_leave',
          created_at: '2022-11-10T00:00:00Z',
          updated_at: '2022-11-10T00:00:00Z'
        }
      ]

      // Apply filters
      let filteredEmployees = mockEmployees
      if (searchTerm) {
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      if (statusFilter) {
        filteredEmployees = filteredEmployees.filter(emp => emp.status === statusFilter)
      }
      if (departmentFilter) {
        filteredEmployees = filteredEmployees.filter(emp => emp.department === departmentFilter)
      }

      setEmployees(filteredEmployees)
      setTotalEmployees(filteredEmployees.length)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const mockDepartments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
      setDepartments(mockDepartments)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchPositions = async () => {
    try {
      const mockPositions = ['Software Developer', 'Senior Developer', 'Marketing Manager', 'Sales Representative', 'HR Manager']
      setPositions(mockPositions)
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      hireDate: '',
      status: 'active'
    })
    setEditingEmployee(null)
  }

  const handleAddEmployee = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setFormData({
      employeeId: employee.employee_id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || '',
      position: employee.position || '',
      hireDate: employee.hire_date || '',
      status: employee.status
    })
    setEditingEmployee(employee)
    setShowAddModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      console.log('Submitting employee:', formData)
      
      // Close modal and refresh list
      setShowAddModal(false)
      resetForm()
      fetchEmployees()
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'inactive':
        return <Badge variant="default">Inactive</Badge>
      case 'on_leave':
        return <Badge variant="warning">On Leave</Badge>
      case 'terminated':
        return <Badge variant="error">Terminated</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Layout>
        <Loading text="Loading employees..." size="lg" />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Employees</h1>
            <p className="text-neutral-600 mt-1">
              Manage your team members and their information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={Upload}
              onClick={() => console.log('Import CSV')}
            >
              Import CSV
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => console.log('Export data')}
            >
              Export
            </Button>
            <Button
              icon={Plus}
              onClick={handleAddEmployee}
            >
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
              <div className="flex gap-4">
                <select
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
                <select
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Employees ({totalEmployees})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-neutral-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            ID: {employee.employee_id}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {employee.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-4 h-4 text-neutral-400" />
                              <span>{employee.email}</span>
                            </div>
                          )}
                          {employee.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-4 h-4 text-neutral-400" />
                              <span>{employee.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-600">
                        {employee.department || '-'}
                      </td>
                      <td className="py-4 px-4 text-neutral-600">
                        {employee.position || '-'}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(employee.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditEmployee(employee)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => console.log('Delete employee:', employee.id)}
                            className="text-error-600 hover:text-error-700"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {employees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No employees found</h3>
                  <p className="text-neutral-600 mb-4">Get started by adding your first employee.</p>
                  <Button onClick={handleAddEmployee}>Add Employee</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Employee Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Department
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Position
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleInputChange('hireDate', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}