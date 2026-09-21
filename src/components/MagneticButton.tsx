"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Wraps a child so it drifts toward the cursor while the pointer is within a small
 * radius (the padded hit-area). Snaps back on leave. No-op under reduced motion.
 */
export default function MagneticButton({
  children,
  radius = 28,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  radius?: number;
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  const move = (e: React.PointerEvent) => {
    if (reduce || !area.current) return;
    const r = area.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { x.set(0); y.set(0); };

  return (
    <div
      ref={area}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ padding: radius, margin: -radius }}
      className={`flex justify-center ${className}`}
    >
      <motion.div style={{ x, y }} className="flex w-full justify-center">{children}</motion.div>
    </div>
  );
}
