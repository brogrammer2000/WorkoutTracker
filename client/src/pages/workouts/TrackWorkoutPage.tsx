import { useState, useEffect, useCallback, useRef } from 'react'
import type { Split, MuscleGroup } from '@/data/splits'
import { getExerciseById, EXERCISES, getCustomExercises } from '@/data/exercises'
import {
  fetchLog, fetchLoggedDates, createOrUpdateLog, saveSets, fetchAIRecommendations,
  type SetInput,
} from '@/services/workoutLog'
import type { AIWorkoutRec } from '@/types'

interface Props {
  split: Split
  selectedExerciseIds: Set<string>
  onBack: () => void
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest: '#60a5fa', back: '#a78bfa', shoulders: '#f59e0b',
  biceps: '#34d399', triceps: '#fb923c', quads: '#f472b6',
  hamstrings: '#e879f9', glutes: '#c084fc', calves: '#94a3b8', core: '#4ade80',
}

function toYMD(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function weekStart(d: Date) {
  const r = new Date(d)
  r.setDate(r.getDate() - r.getDay()) // Sunday
  return r
}

function formatDate(ymd: string) {
  return new Date(ymd + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TrackWorkoutPage({ split, selectedExerciseIds, onBack }: Props) {
  const today = toYMD(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekOf, setWeekOf] = useState(weekStart(new Date()))
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set())
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [logId, setLogId] = useState<string | null>(null)
  // sets: exerciseId → SetInput[]
  const [sets, setSets] = useState<Record<string, SetInput[]>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [aiRecs, setAiRecs] = useState<AIWorkoutRec[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Load logged dates for current week
  useEffect(() => {
    const from = toYMD(weekOf)
    const to = toYMD(addDays(weekOf, 6))
    fetchLoggedDates(from, to).then((dates) => setLoggedDates(new Set(dates)))
  }, [weekOf])

  // Load log when date changes
  useEffect(() => {
    setLogId(null)
    setSets({})
    setAiRecs([])
    setShowAiPanel(false)

    fetchLog(selectedDate).then((log) => {
      if (!log) return
      setLogId(log.id)
      setSelectedDayIndex(log.split_day_index)
      // Reconstruct sets map
      const map: Record<string, SetInput[]> = {}
      for (const s of log.sets) {
        if (!map[s.exercise_id]) map[s.exercise_id] = []
        map[s.exercise_id].push({
          set_number: s.set_number,
          reps: s.reps,
          weight_kg: s.weight_kg,
          rpe: s.rpe,
        })
      }
      setSets(map)
    })
  }, [selectedDate])

  // Ensure log exists when a set is modified
  async function ensureLog(): Promise<string> {
    if (logId) return logId
    const log = await createOrUpdateLog(selectedDate, selectedDayIndex)
    setLogId(log.id)
    setLoggedDates((prev) => new Set([...prev, selectedDate]))
    return log.id
  }

  // Debounced save for sets
  const scheduleSave = useCallback((exerciseId: string, newSets: SetInput[]) => {
    clearTimeout(saveTimers.current[exerciseId])
    saveTimers.current[exerciseId] = setTimeout(async () => {
      setSaving((p) => ({ ...p, [exerciseId]: true }))
      try {
        const id = await ensureLog()
        await saveSets(id, exerciseId, newSets)
      } finally {
        setSaving((p) => ({ ...p, [exerciseId]: false }))
      }
    }, 800)
  }, [logId, selectedDate, selectedDayIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateSet(exerciseId: string, setIdx: number, field: keyof SetInput, raw: string) {
    setSets((prev) => {
      const exSets = [...(prev[exerciseId] ?? [])]
      const parsed = raw === '' ? null : Number(raw)
      exSets[setIdx] = { ...exSets[setIdx], [field]: isNaN(parsed as number) ? null : parsed }
      const next = { ...prev, [exerciseId]: exSets }
      scheduleSave(exerciseId, exSets)
      return next
    })
  }

  function addSet(exerciseId: string) {
    setSets((prev) => {
      const exSets = prev[exerciseId] ?? []
      const last = exSets[exSets.length - 1]
      const newSet: SetInput = {
        set_number: exSets.length + 1,
        reps: last?.reps ?? null,
        weight_kg: last?.weight_kg ?? null,
        rpe: null,
      }
      const next = { ...prev, [exerciseId]: [...exSets, newSet] }
      scheduleSave(exerciseId, next[exerciseId])
      return next
    })
  }

  function removeSet(exerciseId: string, setIdx: number) {
    setSets((prev) => {
      const exSets = prev[exerciseId].filter((_, i) => i !== setIdx)
        .map((s, i) => ({ ...s, set_number: i + 1 }))
      const next = { ...prev, [exerciseId]: exSets }
      scheduleSave(exerciseId, exSets)
      return next
    })
  }

  async function handleDayChange(dayIndex: number) {
    setSelectedDayIndex(dayIndex)
    setSets({})
    setAiRecs([])
    if (logId) {
      await createOrUpdateLog(selectedDate, dayIndex)
    }
  }

  async function handleGetAiRecs() {
    const dayExercises = getDayExercises()
    if (dayExercises.length === 0) return
    setAiLoading(true)
    setAiError('')
    setShowAiPanel(true)
    try {
      const recs = await fetchAIRecommendations(
        dayExercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          movementPattern: ex.movementPattern,
        })),
        dayExercises.map((ex) => ex.id)
      )
      setAiRecs(recs)
    } catch {
      setAiError('Failed to get AI recommendations. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  function getDayExercises() {
    const day = split.schedule[selectedDayIndex]
    if (!day) return []
    const allExercises = [...EXERCISES, ...getCustomExercises()]
    return Array.from(selectedExerciseIds)
      .map((id) => allExercises.find((e) => e.id === id))
      .filter((ex) => ex && day.muscleGroups.includes(ex.muscleGroup as MuscleGroup))
      .filter(Boolean) as NonNullable<ReturnType<typeof getExerciseById>>[]
  }

  const dayExercises = getDayExercises()
  const currentDay = split.schedule[selectedDayIndex]

  // Week days for calendar
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i))

  return (
    <div style={s.page}>
      {/* AI panel overlay */}
      {showAiPanel && (
        <div style={s.overlay} onClick={() => setShowAiPanel(false)}>
          <div style={s.aiPanel} onClick={(e) => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setShowAiPanel(false)}>✕</button>
            <h3 style={s.aiTitle}>AI Coach — Progressive Overload</h3>
            <p style={s.aiSub}>Recommendations based on your training history.</p>

            {aiLoading && <p style={s.aiLoading}>Analysing your history…</p>}
            {aiError && <p style={s.aiErr}>{aiError}</p>}

            {!aiLoading && aiRecs.length > 0 && (
              <div style={s.recList}>
                {aiRecs.map((rec) => (
                  <div key={rec.exercise_id} style={s.recCard}>
                    <p style={s.recName}>{rec.exercise_name}</p>
                    <div style={s.recPrescription}>
                      <span style={s.recSets}>{rec.sets} sets</span>
                      <span style={s.recX}>×</span>
                      <span style={s.recReps}>{rec.reps} reps</span>
                      {rec.weight_kg != null && (
                        <>
                          <span style={s.recX}>@</span>
                          <span style={s.recWeight}>{rec.weight_kg} kg</span>
                        </>
                      )}
                    </div>
                    <p style={s.recReasoning}>{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            )}

            {!aiLoading && aiRecs.length === 0 && !aiError && (
              <p style={s.aiLoading}>No recommendations yet — log a session first.</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Track & Improve</h2>
          <p style={s.sub}>Log today's session. The AI coach will recommend next week's loads.</p>
        </div>
        <div style={s.headerRight}>
          <button style={s.aiBtn} onClick={handleGetAiRecs} disabled={aiLoading}>
            {aiLoading ? 'Loading…' : 'AI Coach'}
          </button>
          <button style={s.backBtn} onClick={onBack}>← Schedule</button>
        </div>
      </div>

      {/* Week calendar */}
      <div style={s.calendarWrap}>
        <button style={s.weekNav} onClick={() => setWeekOf(addDays(weekOf, -7))}>‹</button>
        <div style={s.calendar}>
          {weekDays.map((d, i) => {
            const ymd = toYMD(d)
            const isToday = ymd === today
            const isSelected = ymd === selectedDate
            const hasLog = loggedDates.has(ymd)
            return (
              <button
                key={ymd}
                style={{
                  ...s.dayBtn,
                  ...(isSelected ? s.dayBtnSelected : {}),
                  ...(isToday && !isSelected ? s.dayBtnToday : {}),
                }}
                onClick={() => setSelectedDate(ymd)}
              >
                <span style={s.dayLabel}>{DAY_LABELS[i]}</span>
                <span style={s.dayNum}>{d.getDate()}</span>
                {hasLog && <span style={s.logDot} />}
              </button>
            )
          })}
        </div>
        <button style={s.weekNav} onClick={() => setWeekOf(addDays(weekOf, 7))}>›</button>
      </div>

      <p style={s.selectedDateLabel}>{formatDate(selectedDate)}</p>

      {/* Split day tabs */}
      <div style={s.dayTabs}>
        {split.schedule.map((day, i) => (
          <button
            key={i}
            style={{ ...s.dayTab, ...(selectedDayIndex === i ? s.dayTabActive : {}) }}
            onClick={() => handleDayChange(i)}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Exercise loggers */}
      {dayExercises.length === 0 ? (
        <div style={s.empty}>
          <p>No exercises selected for <strong>{currentDay?.label}</strong>.</p>
          <p style={{ color: '#555', fontSize: 13 }}>Go back to the exercise selection to add some.</p>
        </div>
      ) : (
        <div style={s.exerciseList}>
          {dayExercises.map((ex) => {
            const exSets = sets[ex.id] ?? []
            const rec = aiRecs.find((r) => r.exercise_id === ex.id)
            const isSaving = saving[ex.id]
            return (
              <div key={ex.id} style={s.exerciseCard}>
                <div style={s.exHeader}>
                  <div>
                    <span style={{ ...s.exMuscle, color: MUSCLE_COLORS[ex.muscleGroup as MuscleGroup] }}>
                      {ex.muscleGroup}
                    </span>
                    <h4 style={s.exName}>{ex.name}</h4>
                  </div>
                  <div style={s.exHeaderRight}>
                    {isSaving && <span style={s.savingDot}>saving…</span>}
                    {rec && (
                      <span style={s.recBadge}>
                        AI: {rec.sets}×{rec.reps}{rec.weight_kg ? ` @ ${rec.weight_kg}kg` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Set rows */}
                <div style={s.setTable}>
                  <div style={s.setHeaderRow}>
                    <span style={s.setHeaderCell}>Set</span>
                    <span style={s.setHeaderCell}>Reps</span>
                    <span style={s.setHeaderCell}>Weight (kg)</span>
                    <span style={s.setHeaderCell}>RPE</span>
                    <span style={{ ...s.setHeaderCell, width: 24 }} />
                  </div>
                  {exSets.map((set, idx) => (
                    <div key={idx} style={s.setRow}>
                      <span style={s.setNum}>{set.set_number}</span>
                      <input
                        style={s.setInput}
                        type="number"
                        min={0}
                        placeholder="—"
                        value={set.reps ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'reps', e.target.value)}
                      />
                      <input
                        style={s.setInput}
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="—"
                        value={set.weight_kg ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'weight_kg', e.target.value)}
                      />
                      <input
                        style={{ ...s.setInput, ...s.rpeInput }}
                        type="number"
                        min={1}
                        max={10}
                        placeholder="—"
                        value={set.rpe ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'rpe', e.target.value)}
                      />
                      <button style={s.removeSet} onClick={() => removeSet(ex.id, idx)}>✕</button>
                    </div>
                  ))}
                </div>

                <button style={s.addSetBtn} onClick={() => addSet(ex.id)}>
                  + Add set
                </button>

                {rec && (
                  <div style={s.recInline}>
                    <span style={s.recInlineLabel}>AI Reasoning:</span> {rec.reasoning}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page:            { maxWidth: 760, margin: '0 auto', padding: '32px 24px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  heading:         { fontSize: 26, fontWeight: 700, margin: 0, marginBottom: 4 },
  sub:             { fontSize: 14, color: '#888', margin: 0 },
  headerRight:     { display: 'flex', gap: 10, alignItems: 'center' },
  aiBtn:           { padding: '10px 20px', background: '#a78bfa', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  backBtn:         { padding: '10px 18px', background: 'none', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 13, cursor: 'pointer' },

  // Calendar
  calendarWrap:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  calendar:        { display: 'flex', flex: 1, gap: 6 },
  weekNav:         { background: 'none', border: 'none', color: '#888', fontSize: 20, cursor: 'pointer', padding: '0 4px' },
  dayBtn:          { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer', position: 'relative' },
  dayBtnSelected:  { background: '#0f2318', border: '1px solid #4ade80' },
  dayBtnToday:     { border: '1px solid #444' },
  dayLabel:        { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' },
  dayNum:          { fontSize: 16, fontWeight: 600, color: '#f5f5f5' },
  logDot:          { width: 5, height: 5, borderRadius: '50%', background: '#4ade80' },
  selectedDateLabel: { fontSize: 14, color: '#888', marginBottom: 16 },

  // Day tabs
  dayTabs:         { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  dayTab:          { padding: '7px 16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#888', fontSize: 13, cursor: 'pointer' },
  dayTabActive:    { background: '#0f2318', border: '1px solid #4ade80', color: '#4ade80', fontWeight: 600 },

  // Exercises
  exerciseList:    { display: 'flex', flexDirection: 'column', gap: 16 },
  exerciseCard:    { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px' },
  exHeader:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  exHeaderRight:   { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  exMuscle:        { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 },
  exName:          { fontSize: 17, fontWeight: 600, margin: 0, color: '#f5f5f5' },
  savingDot:       { fontSize: 11, color: '#555' },
  recBadge:        { fontSize: 11, fontWeight: 600, background: '#1e1a3a', color: '#a78bfa', border: '1px solid #4c1d9544', borderRadius: 99, padding: '2px 10px' },

  // Set table
  setTable:        { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 },
  setHeaderRow:    { display: 'grid', gridTemplateColumns: '32px 1fr 1fr 60px 24px', gap: 8, paddingBottom: 4, borderBottom: '1px solid #222' },
  setHeaderCell:   { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' },
  setRow:          { display: 'grid', gridTemplateColumns: '32px 1fr 1fr 60px 24px', gap: 8, alignItems: 'center' },
  setNum:          { fontSize: 13, color: '#555', textAlign: 'center' },
  setInput:        { padding: '7px 10px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 7, color: '#f5f5f5', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  rpeInput:        { color: '#f59e0b' },
  removeSet:       { background: 'none', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', padding: 0, lineHeight: 1 },
  addSetBtn:       { background: 'none', border: '1px dashed #333', borderRadius: 7, color: '#666', fontSize: 13, padding: '7px 14px', cursor: 'pointer', width: '100%' },

  recInline:       { marginTop: 12, fontSize: 12, color: '#666', lineHeight: 1.6, borderTop: '1px solid #222', paddingTop: 10 },
  recInlineLabel:  { color: '#a78bfa', fontWeight: 600 },

  empty:           { color: '#888', fontSize: 14, padding: '32px 0', textAlign: 'center' },

  // AI panel
  overlay:         { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  aiPanel:         { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '80vh', overflowY: 'auto' },
  closeBtn:        { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' },
  aiTitle:         { fontSize: 20, fontWeight: 700, margin: 0, color: '#a78bfa' },
  aiSub:           { fontSize: 13, color: '#666', margin: 0 },
  aiLoading:       { fontSize: 14, color: '#666', textAlign: 'center', padding: '16px 0' },
  aiErr:           { fontSize: 13, color: '#f87171' },
  recList:         { display: 'flex', flexDirection: 'column', gap: 14 },
  recCard:         { background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: 16 },
  recName:         { fontSize: 15, fontWeight: 600, color: '#f5f5f5', margin: '0 0 10px' },
  recPrescription: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  recSets:         { fontSize: 22, fontWeight: 700, color: '#a78bfa' },
  recX:            { fontSize: 14, color: '#555' },
  recReps:         { fontSize: 22, fontWeight: 700, color: '#a78bfa' },
  recWeight:       { fontSize: 22, fontWeight: 700, color: '#4ade80' },
  recReasoning:    { fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 },
}
