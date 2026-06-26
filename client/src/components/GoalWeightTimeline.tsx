interface Props {
  currentWeightKg: number
  goalWeightKg: number
  goal: 'lose_weight' | 'gain_muscle' | 'recomp'
  selected: number | null
  onSelect: (kcal: number) => void
}

const STEPS = [400, 500, 600, 700, 800, 900, 1000]

function getDirection(goal: Props['goal'], currentKg: number, goalKg: number): 'deficit' | 'surplus' {
  if (goal === 'gain_muscle') return 'surplus'
  if (goal === 'lose_weight') return 'deficit'
  // recomp: follow the weight direction
  return goalKg < currentKg ? 'deficit' : 'surplus'
}

function getRisk(weeklyKg: number, direction: 'deficit' | 'surplus', currentKg: number) {
  if (direction === 'deficit') {
    const pct = (weeklyKg / currentKg) * 100
    if (pct < 0.5) return { label: 'Conservative', color: '#4ade80' }
    if (pct <= 1)  return { label: 'Moderate',     color: '#fbbf24' }
    return            { label: 'Aggressive',    color: '#f87171' }
  } else {
    if (weeklyKg <= 0.25) return { label: 'Conservative', color: '#4ade80' }
    if (weeklyKg <= 0.5)  return { label: 'Moderate',     color: '#fbbf24' }
    return                 { label: 'Aggressive',    color: '#f87171' }
  }
}

function formatTime(weeks: number): string {
  if (weeks < 1) return '< 1 week'
  if (weeks < 8) return `~${Math.round(weeks)} weeks`
  const months = weeks / 4.33
  return `~${months.toFixed(1)} months`
}

export default function GoalWeightTimeline({ currentWeightKg, goalWeightKg, goal, selected, onSelect }: Props) {
  const diff = Math.abs(goalWeightKg - currentWeightKg)
  const direction = getDirection(goal, currentWeightKg, goalWeightKg)
  const sign = direction === 'deficit' ? '−' : '+'

  if (diff < 0.1) {
    return <p style={hint}>Goal weight is the same as current weight — no adjustment needed.</p>
  }

  return (
    <div>
      <p style={subheading}>
        {diff.toFixed(1)} kg to {direction === 'deficit' ? 'lose' : 'gain'} — pick your pace:
      </p>

      <div style={tableWrap}>
        {/* Header */}
        <div style={{ ...row, background: '#111', borderRadius: '8px 8px 0 0' }}>
          <span style={{ ...cell, color: '#666', fontSize: 11, textTransform: 'uppercase' }}>Daily adjustment</span>
          <span style={{ ...cell, color: '#666', fontSize: 11, textTransform: 'uppercase' }}>Weekly rate</span>
          <span style={{ ...cell, color: '#666', fontSize: 11, textTransform: 'uppercase' }}>Time to goal</span>
          <span style={{ ...cell, color: '#666', fontSize: 11, textTransform: 'uppercase' }}>Risk</span>
        </div>

        {STEPS.map((step) => {
          const weeklyKg = (step * 7) / 7700
          const weeks = diff / weeklyKg
          const risk = getRisk(weeklyKg, direction, currentWeightKg)
          const isSelected = selected === (direction === 'deficit' ? -step : step)

          return (
            <button
              key={step}
              style={{
                ...row,
                background: isSelected ? '#0f2318' : 'transparent',
                border: isSelected ? '1px solid #2d5a3d' : '1px solid transparent',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => onSelect(direction === 'deficit' ? -step : step)}
            >
              <span style={{ ...cell, fontWeight: 600, color: direction === 'deficit' ? '#f87171' : '#4ade80' }}>
                {sign}{step} kcal/day
              </span>
              <span style={{ ...cell, color: '#ccc' }}>
                {weeklyKg.toFixed(2)} kg/wk
              </span>
              <span style={{ ...cell, color: '#ccc' }}>
                {formatTime(weeks)}
              </span>
              <span style={{ ...cell }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: risk.color,
                  background: `${risk.color}18`, padding: '2px 8px', borderRadius: 99 }}>
                  {risk.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <p style={note}>
        Rates above 1% of bodyweight/week risk muscle loss. Surplus above 0.5 kg/week increases fat gain.
        Results are estimates based on energy balance — individual results vary.
      </p>
    </div>
  )
}

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr 1fr 1.1fr',
  alignItems: 'center',
  padding: '10px 14px',
  gap: 8,
  borderBottom: '1px solid #1e1e1e',
  background: 'transparent',
  border: 'none',
}

const cell: React.CSSProperties = { fontSize: 13 }

const tableWrap: React.CSSProperties = {
  borderRadius: 10,
  overflow: 'hidden',
  border: '1px solid #222',
  marginTop: 12,
}

const subheading: React.CSSProperties = { fontSize: 13, color: '#aaa', marginBottom: 4 }
const hint: React.CSSProperties = { fontSize: 13, color: '#666' }
const note: React.CSSProperties = { fontSize: 11, color: '#555', marginTop: 12, lineHeight: 1.5 }
