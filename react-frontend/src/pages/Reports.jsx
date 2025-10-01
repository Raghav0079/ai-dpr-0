import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import CreateReportModal from '../components/CreateReportModal'
import ReportViewModal from '../components/ReportViewModal'

const Reports = () => {
  const { reports, loading, createReport, updateReport, deleteReport } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    issueType: 'all',
    severity: 'all',
    status: 'all'
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  // Filter and search reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports]
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(report => 
        report.project.toLowerCase().includes(term) ||
        report.description.toLowerCase().includes(term) ||
        report.id.toLowerCase().includes(term)
      )
    }
    
    // Apply filters
    if (filters.issueType !== 'all') {
      filtered = filtered.filter(report => report.issueType === filters.issueType)
    }
    
    if (filters.severity !== 'all') {
      filtered = filtered.filter(report => report.severity === filters.severity)
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status)
    }
    
    return filtered
  }, [reports, searchTerm, filters])

  // Report management functions
  const handleCreateReport = (reportData) => {
    console.log('Creating report:', reportData)
    // Here you would normally call your API
    // For now, just show success message
    alert(`Report "${reportData.title}" created successfully!`)
    // You could also add it to local state or refresh the data
  }

  const handleUpdateReport = (id, updates) => {
    console.log('Updating report:', id, updates)
    // Here you would normally call your API
    alert(`Report ${id} updated successfully!`)
    setShowViewModal(false)
  }

  const handleDeleteReport = (id) => {
    console.log('Deleting report:', id)
    // Here you would normally call your API
    alert(`Report ${id} deleted successfully!`)
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const handleEditReport = (report) => {
    setSelectedReport(report)
    setShowViewModal(true)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate"
          >
            Reports
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            Manage and analyze your project reports
          </motion.p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            File New Report
          </button>
          <button 
            className="btn-secondary flex items-center"
            onClick={() => alert('Bulk import functionality coming soon!')}
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reports, projects, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <select
              value={filters.issueType}
              onChange={(e) => setFilters({...filters, issueType: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Types</option>
              <option value="Budget Mismatch">Budget Mismatch</option>
              <option value="Unrealistic Schedule">Unrealistic Schedule</option>
              <option value="Resource Allocation">Resource Allocation</option>
            </select>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({...filters, severity: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-row-hover"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {report.project}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                      {report.issueType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditReport(report)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete report ${report.id}? This action cannot be undone.`)) {
                            handleDeleteReport(report.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filters.issueType !== 'all' || filters.severity !== 'all' || filters.status !== 'all' 
                ? 'No reports found matching your criteria.' 
                : 'No reports filed yet.'}
            </div>
            {(!searchTerm && filters.issueType === 'all' && filters.severity === 'all' && filters.status === 'all') && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                File Your First Report
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
        <div>
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
        </div>
        <div className="flex items-center space-x-4">
          <span>Need help?</span>
          <button 
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400"
            onClick={() => alert('Report filing guide will open here')}
          >
            Report Filing Guide
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateReportModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateReport}
      />
      
      <ReportViewModal 
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
        onUpdate={handleUpdateReport}
        onDelete={handleDeleteReport}
      />
    </div>
  )
}

export default Reports