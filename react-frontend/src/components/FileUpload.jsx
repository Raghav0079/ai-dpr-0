import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentArrowUpIcon, 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useData } from '../contexts/DataContext'
import toast from 'react-hot-toast'

const FileUpload = ({ onFileProcessed }) => {
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const { createReport } = useData()

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  // Handle file input
  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  // Process uploaded files
  const handleFiles = async (files) => {
    setProcessing(true)
    const fileArray = Array.from(files)
    
    try {
      for (const file of fileArray) {
        // Simulate AI processing
        const result = await processFileWithAI(file)
        
        // Add to uploaded files list
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'processed',
          aiAnalysis: result
        }])

        // Create report from AI analysis
        if (result.shouldCreateReport) {
          await createReport({
            project: result.projectName || `Project from ${file.name}`,
            issueType: result.primaryIssue || 'Document Analysis',
            severity: result.riskLevel || 'Medium',
            description: result.summary || `AI analysis of ${file.name}`,
            status: 'Open'
          })
        }

        toast.success(`Successfully processed ${file.name}`)
      }
      
      if (onFileProcessed) {
        onFileProcessed(fileArray)
      }
    } catch (error) {
      toast.error('Error processing files')
      console.error('File processing error:', error)
    } finally {
      setProcessing(false)
    }
  }

  // Simulate AI processing of different file types
  const processFileWithAI = async (file) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    
    // Mock AI analysis results based on file type
    const mockResults = {
      'application/pdf': {
        projectName: `PDF Project ${Math.floor(Math.random() * 1000)}`,
        completenessScore: Math.random() * 100,
        complianceScore: Math.random() * 100,
        feasibilityScore: Math.random() * 100,
        primaryIssue: ['Budget Mismatch', 'Unrealistic Schedule', 'Resource Allocation'][Math.floor(Math.random() * 3)],
        riskLevel: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        inconsistencies: [
          'Budget allocation exceeds approved limits',
          'Timeline conflicts with resource availability',
          'Environmental clearance documentation incomplete'
        ],
        riskPredictions: [
          'Cost overrun probability: 65%',
          'Schedule delay risk: 40%',
          'Environmental compliance risk: 25%'
        ],
        summary: 'AI analysis detected potential budget inconsistencies and scheduling conflicts.',
        shouldCreateReport: true
      },
      'application/msword': {
        projectName: `Word Doc Project ${Math.floor(Math.random() * 1000)}`,
        completenessScore: Math.random() * 100,
        complianceScore: Math.random() * 100,
        feasibilityScore: Math.random() * 100,
        primaryIssue: 'Document Analysis',
        riskLevel: 'Medium',
        summary: 'Document structure analysis completed with NLP processing.',
        shouldCreateReport: true
      },
      'image/': {
        projectName: `Scanned Document ${Math.floor(Math.random() * 1000)}`,
        completenessScore: Math.random() * 100,
        ocrConfidence: Math.random() * 100,
        primaryIssue: 'Document Quality',
        riskLevel: 'Low',
        summary: 'OCR processing completed. Text extraction and analysis performed.',
        shouldCreateReport: true
      }
    }

    // Return appropriate mock result based on file type
    if (fileType.includes('pdf')) {
      return mockResults['application/pdf']
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return mockResults['application/msword']
    } else if (fileType.includes('image')) {
      return mockResults['image/']
    } else {
      return {
        projectName: `Unknown Format ${Math.floor(Math.random() * 1000)}`,
        summary: 'File format analysis completed.',
        shouldCreateReport: false
      }
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return DocumentTextIcon
    if (fileType.includes('image')) return PhotoIcon
    return DocumentArrowUpIcon
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.bmp"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
            <CloudArrowUpIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Upload DPR Documents
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag and drop files here, or click to select
              </p>
            </label>
          </div>
          
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Supported formats: PDF, Word (.doc, .docx), Images (.jpg, .png, .tiff)
          </div>
        </div>
      </motion.div>

      {/* Processing Indicator */}
      {processing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="loading-spinner"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Processing in Progress
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                Analyzing documents with NLP and ML algorithms...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Processed Documents
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type)
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <FileIcon className="w-6 h-6 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {file.aiAnalysis && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-700 dark:text-green-300">
                                AI Analysis Complete
                              </span>
                            </div>
                            
                            {file.aiAnalysis.completenessScore && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Completeness: {file.aiAnalysis.completenessScore.toFixed(1)}%
                              </div>
                            )}
                            
                            {file.aiAnalysis.inconsistencies && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                  Detected Issues:
                                </p>
                                <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-1">
                                  {file.aiAnalysis.inconsistencies.slice(0, 2).map((issue, idx) => (
                                    <li key={idx} className="flex items-start space-x-1">
                                      <ExclamationTriangleIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span>{issue}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default FileUpload