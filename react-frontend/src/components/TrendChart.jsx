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
    <div className="h-64 min-h-48 w-full">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <LineChart 
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name" 
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
            width={40}
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
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            name="New Issues"
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart