import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(profile: Record<string, unknown>): string {
  const goal: Record<string, string> = {
    lose_weight: 'lose weight',
    gain_muscle: 'gain muscle',
    recomp: 'body recomposition (lose fat and gain muscle simultaneously)',
    maintain: 'maintain current physique',
    endurance: 'improve general fitness and endurance',
  }

  return `You are an expert personal trainer and fitness coach with deep, evidence-based knowledge of exercise science, sports nutrition, and strength & conditioning. Your recommendations are grounded in peer-reviewed research and current best practices.

Your client's profile:
- Age: ${profile.age ?? 'unknown'}
- Sex: ${profile.sex ?? 'unknown'}
- Height: ${profile.height_cm ? `${profile.height_cm} cm` : 'unknown'}
- Weight: ${profile.weight_kg ? `${profile.weight_kg} kg` : 'unknown'}
- Estimated body fat: ${profile.body_fat_pct ? `${profile.body_fat_pct}%` : 'not provided'}
- Training level: ${profile.training_level ?? 'unknown'}
- Workout days per week: ${profile.workout_days_per_week ?? 'unknown'}
- Equipment access: ${profile.equipment ?? 'unknown'}
- Goal: ${goal[profile.goal as string] ?? 'unknown'}
- Activity level outside workouts: ${profile.activity_level ?? 'unknown'}
- Dietary preference: ${profile.dietary_preference ?? 'none'}
- Injuries / limitations: ${profile.injuries || 'none reported'}

Guidelines:
- Keep responses clear and practical. Briefly cite scientific rationale where helpful.
- Be realistic about timelines and progress expectations.
- Always recommend consulting a doctor before starting a new programme if the client has health concerns.
- Do not provide medical diagnoses or treatment advice.`
}

export async function chat(req: AuthRequest, res: Response) {
  const { message } = req.body as { message: string }
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.userId!)
    .single()

  if (!profile) return res.status(404).json({ error: 'Profile not found' })

  // Load conversation history (last 20 messages to stay within context)
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: true })
    .limit(20)

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystemPrompt(profile),
    messages,
  })

  const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

  // Persist both turns
  await supabase.from('messages').insert([
    { user_id: req.userId!, role: 'user', content: message },
    { user_id: req.userId!, role: 'assistant', content: assistantMessage },
  ])

  return res.json({ message: assistantMessage })
}

export async function workoutCoach(req: AuthRequest, res: Response) {
  const { exercises, history } = req.body as {
    exercises: { id: string; name: string; muscleGroup: string; movementPattern: string }[]
    history: Record<string, { date: string; sets: { set_number: number; reps: number | null; weight_kg: number | null; rpe: number | null }[] }[]>
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ error: 'exercises is required' })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.userId!)
    .single()

  if (!profile) return res.status(404).json({ error: 'Profile not found' })

  const historyText = exercises.map((ex) => {
    const sessions = history[ex.id] ?? []
    if (sessions.length === 0) return `${ex.name}: no history yet`
    const lines = sessions.map((s) => {
      const setsStr = s.sets.map((set) => {
        const w = set.weight_kg != null ? `${set.weight_kg}kg` : 'bodyweight'
        const r = set.reps != null ? `${set.reps} reps` : '?'
        const rpe = set.rpe != null ? ` @RPE${set.rpe}` : ''
        return `${w}×${r}${rpe}`
      }).join(', ')
      return `  ${s.date}: ${setsStr}`
    }).join('\n')
    return `${ex.name} (${ex.muscleGroup}, ${ex.movementPattern}):\n${lines}`
  }).join('\n\n')

  const systemPrompt = buildSystemPrompt(profile)

  const prompt = `You are acting as a progressive overload coach. Based on this athlete's history, recommend sets, reps, and weight for TODAY's session. Apply progressive overload principles — typically a 2.5–5% weight increase or +1–2 reps when the previous session was completed with good form.

Athlete profile already provided in the system prompt.

EXERCISE HISTORY (most recent first):
${historyText}

Respond with a JSON array — nothing else, no markdown fences. Each element:
{
  "exercise_id": "...",
  "exercise_name": "...",
  "sets": <number>,
  "reps": "<range e.g. 8-10>",
  "weight_kg": <number or null for bodyweight>,
  "reasoning": "<one sentence: why this specific progression>"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '[]'
  try {
    const recs = JSON.parse(raw)
    return res.json({ recommendations: recs })
  } catch {
    return res.json({ recommendations: [], raw })
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}
