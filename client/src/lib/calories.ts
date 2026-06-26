import type { Profile, CalorieTargets } from '@/types'

const activityMultiplier: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
}

const fallbackAdjustment: Record<string, { kcal: number; label: string }> = {
  lose_weight: { kcal: -400, label: 'Cutting (default −400 kcal/day)' },
  gain_muscle:  { kcal:  300, label: 'Bulking (default +300 kcal/day)' },
  recomp:       { kcal:    0, label: 'Recomposition (maintenance)' },
  maintain:     { kcal:    0, label: 'Maintenance' },
  endurance:    { kcal:    0, label: 'Maintenance' },
}

function adjustmentLabel(kcal: number): string {
  if (kcal === 0) return 'Maintenance'
  const sign = kcal > 0 ? '+' : '−'
  const type = kcal > 0 ? 'Bulk' : 'Cut'
  return `${type} (${sign}${Math.abs(kcal)} kcal/day)`
}

export function calculateCalories(profile: Profile): CalorieTargets | null {
  if (
    !profile.weight_kg ||
    !profile.height_cm ||
    !profile.age ||
    !profile.sex ||
    !profile.activity_level ||
    !profile.goal
  ) {
    return null
  }

  // Mifflin-St Jeor BMR
  const bmr =
    10 * profile.weight_kg +
    6.25 * profile.height_cm -
    5 * profile.age +
    (profile.sex === 'male' ? 5 : -161)

  const tdee = Math.round(bmr * (activityMultiplier[profile.activity_level] ?? 1.2))

  // Use the user's chosen adjustment if set, otherwise fall back to defaults
  const kcal = profile.daily_adjustment_kcal
    ?? fallbackAdjustment[profile.goal]?.kcal
    ?? 0
  const label = profile.daily_adjustment_kcal
    ? adjustmentLabel(profile.daily_adjustment_kcal)
    : fallbackAdjustment[profile.goal]?.label ?? 'Maintenance'

  const target = tdee + kcal

  // Macros: 2g protein per kg, 0.9g fat per kg, carbs fill the rest
  const protein_g = Math.round(profile.weight_kg * 2)
  const fat_g = Math.round(profile.weight_kg * 0.9)
  const carbs_g = Math.round((target - protein_g * 4 - fat_g * 9) / 4)

  return {
    bmr: Math.round(bmr),
    tdee,
    target,
    targetLabel: label,
    protein_g,
    fat_g,
    carbs_g: Math.max(carbs_g, 0),
  }
}
