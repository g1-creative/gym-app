'use server'

import { createClient } from '@/lib/supabase/server'
import { seedPremadePrograms } from './seed-premade-programs'

/**
 * Automatically seed premade programs if they don't exist
 * This can be called on app startup or when viewing premade programs
 */
export async function autoSeedPremadePrograms() {
  const supabase = await createClient()
  
  // Check if any premade programs exist
  try {
    const checkQuery = supabase.from('programs') as any
    const { data: existing } = await checkQuery
      .select('id')
      .eq('is_premade', true)
      .is('deleted_at', null)
      .limit(1)

    // If programs already exist, don't seed
    if (existing && existing.length > 0) {
      return { seeded: false, message: 'Premade programs already exist' }
    }

    // Try to seed (this requires authentication)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { seeded: false, message: 'Authentication required to seed programs' }
    }

    const results = await seedPremadePrograms()
    const successCount = results.filter(r => r.success).length
    
    return {
      seeded: true,
      message: `Seeded ${successCount} premade program(s)`,
      results
    }
  } catch (error: any) {
    // If column doesn't exist, migration hasn't been run
    if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
      return {
        seeded: false,
        message: 'Database migration required. Please run the migration SQL first.',
        needsMigration: true
      }
    }
    
    return {
      seeded: false,
      message: `Error: ${error.message || 'Unknown error'}`,
      error: String(error)
    }
  }
}

