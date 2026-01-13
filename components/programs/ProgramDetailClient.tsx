'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { updateProgram, deleteProgram } from '@/app/actions/programs'
import { createWorkout, updateWorkout, deleteWorkout } from '@/app/actions/workouts'
import { createSession } from '@/app/actions/sessions'
import { Plus, Edit, Trash2, Play, Save, X, Calendar, Clock } from 'lucide-react'

interface ProgramDetailClientProps {
  program: any
  workouts: any[]
}

export function ProgramDetailClient({ program: initialProgram, workouts: initialWorkouts }: ProgramDetailClientProps) {
  const [program, setProgram] = useState(initialProgram)
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [isEditingProgram, setIsEditingProgram] = useState(false)
  const [programName, setProgramName] = useState(program.name)
  const [programDescription, setProgramDescription] = useState(program.description || '')
  const [isActive, setIsActive] = useState(program.is_active)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<any>(null)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDescription, setWorkoutDescription] = useState('')
  const [restTimerSeconds, setRestTimerSeconds] = useState(90)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSaveProgram = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('name', programName)
        formData.append('description', programDescription)
        formData.append('is_active', isActive.toString())
        
        const updated = await updateProgram(program.id, formData)
        setProgram(updated)
        setIsEditingProgram(false)
      } catch (error) {
        console.error('Error updating program:', error)
        alert('Failed to update program')
      }
    })
  }

  const handleDeleteProgram = async () => {
    if (confirm('Delete this program? This cannot be undone.')) {
      startTransition(async () => {
        try {
          await deleteProgram(program.id)
          router.push('/programs')
          router.refresh()
        } catch (error) {
          console.error('Error deleting program:', error)
          alert('Failed to delete program')
        }
      })
    }
  }

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('program_id', program.id)
        formData.append('name', workoutName)
        formData.append('description', workoutDescription)
        formData.append('rest_timer_seconds', restTimerSeconds.toString())

        if (editingWorkout) {
          const updated = await updateWorkout(editingWorkout.id, formData) as any
          // Update local state immediately
          setWorkouts((prev) =>
            prev.map((w) => (w.id === editingWorkout.id ? updated : w))
              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          )
        } else {
          const newWorkout = await createWorkout(formData) as any
          // Add to local state immediately and sort
          setWorkouts((prev) => {
            const updated = [...prev, newWorkout]
            return updated.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          })
        }

        setShowWorkoutForm(false)
        setEditingWorkout(null)
        setWorkoutName('')
        setWorkoutDescription('')
        setRestTimerSeconds(90)
      } catch (error) {
        console.error('Error saving workout:', error)
        alert('Failed to save workout')
      }
    })
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    if (confirm('Delete this workout?')) {
      startTransition(async () => {
        try {
          await deleteWorkout(workoutId)
          // Remove from local state immediately
          setWorkouts((prev) => prev.filter((w) => w.id !== workoutId))
        } catch (error) {
          console.error('Error deleting workout:', error)
          alert('Failed to delete workout')
        }
      })
    }
  }

  const handleStartWorkout = async (workoutId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('program_id', program.id)
        formData.append('workout_id', workoutId)
        
        await createSession(formData)
        router.push('/workout/active')
        router.refresh()
      } catch (error) {
        console.error('Error starting workout:', error)
        alert('Failed to start workout')
      }
    })
  }

  const startEditWorkout = (workout: any) => {
    setEditingWorkout(workout)
    setWorkoutName(workout.name)
    setWorkoutDescription(workout.description || '')
    setRestTimerSeconds(workout.rest_timer_seconds || 90)
    setShowWorkoutForm(true)
  }

  return (
    <PageLayout
      title={isEditingProgram ? 'Edit Program' : program.name}
      subtitle={program.is_active ? 'Active Program' : 'Inactive Program'}
      headerAction={
        <div className="flex gap-2">
          {isEditingProgram ? (
            <>
              <Button
                onClick={handleSaveProgram}
                disabled={isPending}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              >
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditingProgram(false)
                  setProgramName(program.name)
                  setProgramDescription(program.description || '')
                  setIsActive(program.is_active)
                }}
                variant="outline"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditingProgram(true)}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              >
                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Edit
              </Button>
              <Button
                onClick={handleDeleteProgram}
                disabled={isPending}
                variant="destructive"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Program Details */}
        {isEditingProgram ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">Name</label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">Description</label>
              <textarea
                value={programDescription}
                onChange={(e) => setProgramDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_active" className="text-xs sm:text-sm text-zinc-300">
                Active Program
              </label>
            </div>
          </div>
        ) : (
          program.description && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-zinc-400">{program.description}</p>
            </div>
          )
        )}

        {/* Workouts */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-300">Workouts</h2>
            {!showWorkoutForm && (
              <Button
                onClick={() => {
                  setShowWorkoutForm(true)
                  setEditingWorkout(null)
                  setWorkoutName('')
                  setWorkoutDescription('')
                  setRestTimerSeconds(90)
                }}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Add Workout
              </Button>
            )}
          </div>

          {showWorkoutForm && (
            <form onSubmit={handleSaveWorkout} className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">Workout Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">Rest Timer (seconds)</label>
                <input
                  type="number"
                  value={restTimerSeconds}
                  onChange={(e) => setRestTimerSeconds(parseInt(e.target.value) || 90)}
                  min="0"
                  max="600"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} className="flex-1 text-xs sm:text-sm">
                  {editingWorkout ? 'Update' : 'Create'} Workout
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowWorkoutForm(false)
                    setEditingWorkout(null)
                  }}
                  variant="outline"
                  className="text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {workouts.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-zinc-400 mb-4">No workouts yet</p>
              <Button
                onClick={() => setShowWorkoutForm(true)}
                className="text-xs sm:text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{workout.name}</h3>
                        {workout.description && (
                          <p className="text-xs sm:text-sm text-zinc-400 truncate">{workout.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          <span className="text-[10px] sm:text-xs text-zinc-500">
                            {workout.rest_timer_seconds || 90}s rest
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleStartWorkout(workout.id)}
                        disabled={isPending}
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto bg-black hover:bg-zinc-900 text-white"
                      >
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        onClick={() => startEditWorkout(workout)}
                        variant="outline"
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        disabled={isPending}
                        variant="destructive"
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

