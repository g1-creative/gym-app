import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getExercises } from '@/app/actions/exercises'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Track your workout progress, view exercise statistics, and monitor your fitness journey',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const exercises = await getExercises()

  return <AnalyticsClient exercises={exercises} />
}


