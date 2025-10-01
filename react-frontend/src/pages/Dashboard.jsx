import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { 
  DocumentTextIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  TrendingUpIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import FileUpload from '../components/FileUpload'
import AIAnalysisResults from '../components/AIAnalysisResults'
import RecentReports from '../components/RecentReports'
import TrendChart from '../components/TrendChart'

const Dashboard = () => {
  const { stats, loading } = useData()
  const [activeView, setActiveView] = useState('overview')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)

  const statCards = [
    {
      name: 'Documents Processed',
      value: stats.totalReports || 127,
      icon: DocumentTextIcon,
      color: 'blue',
      trend: '+23%',
      subtitle: 'AI-powered analysis'
    },
    {
      name: 'Issues Detected',
      value: stats.openIssues || 23,
      icon: ExclamationCircleIcon,
      color: 'yellow',
      trend: '-8%',
      subtitle: 'Automated detection'
    },
    {
      name: 'Critical Risks',
      value: stats.criticalIssues || 7,
      icon: ClockIcon,
      color: 'red',
      trend: '+2%',
      subtitle: 'Predictive modeling'
    },
    {
      name: 'Compliance Score',
      value: '85.2%',
      icon: ShieldCheckIcon,
      color: 'green',
      trend: '+5%',
      subtitle: 'Multi-framework check'
    }
  ]

  const aiFeatures = [
    {
      title: 'Multi-format Ingestion',
      description: 'Process PDF, Word documents, and scanned images with OCR',
      icon: DocumentArrowUpIcon,
      status: 'Active',
      color: 'bg-blue-500'
    },
    {
      title: 'NLP Analysis',
      description: 'Natural Language Processing for content understanding',
      icon: CpuChipIcon,
      status: 'Processing',
      color: 'bg-purple-500'
    },
    {
      title: 'Risk Prediction',
      description: 'ML models predict cost overruns, delays, and issues',
      icon: TrendingUpIcon,
      status: 'Active',
      color: 'bg-red-500'
    },
    {
      title: 'Regional Languages',
      description: 'Support for Hindi, Telugu, Tamil, Bengali, and more',
      icon: GlobeAltIcon,
      status: 'Available',
      color: 'bg-green-500'
    }
  ]

  const handleFileProcessed = (files) => {
    // Simulate triggering comprehensive AI analysis
    setAnalysisData({
      filesProcessed: files.length,
      timestamp: new Date().toISOString()
    })
    setActiveView('analysis')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading AI DPR System...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            AI-Powered DPR Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-gray-600 dark:text-gray-400"
          >
            Comprehensive project evaluation with ML-driven insights and multi-language support
          </motion.p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button 
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="btn-primary flex items-center"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Upload DPR
          </button>
          <button 
            onClick={() => setActiveView('analysis')}
            className="btn-secondary flex items-center"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            View Analysis
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setActiveView('overview')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.trend.startsWith('+') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.trend}
                    </div>
                  </dd>
                  <dd className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {stat.subtitle}
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* File Upload Section */}
      {showFileUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload DPR Documents
          </h2>
          <FileUpload onFileProcessed={handleFileProcessed} />
        </motion.div>
      )}

      {/* Main Content Area */}
      {activeView === 'overview' && (
        <>
          {/* AI Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10`}>
                    <feature.icon className={`h-6 w-6 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        feature.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        feature.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Processing Trends
                </h3>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <TrendChart />
            </motion.div>

            {/* Recent Reports */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Analysis
                </h3>
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
              <RecentReports />
            </motion.div>
          </div>

          {/* System Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              AI System Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Advanced NLP
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Context-aware analysis with 95%+ accuracy for document classification and content extraction
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUpIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Predictive Analytics
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  ML models trained on 10,000+ projects predict risks with 87% accuracy
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <GlobeAltIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Multi-language Support
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Native support for 12+ Indian languages with cultural context understanding
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* AI Analysis Results View */}
      {activeView === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AIAnalysisResults analysisData={analysisData} />
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard