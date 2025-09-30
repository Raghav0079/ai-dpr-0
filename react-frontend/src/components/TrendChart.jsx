import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TrendChart = () => {
  const data = [
    { name: 'Jan', issues: 4, resolved: 2 },
    { name: 'Feb', issues: 7, resolved: 5 },
    { name: 'Mar', issues: 8, resolved: 6 },
    { name: 'Apr', issues: 6, resolved: 8 },
    { name: 'May', issues: 9, resolved: 7 },
    { name: 'Jun', issues: 5, resolved: 9 },
  ]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="issues" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="New Issues"
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart