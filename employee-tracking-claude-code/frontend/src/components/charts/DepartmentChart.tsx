import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface DepartmentData {
  department: string
  totalEmployees: number
  absentToday: number
  absenteeismRate: number
}

interface DepartmentChartProps {
  data: DepartmentData[]
  height?: number
}

const DepartmentChart: React.FC<DepartmentChartProps> = ({ data, height = 300 }) => {
  const colors = ['#B19CD9', '#A8D8EA', '#28A745', '#FD7E14', '#DC3545', '#6C757D']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="department" 
          stroke="#666"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={60}
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
          formatter={(value, name) => {
            if (name === 'absenteeismRate') {
              return [`${value}%`, 'Absenteeism Rate']
            }
            return [value, name === 'totalEmployees' ? 'Total Employees' : 'Absent Today']
          }}
        />
        <Bar dataKey="totalEmployees" name="totalEmployees" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default DepartmentChart