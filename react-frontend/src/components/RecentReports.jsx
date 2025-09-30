import React from 'react'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'

const RecentReports = () => {
  const { reports } = useData()
  
  // Get the 5 most recent reports
  const recentReports = reports
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'text-red-500'
      case 'Medium':
        return 'text-yellow-500'
      case 'Low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  if (recentReports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No reports available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentReports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {report.project}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {report.issueType}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${getSeverityColor(report.severity)}`}>
              {report.severity}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(report.date).toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default RecentReports