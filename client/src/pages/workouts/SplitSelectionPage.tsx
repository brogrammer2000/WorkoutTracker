import { getSplitsForDays, type Split } from '@/data/splits'

interface Props {
  workoutDays: number
  onSelect: (split: Split) => void
}

export default function SplitSelectionPage({ workoutDays, onSelect }: Props) {
  const splits = getSplitsForDays(workoutDays)
  const onlyOne = splits.length === 1

  if (splits.length === 0) {
    return (
      <div style={styles.page}>
        <h2 style={styles.heading}>No splits found</h2>
        <p style={styles.sub}>Update your weekly workout frequency in your profile to see split options.</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Choose your workout split</h2>
      <p style={styles.sub}>
        Based on your <strong>{workoutDays} day{workoutDays !== 1 ? 's' : ''}/week</strong> training frequency.
      </p>

      <div style={styles.grid}>
        {splits.map((split) => (
          <SplitCard key={split.id} split={split} showProCon={!onlyOne} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function SplitCard({ split, showProCon, onSelect }: { split: Split; showProCon: boolean; onSelect: (s: Split) => void }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.splitName}>{split.name}</h3>
      <p style={styles.splitDesc}>{split.description}</p>

      <div style={styles.schedule}>
        {split.schedule.map((day, i) => (
          <div key={i} style={styles.dayPill}>
            <span style={styles.dayNum}>Day {i + 1}</span>
            <span style={styles.dayLabel}>{day.label}</span>
          </div>
        ))}
      </div>

      {showProCon && split.pro && split.con && (
        <div style={styles.procon}>
          <div style={styles.pro}>
            <span style={styles.proIcon}>✓</span>
            <span>{split.pro}</span>
          </div>
          <div style={styles.con}>
            <span style={styles.conIcon}>✗</span>
            <span>{split.con}</span>
          </div>
        </div>
      )}

      <button style={styles.selectBtn} onClick={() => onSelect(split)}>
        Choose this split →
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:      { maxWidth: 860, margin: '0 auto', padding: '32px 24px' },
  heading:   { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  sub:       { fontSize: 14, color: '#888', marginBottom: 32 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  card:      { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 },
  splitName: { fontSize: 20, fontWeight: 700, margin: 0 },
  splitDesc: { fontSize: 14, color: '#bbb', lineHeight: 1.6, margin: 0 },
  schedule:  { display: 'flex', flexWrap: 'wrap', gap: 8 },
  dayPill:   { display: 'flex', flexDirection: 'column', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '6px 12px' },
  dayNum:    { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' },
  dayLabel:  { fontSize: 13, fontWeight: 500, color: '#ddd' },
  procon:    { display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #222', paddingTop: 16 },
  pro:       { display: 'flex', gap: 10, fontSize: 13, color: '#a3e635', alignItems: 'flex-start' },
  con:       { display: 'flex', gap: 10, fontSize: 13, color: '#f87171', alignItems: 'flex-start' },
  proIcon:   { fontWeight: 700, flexShrink: 0 },
  conIcon:   { fontWeight: 700, flexShrink: 0 },
  selectBtn: { marginTop: 'auto', padding: '11px 20px', background: '#4ade80', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'center' },
}
