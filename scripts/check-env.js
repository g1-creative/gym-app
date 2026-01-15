#!/usr/bin/env node

/**
 * Build-time environment variable validation
 * Run this before building to ensure all required vars are set
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
]

let hasErrors = false
const errors = []

console.log('🔍 Checking environment variables...\n')

// Check required variables
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    errors.push(`❌ Missing required variable: ${varName}`)
    hasErrors = true
  } else {
    console.log(`✅ ${varName}`)
  }
}

// Check optional variables
for (const varName of optionalVars) {
  if (!process.env[varName]) {
    console.log(`⚠️  Optional variable not set: ${varName}`)
  } else {
    console.log(`✅ ${varName}`)
  }
}

// Additional validations
if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
  errors.push('❌ NEXT_PUBLIC_SUPABASE_URL must start with https://')
  hasErrors = true
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('.')) {
  errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (not a JWT)')
  hasErrors = true
}

if (hasErrors) {
  console.error('\n❌ Environment validation failed:')
  errors.forEach(error => console.error(`   ${error}`))
  console.error('\nPlease set the required environment variables before building.')
  process.exit(1)
} else {
  console.log('\n✅ All environment variables validated successfully')
}
