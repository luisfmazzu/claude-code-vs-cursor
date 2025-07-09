import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface TrendsData {
  labels: string[]
  absenteeism: number[]
  attendance: number[]
}

interface AbsenteeismChartProps {
  data: TrendsData
  height?: number
}

const AbsenteeismChart: React.FC<AbsenteeismChartProps> = ({ data, height = 300 }) => {
  // Transform data for recharts
  const chartData = data.labels.map((label, index) => ({
    date: label,
    absenteeism: data.absenteeism[index],
    attendance: data.attendance[index]
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="absenteeism"
          stroke="#B19CD9"
          strokeWidth={2}
          dot={{ fill: '#B19CD9', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Absenteeism %"
        />
        <Line
          type="monotone"
          dataKey="attendance"
          stroke="#28A745"
          strokeWidth={2}
          dot={{ fill: '#28A745', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Attendance %"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default AbsenteeismChart