import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UsersIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const AIAnalysisResults = ({ analysisData }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [language, setLanguage] = useState('en')

  // Mock comprehensive analysis data
  const mockAnalysis = {
    overview: {
      completenessScore: 78.5,
      complianceScore: 85.2,
      feasibilityScore: 72.8,
      overallRiskLevel: 'Medium',
      processingTime: '2.3 seconds',
      documentsProcessed: 5,
      pagesAnalyzed: 127
    },
    inconsistencies: [
      {
        type: 'Budget Mismatch',
        severity: 'High',
        description: 'Construction cost estimates exceed allocated budget by 15%',
        location: 'Section 4.2 - Financial Projections',
        aiConfidence: 92,
        recommendation: 'Review budget allocation and seek additional funding approval'
      },
      {
        type: 'Timeline Conflict',
        severity: 'Medium',
        description: 'Environmental clearance timeline overlaps with construction start date',
        location: 'Section 3.1 - Project Schedule',
        aiConfidence: 87,
        recommendation: 'Adjust project timeline to account for clearance procedures'
      },
      {
        type: 'Resource Allocation',
        severity: 'Low',
        description: 'Skilled labor requirements may exceed local availability',
        location: 'Section 5.3 - Human Resources',
        aiConfidence: 74,
        recommendation: 'Consider hiring from neighboring regions or provide training'
      }
    ],
    riskPredictions: [
      {
        category: 'Cost Overrun',
        probability: 65,
        impact: 'High',
        estimatedDelay: '2-3 months',
        mitigationStrategies: [
          'Implement strict budget monitoring',
          'Regular vendor negotiations',
          'Consider phased implementation'
        ]
      },
      {
        category: 'Schedule Delay',
        probability: 40,
        impact: 'Medium',
        estimatedDelay: '1-2 months',
        mitigationStrategies: [
          'Parallel processing of approvals',
          'Backup contractor identification',
          'Weather contingency planning'
        ]
      },
      {
        category: 'Environmental Issues',
        probability: 25,
        impact: 'High',
        estimatedDelay: '3-6 months',
        mitigationStrategies: [
          'Comprehensive environmental assessment',
          'Stakeholder engagement program',
          'Alternative location analysis'
        ]
      }
    ],
    compliance: {
      overallScore: 85.2,
      categories: [
        { name: 'Environmental', score: 78, status: 'Needs Attention' },
        { name: 'Financial', score: 92, status: 'Compliant' },
        { name: 'Technical', score: 88, status: 'Compliant' },
        { name: 'Legal', score: 82, status: 'Minor Issues' },
        { name: 'Social', score: 79, status: 'Needs Attention' }
      ]
    },
    trends: [
      { month: 'Jan', issues: 12, resolved: 8 },
      { month: 'Feb', issues: 15, resolved: 12 },
      { month: 'Mar', issues: 18, resolved: 14 },
      { month: 'Apr', issues: 14, resolved: 16 },
      { month: 'May', issues: 11, resolved: 15 },
      { month: 'Jun', issues: 9, resolved: 13 }
    ]
  }

  const analysis = analysisData || mockAnalysis

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'inconsistencies', name: 'Issues', icon: ExclamationTriangleIcon },
    { id: 'risks', name: 'Risk Predictions', icon: ClockIcon },
    { id: 'compliance', name: 'Compliance', icon: CheckCircleIcon }
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'bn', name: 'বাংলা' }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="space-y-6">
      {/* Header with Language Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Analysis Results
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive DPR evaluation powered by NLP and ML
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <GlobeAltIcon className="w-5 h-5 text-gray-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completeness Score
                    </p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis.overview.completenessScore)}`}>
                      {analysis.overview.completenessScore}%
                    </p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-primary-500" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Compliance Score
                    </p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis.overview.complianceScore)}`}>
                      {analysis.overview.complianceScore}%
                    </p>
                  </div>
                  <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Feasibility Score
                    </p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis.overview.feasibilityScore)}`}>
                      {analysis.overview.feasibilityScore}%
                    </p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Processing Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Processing Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {analysis.overview.documentsProcessed}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {analysis.overview.pagesAnalyzed}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {analysis.overview.processingTime}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Process Time</p>
                </div>
                <div className="text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysis.overview.overallRiskLevel)}`}>
                    {analysis.overview.overallRiskLevel} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Issue Resolution Trends
              </h3>
              <div className="h-80 min-h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <LineChart 
                    data={analysis.trends}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#F9FAFB' }}
                      cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="issues" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      name="Issues Detected"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      name="Issues Resolved"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inconsistencies' && (
          <div className="space-y-4">
            {analysis.inconsistencies.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {issue.type}
                      </h3>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {issue.description}
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong>Location:</strong> {issue.location}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong>AI Confidence:</strong> {issue.aiConfidence}%
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>Recommendation:</strong> {issue.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            {analysis.riskPredictions.map((risk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {risk.category}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Probability: {risk.probability}%
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(risk.impact)}`}>
                      {risk.impact} Impact
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Risk Assessment
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Probability</span>
                        <span className="text-sm font-medium">{risk.probability}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${risk.probability}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estimated Impact: {risk.estimatedDelay}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Mitigation Strategies
                    </h4>
                    <ul className="space-y-1">
                      {risk.mitigationStrategies.map((strategy, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Compliance Overview
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.compliance.overallScore)}`}>
                    {analysis.compliance.overallScore}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.compliance.categories.map((category, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                        {category.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          category.score >= 80 ? 'bg-green-500' :
                          category.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {category.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AIAnalysisResults