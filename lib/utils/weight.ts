// Weight conversion utilities
// Database stores in kg, but UI displays in lbs

const KG_TO_LBS = 2.20462
const LBS_TO_KG = 1 / KG_TO_LBS

export function kgToLbs(kg: number | null | undefined): number | null {
  if (kg === null || kg === undefined) return null
  return Math.round(kg * KG_TO_LBS * 10) / 10 // Round to 1 decimal
}

export function lbsToKg(lbs: number | null | undefined): number | null {
  if (lbs === null || lbs === undefined) return null
  return Math.round(lbs * LBS_TO_KG * 100) / 100 // Round to 2 decimals for storage
}

export function formatWeight(kg: number | null | undefined): string {
  const lbs = kgToLbs(kg)
  if (lbs === null) return '—'
  return `${lbs} lbs`
}

export function formatVolume(kg: number | null | undefined): string {
  const lbs = kgToLbs(kg)
  if (lbs === null) return '—'
  return `${lbs.toFixed(0)} lbs`
}

