interface Props {
  sex: 'male' | 'female' | null
  value: number | ''
}

// Zone definitions per sex
const ZONES = {
  male: [
    { label: 'Essential', min: 2,  max: 5,  color: '#60a5fa' },
    { label: 'Athlete',   min: 6,  max: 13, color: '#4ade80' },
    { label: 'Fitness',   min: 14, max: 17, color: '#a3e635' },
    { label: 'Average',   min: 18, max: 24, color: '#fbbf24' },
    { label: 'Obese',     min: 25, max: 60, color: '#f87171' },
  ],
  female: [
    { label: 'Essential', min: 10, max: 13, color: '#60a5fa' },
    { label: 'Athlete',   min: 14, max: 20, color: '#4ade80' },
    { label: 'Fitness',   min: 21, max: 24, color: '#a3e635' },
    { label: 'Average',   min: 25, max: 31, color: '#fbbf24' },
    { label: 'Obese',     min: 32, max: 60, color: '#f87171' },
  ],
}

// [shoulderHW, waistHW, hipHW] — half-widths from center (cx=30)
const MALE_SHAPES: [number, number, number][] = [
  [19, 11, 14], // Essential — strong V-taper
  [18, 13, 15], // Athlete
  [17, 17, 17], // Fitness — more rectangular
  [16, 21, 19], // Average — midsection wider
  [15, 26, 21], // Obese — belly dominant
]

const FEMALE_SHAPES: [number, number, number][] = [
  [14, 10, 19], // Essential — narrow waist, wider hips
  [14, 12, 20], // Athlete
  [14, 15, 21], // Fitness
  [14, 19, 22], // Average — fuller throughout
  [15, 23, 23], // Obese — uniform width
]

function getZoneIndex(sex: 'male' | 'female', val: number): number {
  const zones = ZONES[sex]
  for (let i = 0; i < zones.length; i++) {
    if (val <= zones[i].max) return i
  }
  return zones.length - 1
}

function torsoPath(sw: number, ww: number, hw: number): string {
  const cx = 30
  const sy = 30  // shoulder y
  const wy = 63  // waist y
  const hy = 86  // hip y

  const sl = cx - sw, sr = cx + sw
  const wl = cx - ww, wr = cx + ww
  const hl = cx - hw, hr = cx + hw

  // Bezier curves: shoulder → waist → hip, mirrored on both sides
  return [
    `M ${sl} ${sy}`,
    `C ${sl} ${wy - 12} ${wl} ${wy - 4} ${wl} ${wy}`,
    `C ${wl} ${wy + 8} ${hl} ${hy - 5} ${hl} ${hy}`,
    `L ${hr} ${hy}`,
    `C ${hr} ${hy - 5} ${wr} ${wy + 8} ${wr} ${wy}`,
    `C ${wr} ${wy - 4} ${sr} ${wy - 12} ${sr} ${sy}`,
    `Z`,
  ].join(' ')
}

function Silhouette({
  sex,
  shapeIndex,
  zoneIndex,
  active,
}: {
  sex: 'male' | 'female'
  shapeIndex: number
  zoneIndex: number
  active: boolean
}) {
  const shapes = sex === 'male' ? MALE_SHAPES : FEMALE_SHAPES
  const [sw, ww, hw] = shapes[shapeIndex]
  const color = active ? ZONES[sex][zoneIndex].color : '#2a2a2a'
  const labelZone = ZONES[sex][shapeIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg viewBox="0 0 60 100" width={48} height={80}>
        {/* Head */}
        <circle cx={30} cy={13} r={10} fill={color} />
        {/* Neck */}
        <rect x={26} y={22} width={8} height={8} fill={color} />
        {/* Torso */}
        <path d={torsoPath(sw, ww, hw)} fill={color} />
      </svg>
      <span style={{ fontSize: 10, color: active ? ZONES[sex][zoneIndex].color : '#444', fontWeight: active ? 600 : 400 }}>
        {labelZone.label}
      </span>
    </div>
  )
}

function RangeBar({ sex, value }: { sex: 'male' | 'female'; value: number | '' }) {
  const zones = ZONES[sex]
  const totalMin = zones[0].min
  const totalMax = zones[zones.length - 1].max
  const totalRange = totalMax - totalMin

  const markerPct =
    typeof value === 'number' && value >= totalMin
      ? Math.min(((value - totalMin) / totalRange) * 100, 100)
      : null

  const activeZone =
    typeof value === 'number' ? zones.find((z) => value >= z.min && value <= z.max) : null

  return (
    <div style={{ marginTop: 20 }}>
      {/* Zone bar */}
      <div style={{ position: 'relative', height: 8, display: 'flex', borderRadius: 6, overflow: 'visible' }}>
        {zones.map((zone) => (
          <div
            key={zone.label}
            style={{
              flex: zone.max - zone.min,
              background: zone.color,
              opacity: 0.55,
              borderRadius: 0,
            }}
          />
        ))}
        {/* Marker */}
        {markerPct !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${markerPct}%`,
              top: -5,
              transform: 'translateX(-50%)',
              width: 4,
              height: 18,
              background: '#fff',
              borderRadius: 2,
              boxShadow: '0 0 6px rgba(255,255,255,0.5)',
            }}
          />
        )}
      </div>

      {/* Zone range labels */}
      <div style={{ display: 'flex', marginTop: 6 }}>
        {zones.map((zone) => (
          <div
            key={zone.label}
            style={{
              flex: zone.max - zone.min,
              fontSize: 9,
              color: zone.color,
              opacity: 0.7,
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            {zone.min}–{zone.max === 60 ? `${zone.min + 5}+` : zone.max}%
          </div>
        ))}
      </div>

      {/* Active zone label */}
      {activeZone && (
        <p style={{ marginTop: 10, fontSize: 13, color: activeZone.color, textAlign: 'center', fontWeight: 500 }}>
          {activeZone.label} — {activeZone.min}–{activeZone.max === 60 ? `${activeZone.min + 5}%+` : `${activeZone.max}%`}
        </p>
      )}
    </div>
  )
}

export default function BodyFatVisual({ sex, value }: Props) {
  if (!sex) {
    return <p style={{ fontSize: 13, color: '#555', textAlign: 'center' }}>Select your sex in step 3 to see body type references.</p>
  }

  const activeZoneIndex = typeof value === 'number' ? getZoneIndex(sex, value) : -1

  return (
    <div>
      {/* Silhouettes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        {ZONES[sex].map((_, i) => (
          <Silhouette
            key={i}
            sex={sex}
            shapeIndex={i}
            zoneIndex={i}
            active={activeZoneIndex === i}
          />
        ))}
      </div>

      {/* Range bar */}
      <RangeBar sex={sex} value={value} />
    </div>
  )
}
