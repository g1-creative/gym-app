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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-700 transition-colors">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-white flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#52525b"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            stroke="#52525b"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              color: '#fff',
              padding: '12px',
            }}
            formatter={(value: any) => formatTooltipValue(value)}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '13px', color: '#a1a1aa', paddingTop: '16px' }} 
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4, strokeWidth: 2, stroke: '#18181b' }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


