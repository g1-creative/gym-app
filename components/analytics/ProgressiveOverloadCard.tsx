'use client'

import { ProgressiveOverloadComparison } from '@/types'

interface ProgressiveOverloadCardProps {
  comparison: ProgressiveOverloadComparison
}

export function ProgressiveOverloadCard({ comparison }: ProgressiveOverloadCardProps) {
  const getStatusColor = () => {
    switch (comparison.status) {
      case 'improved':
        return 'text-green-400'
      case 'regressed':
        return 'text-red-400'
      case 'maintained':
        return 'text-yellow-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusIcon = () => {
    switch (comparison.status) {
      case 'improved':
        return '↑'
      case 'regressed':
        return '↓'
      case 'maintained':
        return '→'
      default:
        return '•'
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{comparison.exerciseName}</h3>
        <span className={`text-2xl ${getStatusColor()}`}>{getStatusIcon()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Current */}
        <div>
          <div className="text-sm text-slate-400 mb-1">Current</div>
          <div className="text-lg font-semibold">
            {comparison.current.weight && comparison.current.reps
              ? `${comparison.current.weight}kg × ${comparison.current.reps}`
              : 'N/A'}
          </div>
          {comparison.current.volume && (
            <div className="text-sm text-primary-400">
              {comparison.current.volume.toFixed(0)} kg volume
            </div>
          )}
        </div>

        {/* Last Session */}
        <div>
          <div className="text-sm text-slate-400 mb-1">Last Session</div>
          {comparison.lastSession.date ? (
            <>
              <div className="text-lg font-semibold">
                {comparison.lastSession.weight && comparison.lastSession.reps
                  ? `${comparison.lastSession.weight}kg × ${comparison.lastSession.reps}`
                  : 'N/A'}
              </div>
              {comparison.lastSession.volume && (
                <div className="text-sm text-slate-400">
                  {comparison.lastSession.volume.toFixed(0)} kg
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500">No previous session</div>
          )}
        </div>

        {/* Weekly Average */}
        <div>
          <div className="text-sm text-slate-400 mb-1">Weekly Avg</div>
          {comparison.weeklyAverage.weight ? (
            <>
              <div className="text-lg font-semibold">
                {comparison.weeklyAverage.weight.toFixed(1)}kg ×{' '}
                {comparison.weeklyAverage.reps?.toFixed(1)}
              </div>
              {comparison.weeklyAverage.volume && (
                <div className="text-sm text-slate-400">
                  {comparison.weeklyAverage.volume.toFixed(0)} kg
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500">No data</div>
          )}
        </div>

        {/* All-Time PR */}
        <div>
          <div className="text-sm text-slate-400 mb-1">All-Time PR</div>
          {comparison.allTimePR.date ? (
            <>
              <div className="text-lg font-semibold">
                {comparison.allTimePR.weight && comparison.allTimePR.reps
                  ? `${comparison.allTimePR.weight}kg × ${comparison.allTimePR.reps}`
                  : 'N/A'}
              </div>
              {comparison.allTimePR.volume && (
                <div className="text-sm text-primary-400">
                  {comparison.allTimePR.volume.toFixed(0)} kg
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500">No PR yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

