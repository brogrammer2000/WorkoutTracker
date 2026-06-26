import api from '@/lib/api'
import type { UserExercise } from '@/types'
import { EXERCISES } from '@/data/exercises'

export async function fetchUserExercises(): Promise<Set<string>> {
  const { data } = await api.get<UserExercise[]>('/exercises')
  return new Set(data.map((e) => e.exercise_id))
}

export async function saveUserExercises(selected: Set<string>): Promise<void> {
  const exercises = Array.from(selected).map((id) => {
    const ex = EXERCISES.find((e) => e.id === id)
    return { exercise_id: id, muscle_group: ex?.muscleGroup ?? 'core' }
  })
  await api.post('/exercises', { exercises })
}
