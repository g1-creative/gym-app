'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartDataPoint } from '@/types'
import { format } from 'date-fns'
import { kgToLbs } from '@/lib/utils/weight'

interface ExerciseChartProps {
  data: ChartDataPoint[]
  dataKey: 'weight' | 'reps' | 'volume' | 'estimated1RM'
  title: string
  color?: string
}

export function ExerciseChart({ data, dataKey, title, color = '#ffffff' }: ExerciseChartProps) {
  // Convert weight-based data to lbs for display
  const formattedData = data.map((point) => {
    const converted: any = {
      ...point,
      date: format(new Date(point.date), 'MMM d'),
    }
    
    // Convert weight, volume, and estimated1RM from kg to lbs
    if (dataKey === 'weight' && point.weight !== null) {
      converted.weight = kgToLbs(point.weight)
    }
    if (dataKey === 'volume' && point.volume !== null) {
      converted.volume = kgToLbs(point.volume)
    }
    if (dataKey === 'estimated1RM' && point.estimated1RM !== null) {
      converted.estimated1RM = kgToLbs(point.estimated1RM)
    }
    
    return converted
  })

  const formatTooltipValue = (value: number | null) => {
    if (value === null) return 'N/A'
    if (dataKey === 'weight' || dataKey === 'volume' || dataKey === 'estimated1RM') {
      return `${value.toFixed(1)} lbs`
    }
    return value.toString()
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            stroke="#71717a"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => formatTooltipValue(value)}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


