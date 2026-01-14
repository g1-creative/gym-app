import { getPremadePrograms } from '@/app/actions/premade-programs'
import { PremadeProgramsClient } from '@/components/programs/PremadeProgramsClient'
import { PageLayout } from '@/components/layout/PageLayout'

export default async function PremadeProgramsPage() {
  // Get premade programs from hardcoded data (no database or seeding needed)
  const premadePrograms = await getPremadePrograms()

  return (
    <PageLayout
      title="Premade Programs"
      subtitle={`${premadePrograms.length} ${premadePrograms.length === 1 ? 'program' : 'programs'} available`}
    >
      <PremadeProgramsClient programs={premadePrograms} seedError={null} />
    </PageLayout>
  )
}

