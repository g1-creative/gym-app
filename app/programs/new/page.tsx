import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewProgramClient } from '@/components/programs/NewProgramClient'

export default async function NewProgramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <NewProgramClient />
}

