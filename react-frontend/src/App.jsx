import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import RiskPrediction from './pages/RiskPrediction'

// Simple fallback components in case of errors
const SimpleDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1><p>Welcome to AI DPR Dashboard</p></div>
const SimpleReports = () => <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Reports page</p></div>
const SimpleAnalytics = () => <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Analytics page</p></div>
const SimpleRiskPrediction = () => <div className="p-6"><h1 className="text-2xl font-bold">Risk Prediction</h1><p>Risk Prediction page</p></div>

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Router>
        <ThemeProvider>
          <DataProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/risk-prediction" element={<RiskPrediction />} />
                <Route path="*" element={<SimpleDashboard />} />
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#374151',
                  color: '#F9FAFB',
                },
              }}
            />
          </DataProvider>
        </ThemeProvider>
      </Router>
    </div>
  )
}

export default App