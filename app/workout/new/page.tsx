import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveSession } from '@/app/actions/sessions'
import { getPrograms } from '@/app/actions/programs'
import { NewWorkoutClient } from '@/components/workout/NewWorkoutClient'

export default async function NewWorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [activeSession, programs] = await Promise.all([
    getActiveSession(),
    getPrograms(),
  ])

  if (activeSession) {
    redirect('/workout/active')
  }

  return <NewWorkoutClient programs={programs} />
}


