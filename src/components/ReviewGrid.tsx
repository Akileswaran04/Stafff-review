"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Review } from "@/lib/types";
import ReviewCard, { cardVariants, reducedCardVariants } from "./ReviewCard";
import ReviewModal from "./ReviewModal";
import { Swoosh } from "./Decor";

export default function ReviewGrid({ reviews }: { reviews: Review[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<Review | null>(null);
  const [privacy, setPrivacy] = useState(false); // comments are visible on load; blur is opt-in
  const trigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try { setPrivacy(localStorage.getItem("review-privacy") === "1"); } catch {}
  }, []);
  const togglePrivacy = () => {
    setPrivacy((p) => {
      try { localStorage.setItem("review-privacy", p ? "0" : "1"); } catch {}
      return !p;
    });
  };

  // newest first
  const sorted = useMemo(() => [...reviews].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)), [reviews]);

  const openReview = useCallback((r: Review, el: HTMLElement) => { trigger.current = el; setOpen(r); }, []);
  const close = useCallback(() => { setOpen(null); trigger.current?.focus(); }, []);

  return (
    <section aria-labelledby="all-reviews" className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
        <div>
          <h2 id="all-reviews" className="font-display text-4xl uppercase text-cream">In their words</h2>
          {/* the signature swoosh again, thinner and slightly off-level */}
          <Swoosh className="-ml-1 mt-2 h-5 w-44 -rotate-1" strokeWidth={1.75} />
        </div>

        <button
          role="switch"
          aria-checked={privacy}
          onClick={togglePrivacy}
          className="flex items-center gap-3 rounded-sm border border-rule px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:border-gold"
        >
          Privacy blur
          <span className={`relative h-5 w-9 rounded-sm transition-colors ${privacy ? "bg-gold" : "bg-dim"}`}>
            <motion.span
              className={`absolute top-0.5 h-4 w-4 rounded-sm ${privacy ? "bg-midnight" : "bg-cream"}`}
              animate={{ left: privacy ? 18 : 2 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
            />
          </span>
          <span className="w-6 text-left text-xs text-mute">{privacy ? "On" : "Off"}</span>
        </button>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.08 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4"
      >
        {sorted.map((r) => (
          <ReviewCard key={r.id} review={r} variants={reduce ? reducedCardVariants : cardVariants} onOpen={openReview} privacy={privacy} />
        ))}
      </motion.div>

      <ReviewModal review={open} onClose={close} />
    </section>
  );
}
