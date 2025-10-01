import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReports: 0,
    openIssues: 0,
    criticalIssues: 0,
    resolvedIssues: 0
  })

  // Mock data for development
  const mockReports = [
    {
      id: 'RPT-2023-001',
      project: 'Project Alpha',
      issueType: 'Budget Mismatch',
      description: 'Budget exceeds allocated funds by 15%',
      severity: 'High',
      date: '2023-08-15',
      status: 'Open'
    },
    {
      id: 'RPT-2023-002',
      project: 'Project Beta',
      issueType: 'Unrealistic Schedule',
      description: 'Project timeline is too short for the scope of work',
      severity: 'Medium',
      date: '2023-08-16',
      status: 'In Review'
    },
    {
      id: 'RPT-2023-003',
      project: 'Project Gamma',
      issueType: 'Resource Allocation',
      description: 'Insufficient resources allocated to critical tasks',
      severity: 'Low',
      date: '2023-08-17',
      status: 'Resolved'
    }
  ]

  // Fetch all reports
  const fetchReports = async () => {
    try {
      setLoading(true)
      // Temporarily use only mock data to avoid API issues
      console.log('Using mock data for development')
      setReports(mockReports)
      calculateStats(mockReports)
    } catch (error) {
      console.log('Error loading data, using mock data')
      setReports(mockReports)
      calculateStats(mockReports)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dashboard statistics
  const calculateStats = (reportsData) => {
    const stats = {
      totalReports: reportsData.length,
      openIssues: reportsData.filter(r => r.status === 'Open').length,
      criticalIssues: reportsData.filter(r => r.severity === 'High').length,
      resolvedIssues: reportsData.filter(r => r.status === 'Resolved').length
    }
    setStats(stats)
  }

  // Create new report
  const createReport = async (reportData) => {
    try {
      // Create new report locally for development
      const newReport = {
        id: `RPT-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        ...reportData,
        status: 'Open',
        date: new Date().toISOString()
      }
      setReports(prev => [newReport, ...prev])
      calculateStats([newReport, ...reports])
      toast.success('Report created successfully!')
      return newReport
    } catch (error) {
      toast.error('Failed to create report')
      throw error
    }
  }

  // Update report
  const updateReport = async (id, updates) => {
    try {
      // Update report locally for development
      const updatedReport = { ...reports.find(r => r.id === id), ...updates }
      setReports(prev => prev.map(r => r.id === id ? updatedReport : r))
      calculateStats(reports.map(r => r.id === id ? updatedReport : r))
      toast.success('Report updated successfully!')
      return updatedReport
    } catch (error) {
      toast.error('Failed to update report')
      throw error
    }
  }

  // Delete report
  const deleteReport = async (id) => {
    try {
      // Delete report locally for development
      const newReports = reports.filter(r => r.id !== id)
      setReports(newReports)
      calculateStats(newReports)
      toast.success('Report deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete report')
      throw error
    }
  }

  // Filter reports
  const filterReports = (filters) => {
    let filtered = [...reports]
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(report => 
        report.project.toLowerCase().includes(searchTerm) ||
        report.description.toLowerCase().includes(searchTerm) ||
        report.id.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.issueType && filters.issueType !== 'all') {
      filtered = filtered.filter(report => report.issueType === filters.issueType)
    }
    
    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter(report => report.severity === filters.severity)
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status)
    }
    
    return filtered
  }

  // Load data on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const value = {
    reports,
    stats,
    loading,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    filterReports
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}