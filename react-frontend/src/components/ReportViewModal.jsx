import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PaperClipIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const ReportViewModal = ({ isOpen, onClose, report, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(report || {})
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    if (report) {
      setEditData(report)
    }
  }, [report])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onUpdate(report.id, editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating report:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      onDelete(report.id)
      onClose()
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
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
      case 'In Progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'High':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
      case 'Medium':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'Low':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  if (!isOpen || !report) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Report' : 'Report Details'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Edit Report"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    title="Delete Report"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Info Bar */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                  {report.severity}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getPriorityIcon(report.priority)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {report.priority} Priority
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Created {new Date(report.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="title"
                      value={editData.title || report.project}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.title || report.project}
                    </h3>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editData.description || report.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="input-field resize-none"
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {report.description || 'No description provided.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Issue Type and Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Issue Type
                    </label>
                    {isEditing ? (
                      <select
                        name="issueType"
                        value={editData.issueType || report.issueType}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="Budget Mismatch">Budget Mismatch</option>
                        <option value="Unrealistic Schedule">Unrealistic Schedule</option>
                        <option value="Resource Allocation">Resource Allocation</option>
                        <option value="Technical Risk">Technical Risk</option>
                        <option value="Compliance Issue">Compliance Issue</option>
                        <option value="Quality Concern">Quality Concern</option>
                        <option value="Environmental Impact">Environmental Impact</option>
                        <option value="Safety Issue">Safety Issue</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">
                        {report.issueType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    {isEditing ? (
                      <select
                        name="department"
                        value={editData.department || ''}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Construction">Construction</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {report.department || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                {report.attachments && report.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Attachments ({report.attachments.length})
                    </label>
                    <div className="space-y-2">
                      {report.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <PaperClipIcon className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {attachment.name}
                            </p>
                            {attachment.size && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                          <button className="text-primary-600 hover:text-primary-800 dark:text-primary-400">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Metadata */}
              <div className="space-y-6">
                {/* Status and Priority */}
                <div className="card p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Status & Priority
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Status
                      </label>
                      {isEditing ? (
                        <select
                          name="status"
                          value={editData.status || report.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        >
                          <option value="Open">Open</option>
                          <option value="In Review">In Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Severity
                      </label>
                      {isEditing ? (
                        <select
                          name="severity"
                          value={editData.severity || report.severity}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Priority
                      </label>
                      {isEditing ? (
                        <select
                          name="priority"
                          value={editData.priority || report.priority || 'Medium'}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(report.priority)}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {report.priority || 'Medium'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignment and Dates */}
                <div className="card p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Assignment & Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Assigned To
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="assignedTo"
                          value={editData.assignedTo || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                          placeholder="Enter assignee"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {report.assignedTo || 'Unassigned'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Due Date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dueDate"
                          value={editData.dueDate || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {report.dueDate ? new Date(report.dueDate).toLocaleDateString() : 'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Created
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="card p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Project Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {report.project}
                      </span>
                    </div>
                    {report.createdBy && (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Created by {report.createdBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditData(report)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <>
                    <div className="loading-spinner-sm mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ReportViewModal