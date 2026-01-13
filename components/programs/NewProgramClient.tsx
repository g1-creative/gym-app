'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { createProgram } from '@/app/actions/programs'
import { Program } from '@/types'
import { Save, X } from 'lucide-react'

export function NewProgramClient() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Please enter a program name')
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('name', name.trim())
        formData.append('description', description.trim() || '')
        formData.append('is_active', isActive.toString())
        
        const newProgram = await createProgram(formData) as Program
        router.push(`/programs/${newProgram.id}`)
        router.refresh()
      } catch (error) {
        console.error('Error creating program:', error)
        alert('Failed to create program. Please try again.')
      }
    })
  }

  return (
    <PageLayout
      title="New Program"
      subtitle="Create a new training program"
      headerAction={
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-auto"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
              Program Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Push/Pull/Legs"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Optional description of your program..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
              Set as active program
            </label>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <Button
            type="submit"
            disabled={isPending || !name.trim()}
            className="flex-1 text-xs sm:text-sm"
          >
            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            {isPending ? 'Creating...' : 'Create Program'}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="text-xs sm:text-sm"
          >
            Cancel
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}

