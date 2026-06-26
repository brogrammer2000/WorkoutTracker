import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

export async function getExercises(req: AuthRequest, res: Response) {
  const { data, error } = await supabase
    .from('user_exercises')
    .select('id, exercise_id, muscle_group')
    .eq('user_id', req.userId!)

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function saveExercises(req: AuthRequest, res: Response) {
  const { exercises } = req.body as { exercises: { exercise_id: string; muscle_group: string }[] }
  if (!Array.isArray(exercises)) return res.status(400).json({ error: 'exercises must be an array' })

  // Replace all user exercises
  await supabase.from('user_exercises').delete().eq('user_id', req.userId!)

  if (exercises.length === 0) return res.json([])

  const rows = exercises.map((e) => ({ user_id: req.userId!, exercise_id: e.exercise_id, muscle_group: e.muscle_group }))
  const { data, error } = await supabase.from('user_exercises').insert(rows).select()

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}
