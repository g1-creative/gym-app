import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPremadePrograms } from '@/app/actions/premade-programs'
import { PremadeProgramsClient } from '@/components/programs/PremadeProgramsClient'
import { PageLayout } from '@/components/layout/PageLayout'

export default async function PremadeProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let premadePrograms = []
  try {
    premadePrograms = await getPremadePrograms()
  } catch (error) {
    console.error('Error loading premade programs:', error)
    // Continue with empty array
  }

  return (
    <PageLayout
      title="Premade Programs"
      subtitle={premadePrograms.length > 0 ? `${premadePrograms.length} ${premadePrograms.length === 1 ? 'program' : 'programs'} available` : 'No premade programs available'}
    >
      <PremadeProgramsClient programs={premadePrograms} />
    </PageLayout>
  )
}

