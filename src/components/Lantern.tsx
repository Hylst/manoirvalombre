interface Props {
  fraction: number; // 0 → 1 (cire restante)
  className?: string;
}

export default function Lantern({ fraction, className }: Props) {
  const f = Math.max(0, Math.min(1, fraction));
  const waxH = 34 * f;
  const baseY = 80;
  const topY = baseY - waxH;
  const lit = f > 0;

  return (
    <svg viewBox="0 0 80 100" className={className} aria-label="Lanterne de courge">
      <defs>
        <radialGradient id="pk" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#ff9a2e" />
          <stop offset="1" stopColor="#b8480a" />
        </radialGradient>
        <radialGradient id="lg" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#ffd36a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ff8a1e" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* anse */}
      <path d="M22 28 Q40 -4 58 28" fill="none" stroke="#6b5a3c" strokeWidth="2.5" />
      {/* tige */}
      <path d="M36 24 Q38 14 44 13 L46 18 Q42 20 44 26Z" fill="#4b6b2a" />
      {/* corps */}
      <ellipse cx="40" cy="58" rx="35" ry="31" fill="url(#pk)" stroke="#6e2a05" strokeWidth="1.5" />
      <path d="M40 27 Q22 58 40 89" fill="none" stroke="#8a3406" strokeOpacity="0.6" strokeWidth="1.6" />
      <path d="M40 27 Q58 58 40 89" fill="none" stroke="#8a3406" strokeOpacity="0.6" strokeWidth="1.6" />
      <path d="M40 27 Q8 58 40 89" fill="none" stroke="#8a3406" strokeOpacity="0.4" strokeWidth="1.4" />
      <path d="M40 27 Q72 58 40 89" fill="none" stroke="#8a3406" strokeOpacity="0.4" strokeWidth="1.4" />
      {/* yeux */}
      <path d="M17 44 L27 36 L29 47Z" fill={lit ? "#ffd36a" : "#2a0f02"} />
      <path d="M63 44 L53 36 L51 47Z" fill={lit ? "#ffd36a" : "#2a0f02"} />
      {/* bouche / vitre */}
      <rect x="25" y="44" width="30" height="38" rx="5" fill="#1a0a03" stroke="#4a1d04" strokeWidth="1.2" />
      {lit && <ellipse cx="40" cy="62" rx="22" ry="26" fill="url(#lg)" opacity={0.35 + 0.65 * f} />}
      {/* bougie */}
      {f > 0 && (
        <>
          <rect x="34" y={topY} width="12" height={waxH} rx="2" fill="#f3e6b8" />
          <rect x="34" y={topY} width="4" height={waxH} rx="2" fill="#fff6d6" opacity="0.7" />
          {/* gouttes */}
          <path d={`M34 ${topY} q-3 5 0 9 q3 -3 0 -9z`} fill="#f3e6b8" />
          <path d={`M46 ${topY} q3 8 0 14 q-3 -5 0 -14z`} fill="#eadba6" />
          <line x1="40" y1={topY} x2="40" y2={topY - 4} stroke="#222" strokeWidth="1" />
          <g className="lantern-flame">
            <path d={`M40 ${topY - 17} Q47 ${topY - 8} 40 ${topY - 3} Q33 ${topY - 8} 40 ${topY - 17}Z`} fill="#ff8a1e" />
            <path d={`M40 ${topY - 12} Q44 ${topY - 7} 40 ${topY - 3} Q36 ${topY - 7} 40 ${topY - 12}Z`} fill="#ffe27a" />
          </g>
        </>
      )}
      <rect x="31" y="80" width="18" height="3" fill="#3a2a18" />
    </svg>
  );
}
