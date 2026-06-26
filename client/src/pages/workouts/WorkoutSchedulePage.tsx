import { useState } from 'react'
import { getExerciseById } from '@/data/exercises'
import type { Split, MuscleGroup } from '@/data/splits'

interface Props {
  split: Split
  selectedExerciseIds: Set<string>
  onReconfigure: () => void
  onTrack: () => void
}

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', quads: 'Quads',
  hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', core: 'Core',
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest: '#60a5fa', back: '#a78bfa', shoulders: '#f59e0b',
  biceps: '#34d399', triceps: '#fb923c', quads: '#f472b6',
  hamstrings: '#e879f9', glutes: '#c084fc', calves: '#94a3b8', core: '#4ade80',
}

const SET_REPS: Record<MuscleGroup, string> = {
  chest: '3–4 × 8–12', back: '3–4 × 8–12', shoulders: '3 × 10–15',
  biceps: '3 × 10–15', triceps: '3 × 10–15', quads: '3–4 × 8–12',
  hamstrings: '3 × 8–12', glutes: '3 × 10–15', calves: '4 × 12–20', core: '3 × 12–20',
}

export default function WorkoutSchedulePage({ split, selectedExerciseIds, onReconfigure, onTrack }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>{split.name}</h2>
          <p style={styles.sub}>Your weekly workout schedule</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={styles.reconfigureBtn} onClick={onReconfigure}>Reconfigure</button>
          <button style={styles.trackBtn} onClick={onTrack}>Track & Improve →</button>
        </div>
      </div>

      <div style={styles.days}>
        {split.schedule.map((day, i) => {
          const isExpanded = expandedDay === i
          // exercises that belong to any of this day's muscle groups
          const dayExercises = Array.from(selectedExerciseIds)
            .map((id) => getExerciseById(id))
            .filter((ex) => ex && day.muscleGroups.includes(ex.muscleGroup as MuscleGroup))
            .filter(Boolean) as ReturnType<typeof getExerciseById>[]

          return (
            <div key={i} style={{ ...styles.dayCard, ...(isExpanded ? styles.dayCardExpanded : {}) }}>
              {/* Day header */}
              <button style={styles.dayHeader} onClick={() => setExpandedDay(isExpanded ? null : i)}>
                <div style={styles.dayMeta}>
                  <span style={styles.dayNumber}>Day {i + 1}</span>
                  <span style={styles.dayName}>{day.label}</span>
                </div>
                <div style={styles.dayRight}>
                  <div style={styles.musclePills}>
                    {day.muscleGroups.map((mg) => (
                      <span key={mg} style={{ ...styles.musclePill, color: MUSCLE_COLORS[mg], borderColor: `${MUSCLE_COLORS[mg]}44`, background: `${MUSCLE_COLORS[mg]}12` }}>
                        {MUSCLE_LABELS[mg]}
                      </span>
                    ))}
                  </div>
                  <span style={styles.chevron}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded exercises */}
              {isExpanded && (
                <div style={styles.exerciseList}>
                  {day.muscleGroups.map((mg) => {
                    const mgExercises = dayExercises.filter((ex) => ex!.muscleGroup === mg)
                    if (mgExercises.length === 0) return null
                    return (
                      <div key={mg} style={styles.muscleSection}>
                        <div style={styles.muscleSectionHeader}>
                          <span style={{ ...styles.muscleLabel, color: MUSCLE_COLORS[mg] }}>
                            {MUSCLE_LABELS[mg]}
                          </span>
                          <span style={styles.setsReps}>{SET_REPS[mg]}</span>
                        </div>
                        {mgExercises.map((ex) => ex && (
                          <div key={ex.id} style={styles.exerciseRow}>
                            <span style={styles.exerciseName}>{ex.name}</span>
                            <span style={styles.exerciseEquip}>{ex.equipment}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                  {dayExercises.length === 0 && (
                    <p style={styles.noExercises}>
                      No exercises selected for these muscle groups.{' '}
                      <button style={styles.linkBtn} onClick={onReconfigure}>Add exercises →</button>
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:            { maxWidth: 720, margin: '0 auto', padding: '32px 24px' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  heading:         { fontSize: 26, fontWeight: 700, margin: 0, marginBottom: 4 },
  sub:             { fontSize: 14, color: '#888', margin: 0 },
  reconfigureBtn:  { padding: '8px 18px', background: 'none', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 13, cursor: 'pointer' },
  trackBtn:        { padding: '8px 20px', background: '#4ade80', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  days:            { display: 'flex', flexDirection: 'column', gap: 12 },
  dayCard:         { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' },
  dayCardExpanded: { border: '1px solid #2d5a3d' },
  dayHeader:       { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', gap: 12, flexWrap: 'wrap' },
  dayMeta:         { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  dayNumber:       { fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' },
  dayName:         { fontSize: 17, fontWeight: 600, color: '#f5f5f5' },
  dayRight:        { display: 'flex', alignItems: 'center', gap: 16 },
  musclePills:     { display: 'flex', flexWrap: 'wrap', gap: 6 },
  musclePill:      { fontSize: 11, fontWeight: 500, border: '1px solid', borderRadius: 99, padding: '2px 8px' },
  chevron:         { fontSize: 10, color: '#555' },

  exerciseList:    { borderTop: '1px solid #222', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 },
  muscleSection:   { display: 'flex', flexDirection: 'column', gap: 8 },
  muscleSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  muscleLabel:     { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
  setsReps:        { fontSize: 12, color: '#555', fontStyle: 'italic' },
  exerciseRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: '#111', borderRadius: 8 },
  exerciseName:    { fontSize: 14, color: '#ddd' },
  exerciseEquip:   { fontSize: 11, color: '#555', textTransform: 'capitalize' },
  noExercises:     { fontSize: 13, color: '#555', fontStyle: 'italic' },
  linkBtn:         { background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: 13, padding: 0 },
}
