import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { seedPremadePrograms } from '@/app/actions/seed-premade-programs'
import { SeedProgramsClient } from '@/components/admin/SeedProgramsClient'

export default async function SeedProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // In production, you might want to check if user is admin
  // For now, any authenticated user can seed programs

  return <SeedProgramsClient />
}

