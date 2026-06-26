import { useState } from 'react'
import { getExercisesForMuscleGroup, addCustomExercise, type Exercise } from '@/data/exercises'
import ExerciseAnimation from '@/components/ExerciseAnimation'
import type { MuscleGroup, Split } from '@/data/splits'
import type { MovementPattern } from '@/data/exercises'

interface Props {
  split: Split
  initialSelected: Set<string>
  onSave: (selected: Set<string>) => void
  onBack: () => void
}

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', quads: 'Quads',
  hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', core: 'Core',
}

const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core',
]

const MOVEMENT_PATTERNS: MovementPattern[] = [
  'press', 'pull', 'squat', 'hinge', 'curl',
  'extension', 'row', 'raise', 'fly', 'plank',
]

const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'] as const

const EMPTY_FORM = {
  name: '',
  muscleGroup: 'chest' as MuscleGroup,
  movementPattern: 'press' as MovementPattern,
  equipment: 'barbell' as Exercise['equipment'],
  description: '',
  // AI-context fields
  isCompound: 'yes' as 'yes' | 'no',
  difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
  unilateral: 'no' as 'yes' | 'no',
  notes: '',
}

export default function ExerciseSelectionPage({ split, initialSelected, onSave, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  // trigger re-render after adding custom exercise
  const [customVersion, setCustomVersion] = useState(0)

  const muscleGroups = Array.from(
    new Set(split.schedule.flatMap((d) => d.muscleGroups))
  ) as MuscleGroup[]

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleCustomSave() {
    if (!form.name.trim()) { setFormError('Name is required.'); return }
    const id = `custom_${Date.now()}`
    const description = [
      form.description.trim(),
      form.isCompound === 'yes' ? 'Compound movement.' : 'Isolation movement.',
      form.unilateral === 'yes' ? 'Unilateral (one side at a time).' : '',
      form.notes.trim(),
    ].filter(Boolean).join(' ')

    addCustomExercise({
      id,
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      movementPattern: form.movementPattern,
      equipment: form.equipment,
      description: description || `Custom ${form.movementPattern} exercise.`,
    })

    // Auto-select it
    setSelected((prev) => new Set([...prev, id]))
    setCustomVersion((v) => v + 1)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowCustomForm(false)
  }

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div style={styles.page}>
      {/* Exercise detail panel */}
      {activeExercise && !showCustomForm && (
        <div style={styles.overlay} onClick={() => setActiveExercise(null)}>
          <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setActiveExercise(null)}>✕</button>
            <div style={styles.panelTop}>
              <ExerciseAnimation pattern={activeExercise.movementPattern} />
              <div>
                <h3 style={styles.panelName}>{activeExercise.name}</h3>
                <span style={styles.muscleTag}>{MUSCLE_LABELS[activeExercise.muscleGroup]}</span>
                <span style={styles.equipTag}>{activeExercise.equipment}</span>
              </div>
            </div>
            <p style={styles.panelDesc}>{activeExercise.description}</p>
            <button
              style={{ ...styles.panelToggle, ...(selected.has(activeExercise.id) ? styles.panelToggleActive : {}) }}
              onClick={() => toggle(activeExercise.id)}
            >
              {selected.has(activeExercise.id) ? '✓ Added to my list' : '+ Add to my list'}
            </button>
          </div>
        </div>
      )}

      {/* Custom exercise form */}
      {showCustomForm && (
        <div style={styles.overlay} onClick={() => setShowCustomForm(false)}>
          <div style={{ ...styles.panel, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowCustomForm(false)}>✕</button>
            <h3 style={styles.panelName}>Add your own exercise</h3>
            <p style={styles.formHint}>These details help your AI trainer programme it correctly.</p>

            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Exercise name *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Landmine Press"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  autoFocus
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Primary muscle group</label>
                <select style={styles.select} value={form.muscleGroup} onChange={(e) => set('muscleGroup', e.target.value as MuscleGroup)}>
                  {ALL_MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>{MUSCLE_LABELS[mg]}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Movement pattern</label>
                <select style={styles.select} value={form.movementPattern} onChange={(e) => set('movementPattern', e.target.value as MovementPattern)}>
                  {MOVEMENT_PATTERNS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <span style={styles.fieldHint}>How the AI categorises the stimulus type for programming balance.</span>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Equipment</label>
                <select style={styles.select} value={form.equipment} onChange={(e) => set('equipment', e.target.value as Exercise['equipment'])}>
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <option key={eq} value={eq}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Compound or isolation?</label>
                <div style={styles.toggleRow}>
                  {(['yes', 'no'] as const).map((v) => (
                    <button key={v} style={{ ...styles.toggleBtn, ...(form.isCompound === v ? styles.toggleBtnActive : {}) }} onClick={() => set('isCompound', v)}>
                      {v === 'yes' ? 'Compound (multi-joint)' : 'Isolation (single-joint)'}
                    </button>
                  ))}
                </div>
                <span style={styles.fieldHint}>Helps the AI place it in the right slot within a session (main lift vs. accessory).</span>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Difficulty</label>
                <div style={styles.toggleRow}>
                  {(['beginner', 'intermediate', 'advanced'] as const).map((v) => (
                    <button key={v} style={{ ...styles.toggleBtn, ...(form.difficulty === v ? styles.toggleBtnActive : {}) }} onClick={() => set('difficulty', v)}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
                <span style={styles.fieldHint}>The AI uses this to recommend appropriate rep ranges and volume.</span>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Unilateral (one side at a time)?</label>
                <div style={styles.toggleRow}>
                  {(['yes', 'no'] as const).map((v) => (
                    <button key={v} style={{ ...styles.toggleBtn, ...(form.unilateral === v ? styles.toggleBtnActive : {}) }} onClick={() => set('unilateral', v)}>
                      {v === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
                <span style={styles.fieldHint}>Unilateral exercises double the set count, which affects total volume calculations.</span>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Description / notes for AI <span style={styles.optional}>(optional)</span></label>
                <textarea
                  style={styles.textarea}
                  placeholder="e.g. Performed on a Smith machine due to shoulder injury. Targets upper chest more than flat press."
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                />
                <span style={styles.fieldHint}>Anything the AI should know — substitution reason, injury context, cues that help you.</span>
              </div>
            </div>

            {formError && <p style={styles.error}>{formError}</p>}

            <button style={styles.saveBtn} onClick={handleCustomSave}>
              Add exercise & select it →
            </button>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Choose your exercises</h2>
          <p style={styles.sub}>Select the exercises you know and are comfortable performing. Tap any for details.</p>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.selectedCount}>{selected.size} selected</span>
          <button style={styles.addCustomBtnTop} onClick={() => setShowCustomForm(true)}>
            + Add your own
          </button>
          <button style={styles.backBtn} onClick={onBack}>← Back</button>
          <button style={styles.saveContinueBtn} onClick={() => onSave(selected)} disabled={selected.size === 0}>
            Save & Continue →
          </button>
        </div>
      </div>

      {muscleGroups.map((mg) => {
        // customVersion in deps so re-renders when custom exercises are added
        void customVersion
        const exercises = getExercisesForMuscleGroup(mg)
        return (
          <div key={mg} style={styles.section}>
            <h3 style={styles.groupTitle}>{MUSCLE_LABELS[mg]}</h3>
            <div style={styles.exerciseGrid}>
              {exercises.map((ex) => {
                const isSelected = selected.has(ex.id)
                const isCustom = ex.id.startsWith('custom_')
                return (
                  <button
                    key={ex.id}
                    style={{ ...styles.exCard, ...(isSelected ? styles.exCardSelected : {}) }}
                    onClick={() => setActiveExercise(ex)}
                  >
                    <div style={styles.exCardInner}>
                      <span style={styles.exName}>
                        {ex.name}
                        {isCustom && <span style={styles.customBadge}>custom</span>}
                      </span>
                      <span style={styles.exEquip}>{ex.equipment}</span>
                    </div>
                    <div
                      style={{ ...styles.checkbox, ...(isSelected ? styles.checkboxSelected : {}) }}
                      onClick={(e) => { e.stopPropagation(); toggle(ex.id) }}
                    >
                      {isSelected && '✓'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div style={styles.footer}>
        <button style={styles.addCustomBtn} onClick={() => setShowCustomForm(true)}>
          + Add your own exercise
        </button>
        <div style={styles.footerRight}>
          <button style={styles.backBtn} onClick={onBack}>← Back</button>
          <button style={styles.saveContinueBtn} onClick={() => onSave(selected)} disabled={selected.size === 0}>
            Save & Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:       { maxWidth: 860, margin: '0 auto', padding: '32px 24px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  heading:    { fontSize: 26, fontWeight: 700, margin: 0, marginBottom: 6 },
  sub:        { fontSize: 14, color: '#888', margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  selectedCount: { fontSize: 13, color: '#888' },
  section:    { marginBottom: 36 },
  groupTitle: { fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' } as React.CSSProperties,
  exerciseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 },
  exCard:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer', textAlign: 'left', gap: 10 },
  exCardSelected: { border: '1px solid #2d5a3d', background: '#0f2318' },
  exCardInner: { display: 'flex', flexDirection: 'column', gap: 4 },
  exName:     { fontSize: 14, fontWeight: 500, color: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  exEquip:    { fontSize: 11, color: '#666', textTransform: 'capitalize' },
  customBadge: { fontSize: 9, fontWeight: 700, background: '#1e3a5f', color: '#60a5fa', border: '1px solid #2563eb44', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.05em', textTransform: 'uppercase' },
  checkbox:   { width: 22, height: 22, borderRadius: 6, border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#000', flexShrink: 0, cursor: 'pointer' },
  checkboxSelected: { background: '#4ade80', border: '1px solid #4ade80', fontWeight: 700 },
  footer:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid #222', flexWrap: 'wrap' },
  footerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  addCustomBtnTop: { padding: '10px 18px', background: '#60a5fa', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  addCustomBtn: { padding: '10px 18px', background: 'none', border: '1px dashed #444', borderRadius: 8, color: '#888', fontSize: 13, cursor: 'pointer' },
  backBtn:    { padding: '10px 20px', background: 'none', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 14, cursor: 'pointer' },
  saveContinueBtn: { padding: '10px 24px', background: '#4ade80', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },

  // Detail panel
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, overflowY: 'auto' },
  panel:      { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, maxWidth: 460, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, margin: 'auto' },
  closeBtn:   { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' },
  panelTop:   { display: 'flex', gap: 20, alignItems: 'flex-start' },
  panelName:  { fontSize: 20, fontWeight: 700, margin: '0 0 4px' },
  formHint:   { fontSize: 13, color: '#666', margin: 0 },
  muscleTag:  { display: 'inline-block', fontSize: 11, background: '#0f2318', color: '#4ade80', border: '1px solid #2d5a3d', borderRadius: 99, padding: '2px 10px', marginRight: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  equipTag:   { display: 'inline-block', fontSize: 11, background: '#1e1e1e', color: '#888', border: '1px solid #333', borderRadius: 99, padding: '2px 10px', textTransform: 'capitalize' },
  panelDesc:  { fontSize: 14, color: '#bbb', lineHeight: 1.7 },
  panelToggle: { padding: '12px', background: '#222', border: '1px solid #333', borderRadius: 8, color: '#ccc', fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  panelToggleActive: { background: '#0f2318', border: '1px solid #4ade80', color: '#4ade80' },

  // Custom form
  formGrid:   { display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 },
  formField:  { display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: 13, fontWeight: 500, color: '#ccc' },
  optional:   { fontSize: 11, color: '#555', fontWeight: 400 },
  input:      { padding: '10px 12px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#f5f5f5', fontSize: 14, outline: 'none' },
  select:     { padding: '10px 12px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#f5f5f5', fontSize: 14, outline: 'none' },
  textarea:   { padding: '10px 12px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#f5f5f5', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  toggleRow:  { display: 'flex', flexWrap: 'wrap', gap: 8 },
  toggleBtn:  { padding: '7px 14px', background: '#111', border: '1px solid #333', borderRadius: 7, color: '#888', fontSize: 13, cursor: 'pointer' },
  toggleBtnActive: { background: '#0f2318', border: '1px solid #4ade80', color: '#4ade80', fontWeight: 600 },
  fieldHint:  { fontSize: 11, color: '#555', lineHeight: 1.5 },
  error:      { fontSize: 13, color: '#f87171' },
  saveBtn:    { padding: '12px', background: '#4ade80', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
}
