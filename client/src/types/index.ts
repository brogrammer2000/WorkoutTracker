export interface User {
  id: string
  email: string
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
