export interface Profile {
  id: string
  role: 'admin' | 'user'
  onboarding_completed: boolean
  unit_system: 'metric' | 'imperial' | null
  goal_weight_kg: number | null
  daily_adjustment_kcal: number | null
  age: number | null
  sex: 'male' | 'female' | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_pct: number | null
  workout_days_per_week: number | null
  training_level: 'beginner' | 'intermediate' | 'advanced' | null
  equipment: 'gym' | 'home' | 'none' | null
  goal: 'lose_weight' | 'gain_muscle' | 'recomp' | 'maintain' | 'endurance' | null
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null
  injuries: string | null
  dietary_preference: 'none' | 'vegetarian' | 'vegan' | 'other' | null
  workout_split: string | null
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  title: string
  notes?: string
  completed_at?: string
  created_at: string
}

export interface Exercise {
  id: string
  workout_id: string
  name: string
  order: number
}

export interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  reps?: number
  weight_kg?: number
  duration_seconds?: number
  notes?: string
}

export interface UserExercise {
  id: string
  exercise_id: string
  muscle_group: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  logged_date: string
  split_day_index: number
  notes: string | null
  created_at: string
}

export interface SetLog {
  id: string
  log_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  rpe: number | null
}

export interface AIWorkoutRec {
  exercise_id: string
  exercise_name: string
  sets: number
  reps: string
  weight_kg: number | null
  reasoning: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface CalorieTargets {
  bmr: number
  tdee: number
  target: number
  targetLabel: string
  protein_g: number
  fat_g: number
  carbs_g: number
}
