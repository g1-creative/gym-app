'use client'

import { useState, useEffect } from 'react'
import { searchExercises } from '@/app/actions/exercises'
import { createExercise } from '@/app/actions/exercises'
import { Exercise } from '@/types'
import { X, Search, Plus } from 'lucide-react'

interface ExerciseSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (exerciseId: string) => void
}

export function ExerciseSelector({ isOpen, onClose, onSelect }: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')

  useEffect(() => {
    if (isOpen && searchQuery) {
      const timeoutId = setTimeout(() => {
        handleSearch()
      }, 300)
      return () => clearTimeout(timeoutId)
    } else if (isOpen && !searchQuery) {
      handleSearch()
    }
  }, [searchQuery, isOpen])

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const results = searchQuery
        ? await searchExercises(searchQuery)
        : await searchExercises('')
      setExercises(results as Exercise[])
    } catch (error) {
      console.error('Error searching exercises:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExerciseName.trim()) return

    try {
      const formData = new FormData()
      formData.append('name', newExerciseName.trim())
      formData.append('is_custom', 'true')
      
      const newExercise = await createExercise(formData) as Exercise
      onSelect(newExercise.id)
      setNewExerciseName('')
      setShowCreateForm(false)
      onClose()
    } catch (error) {
      console.error('Error creating exercise:', error)
      alert('Failed to create exercise')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg sm:rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-zinc-800">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Select Exercise</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {showCreateForm ? (
            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g., Bench Press"
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-zinc-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-zinc-900 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewExerciseName('')
                  }}
                  className="px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full mb-4 px-4 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-white flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Create New Exercise
              </button>

              {isLoading ? (
                <div className="text-center py-8 text-zinc-400 text-sm">Loading...</div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  {searchQuery ? 'No exercises found' : 'Start typing to search'}
                </div>
              ) : (
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => {
                        onSelect(exercise.id)
                        onClose()
                      }}
                      className="w-full text-left px-3 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-sm text-white">{exercise.name}</div>
                      {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {exercise.muscle_groups.join(', ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

