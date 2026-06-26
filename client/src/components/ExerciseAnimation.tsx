import type { MovementPattern } from '@/data/exercises'

const KEYFRAMES = `
@keyframes moveUp    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes moveDown  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(18px)} }
@keyframes squat     { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(0.65) translateY(10px)} }
@keyframes hinge     { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(45deg)} }
@keyframes curlArc   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-110deg)} }
@keyframes extArc    { 0%,100%{transform:rotate(-110deg)} 50%{transform:rotate(0deg)} }
@keyframes rowPull   { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-18px)} }
@keyframes raise     { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-80deg)} }
@keyframes flyOpen   { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(-80deg)} }
@keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
`

interface Props { pattern: MovementPattern }

export default function ExerciseAnimation({ pattern }: Props) {
  const color = '#4ade80'
  const dim = '#1a3a28'

  const animations: Record<MovementPattern, React.ReactNode> = {
    press: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Bar moving up */}
        <g style={{ animation: 'moveUp 1.4s ease-in-out infinite', transformOrigin: '40px 40px' }}>
          <rect x="8" y="36" width="64" height="8" rx="4" fill={color} />
          <circle cx="8"  cy="40" r="7" fill={dim} stroke={color} strokeWidth="2" />
          <circle cx="72" cy="40" r="7" fill={dim} stroke={color} strokeWidth="2" />
        </g>
        {/* Static hands */}
        <circle cx="22" cy="52" r="4" fill={color} opacity={0.4} />
        <circle cx="58" cy="52" r="4" fill={color} opacity={0.4} />
      </svg>
    ),

    pull: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        <g style={{ animation: 'moveDown 1.4s ease-in-out infinite', transformOrigin: '40px 40px' }}>
          <rect x="8" y="36" width="64" height="8" rx="4" fill={color} />
          <circle cx="8"  cy="40" r="7" fill={dim} stroke={color} strokeWidth="2" />
          <circle cx="72" cy="40" r="7" fill={dim} stroke={color} strokeWidth="2" />
        </g>
        <circle cx="22" cy="24" r="4" fill={color} opacity={0.4} />
        <circle cx="58" cy="24" r="4" fill={color} opacity={0.4} />
      </svg>
    ),

    squat: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Body block going down */}
        <g style={{ animation: 'squat 1.6s ease-in-out infinite', transformOrigin: '40px 30px' }}>
          <rect x="28" y="12" width="24" height="30" rx="6" fill={color} />
        </g>
        {/* Legs static base */}
        <rect x="28" y="50" width="10" height="20" rx="4" fill={color} opacity={0.6} />
        <rect x="42" y="50" width="10" height="20" rx="4" fill={color} opacity={0.6} />
      </svg>
    ),

    hinge: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Torso hinging forward */}
        <g style={{ animation: 'hinge 1.6s ease-in-out infinite', transformOrigin: '40px 48px' }}>
          <rect x="32" y="14" width="16" height="34" rx="6" fill={color} />
        </g>
        {/* Legs */}
        <rect x="28" y="50" width="10" height="20" rx="4" fill={color} opacity={0.6} />
        <rect x="42" y="50" width="10" height="20" rx="4" fill={color} opacity={0.6} />
      </svg>
    ),

    curl: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Upper arm fixed */}
        <rect x="36" y="20" width="10" height="26" rx="5" fill={color} opacity={0.5} />
        {/* Forearm curling */}
        <g style={{ animation: 'curlArc 1.4s ease-in-out infinite', transformOrigin: '41px 46px' }}>
          <rect x="36" y="46" width="10" height="22" rx="5" fill={color} />
          <circle cx="41" cy="68" r="7" fill={dim} stroke={color} strokeWidth="2" />
        </g>
      </svg>
    ),

    extension: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        <rect x="36" y="20" width="10" height="26" rx="5" fill={color} opacity={0.5} />
        <g style={{ animation: 'extArc 1.4s ease-in-out infinite', transformOrigin: '41px 46px' }}>
          <rect x="36" y="46" width="10" height="22" rx="5" fill={color} />
          <circle cx="41" cy="68" r="7" fill={dim} stroke={color} strokeWidth="2" />
        </g>
      </svg>
    ),

    row: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Cable/handle moving toward body */}
        <g style={{ animation: 'rowPull 1.4s ease-in-out infinite', transformOrigin: '40px 40px' }}>
          <rect x="10" y="36" width="40" height="8" rx="4" fill={color} />
          <circle cx="50" cy="40" r="7" fill={dim} stroke={color} strokeWidth="2" />
        </g>
        {/* Body anchor */}
        <rect x="60" y="28" width="12" height="24" rx="5" fill={color} opacity={0.4} />
      </svg>
    ),

    raise: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Body */}
        <rect x="34" y="16" width="12" height="28" rx="5" fill={color} opacity={0.5} />
        {/* Arm raising to side */}
        <g style={{ animation: 'raise 1.4s ease-in-out infinite', transformOrigin: '40px 44px' }}>
          <rect x="46" y="38" width="24" height="8" rx="4" fill={color} />
          <circle cx="70" cy="42" r="5" fill={dim} stroke={color} strokeWidth="2" />
        </g>
      </svg>
    ),

    fly: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        {/* Body */}
        <rect x="34" y="24" width="12" height="26" rx="5" fill={color} opacity={0.5} />
        {/* Left arm */}
        <g style={{ animation: 'flyOpen 1.4s ease-in-out infinite', transformOrigin: '34px 38px' }}>
          <rect x="10" y="34" width="24" height="8" rx="4" fill={color} />
        </g>
        {/* Right arm (mirrored) */}
        <g style={{ animation: 'flyOpen 1.4s ease-in-out infinite', transformOrigin: '46px 38px', transform: 'scaleX(-1) translateX(-92px)' }}>
          <rect x="10" y="34" width="24" height="8" rx="4" fill={color} />
        </g>
      </svg>
    ),

    plank: (
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <style>{KEYFRAMES}</style>
        <g style={{ animation: 'pulse 2s ease-in-out infinite' }}>
          {/* Body horizontal */}
          <rect x="10" y="34" width="46" height="12" rx="6" fill={color} />
          {/* Head */}
          <circle cx="64" cy="40" r="8" fill={color} />
          {/* Arms prop */}
          <rect x="14" y="46" width="8" height="16" rx="4" fill={color} opacity={0.7} />
          <rect x="28" y="46" width="8" height="16" rx="4" fill={color} opacity={0.7} />
        </g>
      </svg>
    ),
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: '#111', borderRadius: 12, padding: 16, width: 112, height: 112 }}>
      {animations[pattern]}
    </div>
  )
}
