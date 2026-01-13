import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPremadePrograms } from '@/app/actions/premade-programs'
import { autoSeedPremadePrograms } from '@/app/actions/auto-seed-premade'
import { PremadeProgramsClient } from '@/components/programs/PremadeProgramsClient'
import { PageLayout } from '@/components/layout/PageLayout'

export default async function PremadeProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Try to auto-seed if no programs exist
  let premadePrograms = []
  let seedError: string | null = null
  try {
    premadePrograms = await getPremadePrograms()
    
    // If no programs exist, try to auto-seed
    if (premadePrograms.length === 0) {
      const seedResult = await autoSeedPremadePrograms()
      if (seedResult.seeded) {
        // Re-fetch after seeding
        premadePrograms = await getPremadePrograms()
      } else if (seedResult.message) {
        seedError = seedResult.message
      }
    }
  } catch (error: any) {
    console.error('Error loading premade programs:', error)
    seedError = error.message || 'Unknown error occurred'
    // Continue with empty array
  }

  return (
    <PageLayout
      title="Premade Programs"
      subtitle={premadePrograms.length > 0 ? `${premadePrograms.length} ${premadePrograms.length === 1 ? 'program' : 'programs'} available` : 'No premade programs available'}
    >
      <PremadeProgramsClient programs={premadePrograms} seedError={seedError} />
    </PageLayout>
  )
}

