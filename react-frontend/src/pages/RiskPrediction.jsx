import React from 'react'
import { motion } from 'framer-motion'

const RiskPrediction = () => {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate"
          >
            Risk Prediction
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            AI-powered risk analysis and predictions
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-8 text-center"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          AI Risk Prediction Engine
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Our AI models are analyzing your project data to provide predictive insights 
          and early warning systems for potential risks.
        </p>
      </motion.div>
    </div>
  )
}

export default RiskPrediction