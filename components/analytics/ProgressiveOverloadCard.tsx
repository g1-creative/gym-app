'use client'

import { ProgressiveOverloadComparison } from '@/types'
import { formatWeight, formatVolume } from '@/lib/utils/weight'

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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">{comparison.exerciseName}</h3>
        <span className={`text-2xl ${getStatusColor()}`}>{getStatusIcon()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Current */}
        <div>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1.5">Current</div>
          <div className="text-base sm:text-lg font-semibold text-white">
            {comparison.current.weight && comparison.current.reps
              ? `${formatWeight(comparison.current.weight)} × ${comparison.current.reps}`
              : 'N/A'}
          </div>
          {comparison.current.volume && (
            <div className="text-xs sm:text-sm text-white/70 mt-1">
              {formatVolume(comparison.current.volume)} volume
            </div>
          )}
        </div>

        {/* Last Session */}
        <div>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1.5">Last Session</div>
          {comparison.lastSession.date ? (
            <>
              <div className="text-base sm:text-lg font-semibold text-white">
                {comparison.lastSession.weight && comparison.lastSession.reps
                  ? `${formatWeight(comparison.lastSession.weight)} × ${comparison.lastSession.reps}`
                  : 'N/A'}
              </div>
              {comparison.lastSession.volume && (
                <div className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {formatVolume(comparison.lastSession.volume)}
                </div>
              )}
            </>
          ) : (
            <div className="text-zinc-500 text-sm">No previous session</div>
          )}
        </div>

        {/* Weekly Average */}
        <div>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1.5">Weekly Avg</div>
          {comparison.weeklyAverage.weight ? (
            <>
              <div className="text-base sm:text-lg font-semibold text-white">
                {formatWeight(comparison.weeklyAverage.weight)} ×{' '}
                {comparison.weeklyAverage.reps?.toFixed(1)}
              </div>
              {comparison.weeklyAverage.volume && (
                <div className="text-xs sm:text-sm text-zinc-400 mt-1">
                  {formatVolume(comparison.weeklyAverage.volume)}
                </div>
              )}
            </>
          ) : (
            <div className="text-zinc-500 text-sm">No data</div>
          )}
        </div>

        {/* All-Time PR */}
        <div>
          <div className="text-xs sm:text-sm text-zinc-400 mb-1.5">All-Time PR</div>
          {comparison.allTimePR.date ? (
            <>
              <div className="text-base sm:text-lg font-semibold text-white">
                {comparison.allTimePR.weight && comparison.allTimePR.reps
                  ? `${formatWeight(comparison.allTimePR.weight)} × ${comparison.allTimePR.reps}`
                  : 'N/A'}
              </div>
              {comparison.allTimePR.volume && (
                <div className="text-xs sm:text-sm text-white/70 mt-1">
                  {formatVolume(comparison.allTimePR.volume)}
                </div>
              )}
            </>
          ) : (
            <div className="text-zinc-500 text-sm">No PR yet</div>
          )}
        </div>
      </div>
    </div>
  )
}


