export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core'

export interface SplitDay {
  label: string
  muscleGroups: MuscleGroup[]
}

export interface Split {
  id: string
  name: string
  description: string
  pro?: string
  con?: string
  minDays: number
  maxDays: number
  schedule: SplitDay[]
}

export const ALL_SPLITS: Split[] = [
  {
    id: 'full_body_1',
    name: 'Full Body',
    description: 'One session per week hitting every major muscle group. Best for maintaining fitness or as an introduction to resistance training.',
    minDays: 1,
    maxDays: 1,
    schedule: [
      { label: 'Full Body', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core'] },
    ],
  },
  {
    id: 'full_body_2',
    name: 'Full Body ×2',
    description: 'Two full-body sessions per week with a rest day between. Ideal frequency for beginners and those pressed for time.',
    pro: 'High frequency per muscle group — each muscle is trained twice a week.',
    con: 'Sessions can run long if you try to cover too many exercises.',
    minDays: 2,
    maxDays: 2,
    schedule: [
      { label: 'Full Body A', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core'] },
      { label: 'Full Body B', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core'] },
    ],
  },
  {
    id: 'upper_lower_2',
    name: 'Upper / Lower',
    description: 'Two days split between upper body (chest, back, shoulders, arms) and lower body (legs, glutes, core). A great balance of frequency and recovery.',
    pro: 'Dedicated lower body day leads to better leg development than full-body.',
    con: 'Lower stimulus per muscle vs full-body ×2 at this frequency.',
    minDays: 2,
    maxDays: 2,
    schedule: [
      { label: 'Upper', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { label: 'Lower', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
    ],
  },
  {
    id: 'full_body_3',
    name: 'Full Body ×3',
    description: 'Three full-body sessions spread across the week. A science-backed approach that maximises muscle-protein synthesis frequency.',
    pro: 'Each muscle gets three stimuli per week — optimal for beginners and intermediates.',
    con: 'Sessions must be kept concise; limited volume per muscle per session.',
    minDays: 3,
    maxDays: 3,
    schedule: [
      { label: 'Full Body A', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core'] },
      { label: 'Full Body B', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core'] },
      { label: 'Full Body C', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core'] },
    ],
  },
  {
    id: 'ppl_3',
    name: 'Push / Pull / Legs',
    description: 'Three days: pushing muscles (chest, shoulders, triceps), pulling muscles (back, biceps), and legs (quads, hamstrings, glutes). A classic intermediate programme.',
    pro: 'Higher volume per muscle group per session — good for hypertrophy.',
    con: 'Each muscle is only hit once a week at this frequency.',
    minDays: 3,
    maxDays: 3,
    schedule: [
      { label: 'Push', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { label: 'Pull', muscleGroups: ['back', 'biceps'] },
      { label: 'Legs', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
    ],
  },
  {
    id: 'upper_lower_full_3',
    name: 'Upper / Lower / Full',
    description: 'A hybrid approach: one upper day, one lower day, and one full-body day. Bridges the gap between dedicated splits and full-body frequency.',
    pro: 'Leg muscles get twice the weekly stimulus thanks to the full-body day.',
    con: 'Less specialised volume on upper body compared to PPL.',
    minDays: 3,
    maxDays: 3,
    schedule: [
      { label: 'Upper', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { label: 'Lower', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { label: 'Full Body', muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'core'] },
    ],
  },
  {
    id: 'upper_lower_4',
    name: 'Upper / Lower ×2',
    description: 'Four days alternating upper and lower body sessions. Each muscle group is trained twice per week with adequate recovery between sessions.',
    pro: 'Best balance of frequency and volume at 4 days — proven for intermediate hypertrophy.',
    con: 'Less isolation work per session vs a body-part split.',
    minDays: 4,
    maxDays: 4,
    schedule: [
      { label: 'Upper A', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { label: 'Lower A', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
      { label: 'Upper B', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { label: 'Lower B', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
    ],
  },
  {
    id: 'ppl_plus_4',
    name: 'PPL + Legs',
    description: 'Push, Pull, Legs, then a second dedicated leg day. Great if you want to bring up your lower body while still getting solid upper-body volume.',
    pro: 'Legs are trained twice — ideal if lower body development is a priority.',
    con: 'Upper body only hit once a week; less frequency than Upper/Lower ×2.',
    minDays: 4,
    maxDays: 4,
    schedule: [
      { label: 'Push', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { label: 'Pull', muscleGroups: ['back', 'biceps'] },
      { label: 'Legs A', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { label: 'Legs B', muscleGroups: ['quads', 'hamstrings', 'glutes', 'core'] },
    ],
  },
  {
    id: 'body_part_4',
    name: '4-Day Body Part Split',
    description: 'Four days each targeting specific muscle groups: chest/triceps, back/biceps, shoulders, and legs. The classic gym-bro split.',
    pro: 'Very high volume per session — great for muscle damage and soreness-based hypertrophy.',
    con: 'Each muscle group is only hit once a week; lower frequency than Upper/Lower.',
    minDays: 4,
    maxDays: 4,
    schedule: [
      { label: 'Chest & Triceps', muscleGroups: ['chest', 'triceps'] },
      { label: 'Back & Biceps', muscleGroups: ['back', 'biceps'] },
      { label: 'Shoulders', muscleGroups: ['shoulders'] },
      { label: 'Legs', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
    ],
  },
  {
    id: 'ppl_ul_5',
    name: 'PPL + Upper / Lower',
    description: 'Five days combining a full PPL cycle with an upper/lower pair. Each muscle gets 1.5–2× weekly frequency for strong hypertrophy stimulus.',
    pro: 'Excellent volume and frequency combination — well-suited to intermediate–advanced lifters.',
    con: 'High weekly volume; recovery and sleep become critical.',
    minDays: 5,
    maxDays: 5,
    schedule: [
      { label: 'Push', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { label: 'Pull', muscleGroups: ['back', 'biceps'] },
      { label: 'Legs', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { label: 'Upper', muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { label: 'Lower', muscleGroups: ['quads', 'hamstrings', 'glutes', 'core'] },
    ],
  },
  {
    id: 'body_part_5',
    name: '5-Day Body Part Split',
    description: 'Five dedicated days: chest, back, shoulders, arms, and legs. Maximum isolation volume per muscle group each week.',
    pro: 'Extremely high per-session volume — ideal if you enjoy long, focused sessions.',
    con: 'Each muscle trained only once a week; lower frequency than science-backed recommendations.',
    minDays: 5,
    maxDays: 5,
    schedule: [
      { label: 'Chest', muscleGroups: ['chest'] },
      { label: 'Back', muscleGroups: ['back'] },
      { label: 'Shoulders', muscleGroups: ['shoulders'] },
      { label: 'Arms', muscleGroups: ['biceps', 'triceps'] },
      { label: 'Legs', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
    ],
  },
  {
    id: 'ppl_x2_6',
    name: 'Push / Pull / Legs ×2',
    description: 'The full PPL cycle run twice per week — six days on, one off. The gold standard for intermediate to advanced hypertrophy training.',
    pro: 'Each muscle hit twice weekly with high volume — optimal stimulus for muscle growth.',
    con: 'Demanding schedule; requires excellent recovery, nutrition, and sleep.',
    minDays: 6,
    maxDays: 7,
    schedule: [
      { label: 'Push A', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { label: 'Pull A', muscleGroups: ['back', 'biceps'] },
      { label: 'Legs A', muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'] },
      { label: 'Push B', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { label: 'Pull B', muscleGroups: ['back', 'biceps'] },
      { label: 'Legs B', muscleGroups: ['quads', 'hamstrings', 'glutes', 'core'] },
    ],
  },
  {
    id: 'body_part_6',
    name: '6-Day Body Part Split',
    description: 'Six days each targeting different muscle groups with one dedicated rest day. Maximum weekly volume across all muscle groups.',
    pro: 'Extremely high overall volume — suited to advanced athletes with great recovery.',
    con: 'Little room for life; any missed session disrupts the full weekly plan.',
    minDays: 6,
    maxDays: 7,
    schedule: [
      { label: 'Chest', muscleGroups: ['chest'] },
      { label: 'Back', muscleGroups: ['back'] },
      { label: 'Shoulders', muscleGroups: ['shoulders'] },
      { label: 'Arms', muscleGroups: ['biceps', 'triceps'] },
      { label: 'Legs A', muscleGroups: ['quads', 'hamstrings'] },
      { label: 'Legs B', muscleGroups: ['glutes', 'calves', 'core'] },
    ],
  },
]

export function getSplitsForDays(days: number): Split[] {
  return ALL_SPLITS.filter((s) => days >= s.minDays && days <= s.maxDays)
}
