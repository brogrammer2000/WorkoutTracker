import api from '@/lib/api'
import type { WorkoutLog, SetLog, AIWorkoutRec } from '@/types'

export interface LogWithSets extends WorkoutLog {
  sets: SetLog[]
}

export async function fetchLog(date: string): Promise<LogWithSets | null> {
  const { data } = await api.get<LogWithSets | null>('/workout-logs', { params: { date } })
  return data
}

export async function fetchLoggedDates(from: string, to: string): Promise<string[]> {
  const { data } = await api.get<string[]>('/workout-logs/dates', { params: { from, to } })
  return data
}

export async function createOrUpdateLog(
  logged_date: string,
  split_day_index: number,
  notes?: string
): Promise<WorkoutLog> {
  const { data } = await api.post<WorkoutLog>('/workout-logs', { logged_date, split_day_index, notes })
  return data
}

export interface SetInput {
  set_number: number
  reps: number | null
  weight_kg: number | null
  rpe: number | null
}

export async function saveSets(logId: string, exercise_id: string, sets: SetInput[]): Promise<SetLog[]> {
  const { data } = await api.post<SetLog[]>(`/workout-logs/${logId}/sets`, { exercise_id, sets })
  return data
}

export async function fetchAIRecommendations(
  exercises: { id: string; name: string; muscleGroup: string; movementPattern: string }[],
  exerciseIds: string[]
): Promise<AIWorkoutRec[]> {
  // First fetch history
  const { data: history } = await api.post('/workout-logs/history', { exercise_ids: exerciseIds })
  // Then get AI recs
  const { data } = await api.post<{ recommendations: AIWorkoutRec[] }>('/ai/workout-coach', {
    exercises,
    history,
  })
  return data.recommendations ?? []
}
