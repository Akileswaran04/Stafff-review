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
