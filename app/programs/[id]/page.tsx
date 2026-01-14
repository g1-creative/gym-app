import { redirect, notFound } from 'next/navigation'
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
      notFound()
    }

    return <ProgramDetailClient program={program} workouts={workouts} />
  } catch (error) {
    // Program not found or deleted - redirect to programs list
    redirect('/programs')
  }
}

