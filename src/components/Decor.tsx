/** Black lattice-tower silhouette (echoes the crane in the reference — here it reads as a network mast). */
export function Tower({ className = "", color = "#0A0A0A" }: { className?: string; color?: string }) {
  const bars: React.ReactNode[] = [];
  // mast: x 262..302, levels of 30px, X-bracing
  for (let y = 150; y < 500; y += 30) {
    bars.push(<path key={`h${y}`} d={`M262 ${y}H302`} />);
    bars.push(<path key={`x${y}`} d={y % 60 === 0 ? `M262 ${y}L302 ${y + 30}` : `M302 ${y}L262 ${y + 30}`} />);
  }
  // jib: y 120..150 from x=20 to 600
  for (let x = 20; x < 600; x += 30) {
    bars.push(<path key={`v${x}`} d={`M${x} 120V150`} />);
    bars.push(<path key={`d${x}`} d={x % 60 === 20 ? `M${x} 120L${x + 30} 150` : `M${x} 150L${x + 30} 120`} />);
  }
  return (
    <svg viewBox="0 0 620 500" fill="none" stroke={color} strokeWidth="3" strokeLinecap="square" aria-hidden className={className}>
      {bars}
      <path d="M20 120H600M20 150H600M262 150V500M302 150V500" strokeWidth="5" />
      {/* spike, cables, cab, counterweight, flag */}
      <path d="M282 30L262 120M282 30L302 120M282 30L40 120M282 30L590 120" />
      <path d="M282 30V6M282 6H306L296 14L306 22H282" />
      <rect x="252" y="96" width="60" height="24" fill={color} />
      <rect x="8" y="120" width="44" height="46" fill={color} />
      <rect x="248" y="150" width="68" height="34" fill={color} />
    </svg>
  );
}

/** The crenellated brand mark from the reference. */
export function Crenel({ className = "", color = "#F5F1E8" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 112 44" aria-hidden className={className}>
      <path fill={color} d="M0 0H24V14H36V0H60V14H72V0H96V14H112V44H88V30H76V44H52V30H40V44H16V30H0Z" />
    </svg>
  );
}

/** Two hand-drawn swooshes, used as underlines. */
export function Swoosh({ className = "", color = "#D4A574", strokeWidth = 3 }: { className?: string; color?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 400 40" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden className={className}>
      <path d="M2 34C90 12 230 6 398 10" />
      <path d="M60 38C150 20 260 16 398 22" />
    </svg>
  );
}

/**
 * Thin-line botanical sprig — a stem with a few leaves and one open flower, in the spirit of a
 * hand-drawn greeting-card corner spray. `flip` mirrors it for the opposite corner.
 */
export function FloralSprig({ className = "", color = "#4A5D46", flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={flip ? { transform: "rotate(180deg)" } : undefined}
    >
      {/* stem */}
      <path d="M8 8C34 26 46 46 54 74S70 128 100 150" />
      {/* leaves along the stem */}
      <path d="M22 20C34 16 42 22 44 32C32 34 22 30 22 20Z" />
      <path d="M38 44C50 38 60 42 64 52C50 56 40 54 38 44Z" />
      <path d="M56 78C68 72 78 76 82 86C68 90 58 88 56 78Z" />
      <path d="M70 112C82 106 92 110 96 120C82 124 72 122 70 112Z" />
      {/* open flower at the tip */}
      <g transform="translate(112 138)">
        <circle r="4.5" />
        <path d="M0 -4.5C-9 -12 -9 -22 0 -22C9 -22 9 -12 0 -4.5Z" />
        <path d="M4.5 0C12 -9 22 -9 22 0C22 9 12 9 4.5 0Z" />
        <path d="M0 4.5C9 12 9 22 0 22C-9 22 -9 12 0 4.5Z" />
        <path d="M-4.5 0C-12 9 -22 9 -22 0C-22 -9 -12 -9 -4.5 0Z" />
      </g>
      <circle cx="26" cy="20" r="1.6" fill={color} stroke="none" />
      <circle cx="46" cy="46" r="1.6" fill={color} stroke="none" />
    </svg>
  );
}
