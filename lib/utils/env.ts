/**
 * Environment variable validation utility
 * Validates required environment variables at startup
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous/public key',
} as const

const optionalEnvVars = {
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (for admin operations)',
} as const

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    const value = process.env[key]
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key} (${description})`)
    }
  }

  // Validate URL format for Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must start with https://')
  }

  // Validate JWT format for keys (basic check)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (anonKey && !anonKey.includes('.')) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (not a JWT)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getEnv(key: keyof typeof requiredEnvVars): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

export function getOptionalEnv(key: keyof typeof optionalEnvVars): string | undefined {
  return process.env[key]
}

// Validate on import in development
if (process.env.NODE_ENV !== 'production') {
  const result = validateEnv()
  if (!result.valid) {
    console.error('❌ Environment validation failed:')
    result.errors.forEach(error => console.error(`  - ${error}`))
    console.error('\nPlease check your .env.local file and ensure all required variables are set.')
  } else {
    console.log('✅ Environment variables validated successfully')
  }
}
