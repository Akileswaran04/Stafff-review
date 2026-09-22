"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Staff } from "@/lib/types";
import { initials } from "@/lib/stats";
import { Swoosh } from "./Decor";

export default function ProfileHeader({
  staff, count, onLogout, leaving,
}: {
  staff: Staff; count: number; onLogout: () => void; leaving: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.header
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl px-5 pt-6 sm:px-8"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-start text-sm font-medium uppercase leading-tight text-mute sm:text-base">
        <p>DIST<br />Staff Portal</p>
        <p className="font-display text-3xl leading-none text-cream sm:text-5xl">2026</p>
        <div className="flex justify-end">
          <button
            onClick={onLogout}
            disabled={leaving}
            className="rounded-sm border border-gold px-5 py-2 text-sm font-bold uppercase tracking-wide text-gold transition hover:bg-gold hover:text-midnight disabled:opacity-50"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="relative mt-12 pb-16 sm:mt-16 sm:pb-24">
        {/* softer speckle: the name must stay the highest-contrast thing on the page */}
        <h1 className="distress-soft font-display text-[clamp(3.25rem,12.5vw,10.5rem)] uppercase leading-[1.02]">{staff.name}</h1>
        {/* the flourish sits below-right of the name, clear of the letters */}
        <span
          className="pointer-events-none absolute -bottom-5 right-0 -rotate-6 whitespace-nowrap font-script leading-none text-gold sm:right-6"
          style={{ fontSize: "clamp(3.25rem,9vw,7.5rem)" }}
        >
          Reviews
        </span>
        <Swoosh className="absolute bottom-2 left-0 h-8 w-[min(28rem,55%)]" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-sm bg-gold font-display text-lg text-midnight">
          {staff.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={staff.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(staff.name)
          )}
        </span>
        <span className="font-mono text-sm tracking-id text-gold">{staff.id}</span>
        <span className="text-sm text-mute">{count} {count === 1 ? "review" : "reviews"}</span>
      </div>
    </motion.header>
  );
}
