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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Select Exercise</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showCreateForm ? (
            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g., Bench Press"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewExerciseName('')
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create New Exercise
              </button>

              {isLoading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
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
                      className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                        <div className="text-sm text-slate-400">
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

