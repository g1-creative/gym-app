import { getPremadePrograms } from '@/app/actions/premade-programs'
import { PremadeProgramsClient } from '@/components/programs/PremadeProgramsClient'
import { PageLayout } from '@/components/layout/PageLayout'

export default async function PremadeProgramsPage() {
  try {
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
  } catch (error) {
    console.error('Error rendering premade programs page:', error)
    return (
      <PageLayout
        title="Premade Programs"
        subtitle="Error loading programs"
      >
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Failed to load premade programs. Please try again later.</p>
        </div>
      </PageLayout>
    )
  }
}

