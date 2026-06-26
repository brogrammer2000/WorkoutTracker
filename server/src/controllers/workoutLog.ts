import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

export async function getLog(req: AuthRequest, res: Response) {
  const { date } = req.query as { date?: string }
  if (!date) return res.status(400).json({ error: 'date is required' })

  const { data: log, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', req.userId!)
    .eq('logged_date', date)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!log) return res.json(null)

  const { data: sets, error: setsErr } = await supabase
    .from('set_logs')
    .select('*')
    .eq('log_id', log.id)
    .order('exercise_id')
    .order('set_number')

  if (setsErr) return res.status(500).json({ error: setsErr.message })
  return res.json({ ...log, sets: sets ?? [] })
}

export async function getLoggedDates(req: AuthRequest, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string }

  let query = supabase
    .from('workout_logs')
    .select('logged_date')
    .eq('user_id', req.userId!)

  if (from) query = query.gte('logged_date', from)
  if (to) query = query.lte('logged_date', to)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json((data ?? []).map((r) => r.logged_date))
}

export async function createLog(req: AuthRequest, res: Response) {
  const { logged_date, split_day_index, notes } = req.body as {
    logged_date: string
    split_day_index: number
    notes?: string
  }

  if (!logged_date || split_day_index === undefined) {
    return res.status(400).json({ error: 'logged_date and split_day_index are required' })
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .upsert({ user_id: req.userId!, logged_date, split_day_index, notes: notes ?? null }, {
      onConflict: 'user_id,logged_date',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

// Replaces all sets for one exercise within a log
export async function saveSets(req: AuthRequest, res: Response) {
  const { logId } = req.params
  const { exercise_id, sets } = req.body as {
    exercise_id: string
    sets: { set_number: number; reps: number | null; weight_kg: number | null; rpe: number | null }[]
  }

  if (!exercise_id || !Array.isArray(sets)) {
    return res.status(400).json({ error: 'exercise_id and sets are required' })
  }

  // Verify log belongs to user
  const { data: log } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('id', logId)
    .eq('user_id', req.userId!)
    .maybeSingle()

  if (!log) return res.status(404).json({ error: 'Log not found' })

  await supabase.from('set_logs').delete().eq('log_id', logId).eq('exercise_id', exercise_id)

  if (sets.length === 0) return res.json([])

  const rows = sets.map((s) => ({ log_id: logId, exercise_id, ...s }))
  const { data, error } = await supabase.from('set_logs').insert(rows).select()

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

// Returns last N sessions of history for a list of exercise IDs (used by AI coach)
export async function getExerciseHistory(req: AuthRequest, res: Response) {
  const { exercise_ids } = req.body as { exercise_ids: string[] }
  if (!Array.isArray(exercise_ids) || exercise_ids.length === 0) {
    return res.status(400).json({ error: 'exercise_ids is required' })
  }

  // Get last 8 logs for this user
  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id, logged_date, split_day_index')
    .eq('user_id', req.userId!)
    .order('logged_date', { ascending: false })
    .limit(8)

  if (!logs || logs.length === 0) return res.json({})

  const logIds = logs.map((l) => l.id)

  const { data: sets, error } = await supabase
    .from('set_logs')
    .select('log_id, exercise_id, set_number, reps, weight_kg, rpe')
    .in('log_id', logIds)
    .in('exercise_id', exercise_ids)
    .order('log_id')
    .order('exercise_id')
    .order('set_number')

  if (error) return res.status(500).json({ error: error.message })

  // Group by exercise_id → array of sessions
  const history: Record<string, { date: string; sets: typeof sets }[]> = {}

  for (const exId of exercise_ids) {
    const exSets = (sets ?? []).filter((s) => s.exercise_id === exId)
    const sessions: { date: string; sets: typeof exSets }[] = []

    for (const log of logs) {
      const sessionSets = exSets.filter((s) => s.log_id === log.id)
      if (sessionSets.length > 0) {
        sessions.push({ date: log.logged_date, sets: sessionSets })
      }
    }
    history[exId] = sessions
  }

  return res.json(history)
}
