import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProgram } from '@/app/actions/programs'
import { getWorkoutsForProgram } from '@/app/actions/workouts'
import { ProgramDetailClient } from '@/components/programs/ProgramDetailClient'

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  try {
    const [program, workouts] = await Promise.all([
      getProgram(params.id),
      getWorkoutsForProgram(params.id),
    ])

    if (!program) {
      redirect('/programs')
    }

    return <ProgramDetailClient program={program} workouts={workouts} />
  } catch (error: any) {
    // Log error for debugging
    console.error('[PROGRAM PAGE] Error loading program:', {
      error: error?.message,
      programId: params.id,
      code: error?.code
    })
    
    // Program not found, deleted, or error - redirect to programs list
    redirect('/programs')
  }
}

