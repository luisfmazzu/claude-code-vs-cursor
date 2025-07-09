'use client'

import React, { useState, useRef } from 'react'
import Layout from '@/components/layout/Layout'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Modal,
  Badge,
  Loading
} from '@/components/ui'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  ArrowRight,
  Database
} from 'lucide-react'

interface CSVColumn {
  index: number
  header: string
  mappedTo: string
  confidence: number
  preview: string[]
}

interface CSVPreview {
  headers: string[]
  rows: string[][]
  totalRows: number
}

interface ImportResult {
  success: boolean
  imported: number
  errors: number
  warnings: string[]
}

export default function DataImportPage() {
  const [csvFile, setCSVFile] = useState<File | null>(null)
  const [csvPreview, setCSVPreview] = useState<CSVPreview | null>(null)
  const [columnMapping, setColumnMapping] = useState<CSVColumn[]>([])
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [aiMapping, setAiMapping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const expectedColumns = [
    { key: 'employeeId', label: 'Employee ID', required: true },
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'phone', label: 'Phone Number', required: false },
    { key: 'department', label: 'Department', required: false },
    { key: 'position', label: 'Position/Title', required: false },
    { key: 'startDate', label: 'Start Date', required: false },
    { key: 'status', label: 'Status', required: false },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCSVFile(file)
      parseCSVFile(file)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const parseCSVFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1, 11).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      ).filter(row => row.some(cell => cell.length > 0))

      setCSVPreview({
        headers,
        rows,
        totalRows: lines.length - 1
      })

      // Initialize column mapping
      const mapping = headers.map((header, index) => ({
        index,
        header,
        mappedTo: '',
        confidence: 0,
        preview: rows.map(row => row[index] || '').slice(0, 3)
      }))
      setColumnMapping(mapping)
    }
    reader.readAsText(file)
  }

  const handleAIMapping = async () => {
    if (!csvPreview) return

    try {
      setAiMapping(true)
      
      // Simulate AI API call
      console.log('AI mapping CSV columns:', csvPreview.headers)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock AI mapping results
      const aiMappedColumns = columnMapping.map(col => {
        const header = col.header.toLowerCase()
        let mappedTo = ''
        let confidence = 0

        if (header.includes('id') || header.includes('emp')) {
          mappedTo = 'employeeId'
          confidence = 0.95
        } else if (header.includes('first') || header.includes('fname')) {
          mappedTo = 'firstName'
          confidence = 0.9
        } else if (header.includes('last') || header.includes('lname')) {
          mappedTo = 'lastName'
          confidence = 0.9
        } else if (header.includes('email') || header.includes('mail')) {
          mappedTo = 'email'
          confidence = 0.95
        } else if (header.includes('phone') || header.includes('tel')) {
          mappedTo = 'phone'
          confidence = 0.85
        } else if (header.includes('dept') || header.includes('department')) {
          mappedTo = 'department'
          confidence = 0.9
        } else if (header.includes('title') || header.includes('position') || header.includes('job')) {
          mappedTo = 'position'
          confidence = 0.85
        } else if (header.includes('start') || header.includes('hire')) {
          mappedTo = 'startDate'
          confidence = 0.8
        } else if (header.includes('status') || header.includes('active')) {
          mappedTo = 'status'
          confidence = 0.8
        }

        return { ...col, mappedTo, confidence }
      })

      setColumnMapping(aiMappedColumns)
    } catch (error) {
      console.error('AI mapping failed:', error)
    } finally {
      setAiMapping(false)
    }
  }

  const handleManualMapping = (columnIndex: number, mappedTo: string) => {
    setColumnMapping(prev => 
      prev.map(col => 
        col.index === columnIndex 
          ? { ...col, mappedTo, confidence: 1.0 }
          : col
      )
    )
  }

  const handleImport = async () => {
    if (!csvFile || !columnMapping.length) return

    try {
      setImporting(true)
      
      // Simulate import process
      console.log('Importing CSV with mapping:', columnMapping)
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock import results
      setImportResult({
        success: true,
        imported: csvPreview?.totalRows || 0,
        errors: 0,
        warnings: []
      })

      // Reset form
      setCSVFile(null)
      setCSVPreview(null)
      setColumnMapping([])
      setShowMappingModal(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        imported: 0,
        errors: 1,
        warnings: ['Import failed due to server error']
      })
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      // Simulate export process
      console.log('Exporting employee data to CSV')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create mock CSV content
      const csvContent = `Employee ID,First Name,Last Name,Email,Phone,Department,Position,Start Date,Status
EMP001,John,Doe,john.doe@company.com,555-0123,Engineering,Software Developer,2023-01-15,Active
EMP002,Jane,Smith,jane.smith@company.com,555-0124,Marketing,Marketing Manager,2023-02-01,Active
EMP003,Bob,Johnson,bob.johnson@company.com,555-0125,Engineering,Senior Developer,2022-11-10,Active`

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="success">High</Badge>
    if (confidence >= 0.7) return <Badge variant="warning">Medium</Badge>
    if (confidence > 0) return <Badge variant="error">Low</Badge>
    return <Badge variant="default">Unknown</Badge>
  }

  const getMappingStatus = () => {
    const requiredMapped = expectedColumns
      .filter(col => col.required)
      .every(col => columnMapping.some(mapping => mapping.mappedTo === col.key))
    
    const totalMapped = columnMapping.filter(col => col.mappedTo).length
    
    return { requiredMapped, totalMapped }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Data Import/Export</h1>
            <p className="text-neutral-600 mt-1">
              Import employee data from CSV or export existing data
            </p>
          </div>
          <Button
            icon={Download}
            variant="outline"
            onClick={handleExport}
          >
            Export Data
          </Button>
        </div>

        {/* Import Result */}
        {importResult && (
          <Card className={importResult.success ? 'border-success-200' : 'border-error-200'}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-error-600" />
                )}
                <div>
                  <p className="font-medium text-neutral-900">
                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {importResult.success 
                      ? `Successfully imported ${importResult.imported} records`
                      : `Failed to import data. ${importResult.errors} errors occurred.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Import from CSV</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Upload CSV File
                </h3>
                <p className="text-neutral-600 mb-4">
                  Select a CSV file containing employee data to import
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                >
                  Choose File
                </Button>
              </div>

              {csvFile && (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-neutral-600" />
                      <div>
                        <p className="font-medium text-neutral-900">{csvFile.name}</p>
                        <p className="text-sm text-neutral-600">
                          {csvPreview?.totalRows} rows detected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => setShowPreviewModal(true)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => setShowMappingModal(true)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Required Columns</h4>
                <div className="space-y-2">
                  {expectedColumns.filter(col => col.required).map(col => (
                    <div key={col.key} className="flex items-center space-x-2">
                      <Badge variant="error" dot size="sm">Required</Badge>
                      <span className="text-sm text-neutral-700">{col.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Optional Columns</h4>
                <div className="space-y-2">
                  {expectedColumns.filter(col => !col.required).map(col => (
                    <div key={col.key} className="flex items-center space-x-2">
                      <Badge variant="default" dot size="sm">Optional</Badge>
                      <span className="text-sm text-neutral-700">{col.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSV Preview Modal */}
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="CSV Preview"
          size="xl"
        >
          {csvPreview && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border border-neutral-200">
                  <thead>
                    <tr className="bg-neutral-50">
                      {csvPreview.headers.map((header, index) => (
                        <th key={index} className="px-3 py-2 text-left text-sm font-medium text-neutral-900 border-b border-neutral-200">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-neutral-200">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-sm text-neutral-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-neutral-600">
                Showing first 10 rows of {csvPreview.totalRows} total rows
              </p>
            </div>
          )}
        </Modal>

        {/* Column Mapping Modal */}
        <Modal
          isOpen={showMappingModal}
          onClose={() => setShowMappingModal(false)}
          title="Map CSV Columns"
          size="xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-neutral-600">
                Map your CSV columns to the expected employee data fields
              </p>
              <Button
                variant="outline"
                onClick={handleAIMapping}
                loading={aiMapping}
                icon={aiMapping ? RefreshCw : Database}
              >
                AI Auto-Map
              </Button>
            </div>

            <div className="space-y-4">
              {columnMapping.map((column) => (
                <div key={column.index} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-neutral-900">{column.header}</p>
                        <p className="text-sm text-neutral-600">
                          Preview: {column.preview.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getConfidenceBadge(column.confidence)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-neutral-600">Map to:</span>
                    <select
                      className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={column.mappedTo}
                      onChange={(e) => handleManualMapping(column.index, e.target.value)}
                    >
                      <option value="">-- Select Field --</option>
                      {expectedColumns.map(col => (
                        <option key={col.key} value={col.key}>
                          {col.label} {col.required && '*'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-accent-600" />
                <span className="text-sm text-neutral-600">
                  {getMappingStatus().requiredMapped 
                    ? 'All required fields mapped' 
                    : 'Some required fields are missing'
                  }
                </span>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMappingModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  loading={importing}
                  disabled={!getMappingStatus().requiredMapped}
                >
                  Import Data
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}