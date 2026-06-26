import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

export async function getProfile(req: AuthRequest, res: Response) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.userId!)
    .single()

  if (error) return res.status(404).json({ error: 'Profile not found' })
  return res.json(data)
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const allowed = [
    'unit_system', 'age', 'sex', 'height_cm', 'weight_kg', 'body_fat_pct',
    'workout_days_per_week', 'training_level', 'equipment', 'goal',
    'goal_weight_kg', 'daily_adjustment_kcal',
    'activity_level', 'injuries', 'dietary_preference', 'onboarding_completed',
    'workout_split',
  ]

  const updates: Record<string, unknown> = { id: req.userId! }
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key]
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates)
    .select()
    .single()

  if (error) {
    console.error('[profile] upsert error:', error)
    return res.status(500).json({ error: error.message })
  }
  return res.json(data)
}
