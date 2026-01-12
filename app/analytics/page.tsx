import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getExercises } from '@/app/actions/exercises'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const exercises = await getExercises()

  return <AnalyticsClient exercises={exercises} />
}

