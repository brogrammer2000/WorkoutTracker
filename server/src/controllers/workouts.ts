import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

export async function list(req: AuthRequest, res: Response) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function create(req: AuthRequest, res: Response) {
  const { title, notes } = req.body

  const { data, error } = await supabase
    .from('workouts')
    .insert({ user_id: req.userId!, title, notes })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function getById(req: AuthRequest, res: Response) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*, exercises(*, workout_sets(*))')
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .single()

  if (error) return res.status(404).json({ error: 'Workout not found' })
  return res.json(data)
}

export async function update(req: AuthRequest, res: Response) {
  const { title, notes, completed_at } = req.body

  const { data, error } = await supabase
    .from('workouts')
    .update({ title, notes, completed_at })
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function remove(req: AuthRequest, res: Response) {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}
