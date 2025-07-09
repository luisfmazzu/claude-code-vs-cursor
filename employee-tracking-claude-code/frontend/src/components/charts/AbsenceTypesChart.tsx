import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface AbsenceType {
  type: string
  count: number
  percentage: number
}

interface AbsenceTypesChartProps {
  data: AbsenceType[]
  height?: number
}

const AbsenceTypesChart: React.FC<AbsenceTypesChartProps> = ({ data, height = 300 }) => {
  const colors = ['#B19CD9', '#A8D8EA', '#28A745', '#FD7E14', '#DC3545', '#6C757D']

  const renderLabel = (entry: AbsenceType) => {
    return `${entry.percentage}%`
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name, props) => [
            `${value} (${props.payload.percentage}%)`,
            'Count'
          ]}
          labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)} Leave`}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default AbsenceTypesChart