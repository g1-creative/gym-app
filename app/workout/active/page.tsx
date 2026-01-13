import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveSession } from '@/app/actions/sessions'
import { ActiveWorkoutClient } from '@/components/workout/ActiveWorkoutClient'

export default async function ActiveWorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const session = await getActiveSession()

  if (!session) {
    redirect('/workout/new')
  }

  return <ActiveWorkoutClient session={session} />
}


