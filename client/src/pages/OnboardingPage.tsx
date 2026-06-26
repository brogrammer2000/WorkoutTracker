import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import BodyFatVisual from '@/components/BodyFatVisual'
import GoalWeightTimeline from '@/components/GoalWeightTimeline'
import type { Profile } from '@/types'

type FormData = Partial<Profile> & { height_display?: number; weight_display?: number }

const STEPS = [
  'unit_system',
  'age',
  'sex',
  'height',
  'weight',
  'body_fat_pct',
  'workout_days_per_week',
  'training_level',
  'equipment',
  'goal',
  'goal_weight',
  'activity_level',
  'dietary_preference',
  'injuries',
] as const

type StepKey = typeof STEPS[number]

const GOAL_WEIGHT_GOALS = ['lose_weight', 'gain_muscle', 'recomp']

export default function OnboardingPage() {
  const { profile, saveProfile, isSaving } = useProfile()
  const navigate = useNavigate()
  const isEditing = profile?.onboarding_completed === true
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(() =>
    profile
      ? {
          unit_system: profile.unit_system ?? 'metric',
          age: profile.age ?? undefined,
          sex: profile.sex ?? undefined,
          height_cm: profile.height_cm ?? undefined,
          weight_kg: profile.weight_kg ?? undefined,
          body_fat_pct: profile.body_fat_pct ?? undefined,
          workout_days_per_week: profile.workout_days_per_week ?? undefined,
          training_level: profile.training_level ?? undefined,
          equipment: profile.equipment ?? undefined,
          goal: profile.goal ?? undefined,
          goal_weight_kg: profile.goal_weight_kg ?? undefined,
          daily_adjustment_kcal: profile.daily_adjustment_kcal ?? undefined,
          activity_level: profile.activity_level ?? undefined,
          dietary_preference: profile.dietary_preference ?? undefined,
          injuries: profile.injuries ?? undefined,
        }
      : { unit_system: 'metric' }
  )
  const [error, setError] = useState<string | null>(null)

  const totalSteps = STEPS.length
  const currentKey = STEPS[step]

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function shouldSkip(key: StepKey) {
    if (key === 'goal_weight') return !GOAL_WEIGHT_GOALS.includes(form.goal ?? '')
    return false
  }

  function next() {
    setError(null)
    let s = step + 1
    while (s < totalSteps - 1 && shouldSkip(STEPS[s])) s++
    setStep(s)
  }

  function back() {
    setError(null)
    let s = step - 1
    while (s > 0 && shouldSkip(STEPS[s])) s--
    setStep(s)
  }

  // Auto-advance for option-tile selections
  function pick<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setTimeout(next, 180)
  }

  async function handleSubmit() {
    setError(null)
    const raw: Partial<Profile> & FormData = { ...form, onboarding_completed: true }
    delete raw.height_display
    delete raw.weight_display

    // Convert empty strings to null so PostgreSQL numeric columns don't reject them
    const payload = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v === '' ? null : v])
    ) as Partial<Profile>

    try {
      await saveProfile(payload)
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string }
      const msg = axiosErr?.response?.data?.error ?? axiosErr?.message ?? String(err)
      setError(`Failed to save: ${msg}`)
    }
  }

  const isMetric = form.unit_system === 'metric'

  const stepContent: Record<StepKey, React.ReactNode> = {
    unit_system: (
      <Card title="What units do you prefer?">
        <TileGroup>
          <Tile label="Metric" sub="kg, cm" selected={form.unit_system === 'metric'} onClick={() => pick('unit_system', 'metric')} />
          <Tile label="Imperial" sub="lbs, inches" selected={form.unit_system === 'imperial'} onClick={() => pick('unit_system', 'imperial')} />
        </TileGroup>
      </Card>
    ),

    age: (
      <Card title="How old are you?">
        <NumberInput
          value={form.age ?? ''}
          onChange={(v) => set('age', v)}
          placeholder="e.g. 25"
          min={13}
          max={100}
          unit="years"
        />
      </Card>
    ),

    sex: (
      <Card title="What is your biological sex?" sub="Used for accurate calorie and hormone-based calculations.">
        <TileGroup>
          <Tile label="Male" selected={form.sex === 'male'} onClick={() => pick('sex', 'male')} />
          <Tile label="Female" selected={form.sex === 'female'} onClick={() => pick('sex', 'female')} />
        </TileGroup>
      </Card>
    ),

    height: (
      <Card title="What is your height?">
        <NumberInput
          value={
            form.height_cm
              ? isMetric
                ? form.height_cm
                : Math.round(form.height_cm / 2.54)
              : ''
          }
          onChange={(v) => {
            set('height_display', v as number)
            set('height_cm', isMetric ? v as number : (v as number) * 2.54)
          }}
          placeholder={isMetric ? 'e.g. 175' : 'e.g. 69'}
          unit={isMetric ? 'cm' : 'in'}
          min={1}
        />
      </Card>
    ),

    weight: (
      <Card title="What is your current weight?">
        <NumberInput
          value={
            form.weight_kg
              ? isMetric
                ? form.weight_kg
                : Math.round(form.weight_kg / 0.453592)
              : ''
          }
          onChange={(v) => {
            set('weight_display', v as number)
            set('weight_kg', isMetric ? v as number : (v as number) * 0.453592)
          }}
          placeholder={isMetric ? 'e.g. 75' : 'e.g. 165'}
          unit={isMetric ? 'kg' : 'lbs'}
          min={1}
        />
      </Card>
    ),

    body_fat_pct: (
      <Card title="What is your estimated body fat %?" sub="Optional — skip if you're not sure.">
        <BodyFatVisual sex={form.sex ?? null} value={form.body_fat_pct ?? ''} />
        <div style={{ marginTop: 24 }}>
          <NumberInput
            value={form.body_fat_pct ?? ''}
            onChange={(v) => set('body_fat_pct', v as number)}
            placeholder="e.g. 18"
            unit="%"
            min={3}
            max={60}
          />
        </div>
      </Card>
    ),

    workout_days_per_week: (
      <Card title="How many days per week do you work out?">
        <div style={styles.dayGrid}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button
              key={d}
              style={{
                ...styles.dayBtn,
                ...(form.workout_days_per_week === d ? styles.dayBtnActive : {}),
              }}
              onClick={() => pick('workout_days_per_week', d)}
            >
              {d}
            </button>
          ))}
        </div>
      </Card>
    ),

    training_level: (
      <Card title="How experienced are you?">
        <TileGroup vertical>
          <Tile label="Beginner" sub="Less than 1 year of consistent training" selected={form.training_level === 'beginner'} onClick={() => pick('training_level', 'beginner')} />
          <Tile label="Intermediate" sub="1–3 years of consistent training" selected={form.training_level === 'intermediate'} onClick={() => pick('training_level', 'intermediate')} />
          <Tile label="Advanced" sub="3+ years of consistent training" selected={form.training_level === 'advanced'} onClick={() => pick('training_level', 'advanced')} />
        </TileGroup>
      </Card>
    ),

    equipment: (
      <Card title="What equipment do you have access to?">
        <TileGroup vertical>
          <Tile label="Full gym" sub="Barbells, machines, cables, dumbbells" selected={form.equipment === 'gym'} onClick={() => pick('equipment', 'gym')} />
          <Tile label="Home equipment" sub="Dumbbells, resistance bands, bench, etc." selected={form.equipment === 'home'} onClick={() => pick('equipment', 'home')} />
          <Tile label="No equipment" sub="Bodyweight training only" selected={form.equipment === 'none'} onClick={() => pick('equipment', 'none')} />
        </TileGroup>
      </Card>
    ),

    goal: (
      <Card title="What is your primary goal?">
        <TileGroup vertical>
          <Tile label="Lose weight" selected={form.goal === 'lose_weight'} onClick={() => pick('goal', 'lose_weight')} />
          <Tile label="Gain muscle" selected={form.goal === 'gain_muscle'} onClick={() => pick('goal', 'gain_muscle')} />
          <Tile label="Lose fat & gain muscle" sub="Body recomposition" selected={form.goal === 'recomp'} onClick={() => pick('goal', 'recomp')} />
          <Tile label="Maintain current physique" selected={form.goal === 'maintain'} onClick={() => pick('goal', 'maintain')} />
          <Tile label="Improve fitness & endurance" selected={form.goal === 'endurance'} onClick={() => pick('goal', 'endurance')} />
        </TileGroup>
      </Card>
    ),

    goal_weight: (() => {
      const isMetric = form.unit_system === 'metric'
      const currentKg = form.weight_kg ?? 0
      const goalKg = form.goal_weight_kg ?? null
      const displayGoal = goalKg
        ? isMetric ? goalKg : Math.round(goalKg / 0.453592)
        : ''

      return (
        <Card title="What is your goal weight?">
          <NumberInput
            value={displayGoal}
            onChange={(v) => set('goal_weight_kg', v === '' ? undefined : isMetric ? v as number : (v as number) * 0.453592)}
            placeholder={isMetric ? 'e.g. 70' : 'e.g. 154'}
            unit={isMetric ? 'kg' : 'lbs'}
            min={1}
          />
          {goalKg && currentKg > 0 && form.goal && GOAL_WEIGHT_GOALS.includes(form.goal) && (
            <div style={{ marginTop: 24 }}>
              <GoalWeightTimeline
                currentWeightKg={currentKg}
                goalWeightKg={goalKg}
                goal={form.goal as 'lose_weight' | 'gain_muscle' | 'recomp'}
                selected={form.daily_adjustment_kcal ?? null}
                onSelect={(kcal) => set('daily_adjustment_kcal', kcal)}
              />
            </div>
          )}
        </Card>
      )
    })(),

    activity_level: (
      <Card title="How active are you outside of workouts?">
        <TileGroup vertical>
          <Tile label="Sedentary" sub="Mostly sitting, desk job" selected={form.activity_level === 'sedentary'} onClick={() => pick('activity_level', 'sedentary')} />
          <Tile label="Lightly active" sub="Light walking, occasional movement" selected={form.activity_level === 'lightly_active'} onClick={() => pick('activity_level', 'lightly_active')} />
          <Tile label="Moderately active" sub="On your feet most of the day" selected={form.activity_level === 'moderately_active'} onClick={() => pick('activity_level', 'moderately_active')} />
          <Tile label="Very active" sub="Physical job or competitive athlete" selected={form.activity_level === 'very_active'} onClick={() => pick('activity_level', 'very_active')} />
        </TileGroup>
      </Card>
    ),

    dietary_preference: (
      <Card title="Do you have a dietary preference?">
        <TileGroup>
          <Tile label="None" sub="No restriction" selected={form.dietary_preference === 'none'} onClick={() => pick('dietary_preference', 'none')} />
          <Tile label="Vegetarian" selected={form.dietary_preference === 'vegetarian'} onClick={() => pick('dietary_preference', 'vegetarian')} />
          <Tile label="Vegan" selected={form.dietary_preference === 'vegan'} onClick={() => pick('dietary_preference', 'vegan')} />
          <Tile label="Other" selected={form.dietary_preference === 'other'} onClick={() => pick('dietary_preference', 'other')} />
        </TileGroup>
      </Card>
    ),

    injuries: (
      <Card title="Any injuries or limitations?" sub="Optional — helps the AI tailor your programme safely.">
        <textarea
          style={styles.textarea}
          value={form.injuries ?? ''}
          onChange={(e) => set('injuries', e.target.value || undefined)}
          placeholder="e.g. lower back pain, avoid overhead pressing"
          rows={4}
        />
      </Card>
    ),
  }

  const isSkippable = currentKey === 'body_fat_pct' || currentKey === 'injuries' || currentKey === 'goal_weight'
  const isLast = step === totalSteps - 1

  return (
    <div style={styles.page}>
      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>

      {isEditing && (
        <button style={styles.cancelBtn} onClick={() => navigate('/')}>✕ Cancel</button>
      )}

      {/* Card */}
      <div style={styles.wrapper}>
        {stepContent[currentKey]}

        {error && <p style={styles.error}>{error}</p>}

        {/* Navigation */}
        <div style={styles.nav}>
          {step > 0 && (
            <button style={styles.btnBack} onClick={back}>← Back</button>
          )}
          <div style={styles.navRight}>
            {isSkippable && !isLast && (
              <button style={styles.btnSkip} onClick={next}>Skip</button>
            )}
            {!isLast ? (
              <button style={styles.btnNext} onClick={next}>Next →</button>
            ) : (
              <button style={styles.btnNext} onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Finish →'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={styles.stepCount}>{step + 1} / {totalSteps}</p>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      {sub && <p style={styles.cardSub}>{sub}</p>}
      <div style={styles.cardBody}>{children}</div>
    </div>
  )
}

function TileGroup({ children, vertical }: { children: React.ReactNode; vertical?: boolean }) {
  return (
    <div style={{ ...styles.tileGroup, flexDirection: vertical ? 'column' : 'row', flexWrap: vertical ? 'nowrap' : 'wrap' }}>
      {children}
    </div>
  )
}

function Tile({ label, sub, selected, onClick }: { label: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      style={{ ...styles.tile, ...(selected ? styles.tileSelected : {}) }}
      onClick={onClick}
    >
      <span style={styles.tileLabel}>{label}</span>
      {sub && <span style={styles.tileSub}>{sub}</span>}
    </button>
  )
}

function NumberInput({
  value, onChange, placeholder, unit, min, max,
}: {
  value: number | string
  onChange: (v: number | '') => void
  placeholder: string
  unit: string
  min?: number
  max?: number
}) {
  return (
    <div style={styles.numberInputWrap}>
      <input
        style={styles.numberInput}
        type="number"
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
      <span style={styles.numberUnit}>{unit}</span>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' },
  progressTrack: { position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: '#222' },
  cancelBtn: { position: 'fixed', top: 16, right: 20, background: 'none', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 13, padding: '6px 14px', cursor: 'pointer' },
  progressFill: { height: '100%', background: '#4ade80', transition: 'width 0.35s ease' },
  wrapper: { width: '100%', maxWidth: 520 },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '36px 32px' },
  cardTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 },
  cardSub: { fontSize: 14, color: '#888', marginBottom: 4 },
  cardBody: { marginTop: 28 },

  tileGroup: { display: 'flex', gap: 12 },
  tile: { flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '14px 18px', background: '#111', border: '1px solid #333', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, background 0.15s' },
  tileSelected: { border: '1px solid #4ade80', background: '#0f2318' },
  tileLabel: { fontSize: 15, fontWeight: 500, color: '#f5f5f5' },
  tileSub: { fontSize: 12, color: '#888' },

  dayGrid: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  dayBtn: { width: 52, height: 52, borderRadius: 10, background: '#111', border: '1px solid #333', color: '#f5f5f5', fontSize: 18, fontWeight: 600, cursor: 'pointer' },
  dayBtnActive: { border: '1px solid #4ade80', background: '#0f2318', color: '#4ade80' },

  numberInputWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  numberInput: { flex: 1, padding: '14px 16px', background: '#111', border: '1px solid #333', borderRadius: 10, color: '#f5f5f5', fontSize: 22, fontWeight: 600, outline: 'none' },
  numberUnit: { fontSize: 16, color: '#888', minWidth: 32 },

  textarea: { width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #333', borderRadius: 10, color: '#f5f5f5', fontSize: 14, resize: 'vertical', outline: 'none' },

  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  navRight: { display: 'flex', gap: 10, marginLeft: 'auto' },
  btnBack: { background: 'none', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer', padding: '8px 0' },
  btnSkip: { padding: '10px 18px', background: 'none', border: '1px solid #333', borderRadius: 8, color: '#888', fontSize: 14, cursor: 'pointer' },
  btnNext: { padding: '10px 24px', background: '#4ade80', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' },

  error: { color: '#f87171', fontSize: 13, marginTop: 12, textAlign: 'center' },
  stepCount: { marginTop: 20, fontSize: 12, color: '#555' },
}
