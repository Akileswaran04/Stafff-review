"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Review } from "@/lib/types";
import { formatDate, SENTIMENT_COLOR, sentimentOf } from "@/lib/stats";
import RatingDots from "./RatingDots";

const LABEL = { positive: "Positive", neutral: "Neutral", attention: "Needs attention" } as const;

export default function ReviewModal({ review, onClose }: { review: Review | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!review) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // keep focus inside the dialog: the close box is its only control
      if (e.key === "Tab") { e.preventDefault(); closeBtn.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [review, onClose]);

  const s = review ? sentimentOf(review.rating) : "neutral";

  return (
    <AnimatePresence>
      {review && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-midnight/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: reduce ? 0 : 40, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.98 }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 30 }}
            className="relative my-auto w-full max-w-2xl overflow-hidden rounded border border-rule bg-panel p-8 pl-10 shadow-[8px_8px_0_#D4A574] sm:p-12 sm:pl-14"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: SENTIMENT_COLOR[s] }} />

            {/* the close box */}
            <button
              ref={closeBtn}
              onClick={onClose}
              aria-label="Close review"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-sm border border-cream/40 text-cream transition hover:border-gold hover:bg-gold hover:text-midnight"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" aria-hidden>
                <path d="M4 4l16 16M20 4L4 20" />
              </svg>
            </button>

            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-mute">
              <span className="h-2 w-2" style={{ background: SENTIMENT_COLOR[s] }} />
              {LABEL[s]}
            </p>
            <h2 id="review-title" className="mt-3 pr-14 font-display text-5xl uppercase leading-none text-cream sm:text-6xl">{review.student_alias}</h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <RatingDots rating={review.rating} size={11} />
              <time dateTime={review.created_at} className="font-mono text-xs tracking-id text-mute">{formatDate(review.created_at)}</time>
            </div>

            <blockquote className="mt-8 text-2xl font-medium leading-snug text-cream sm:text-3xl">
              {review.comment || <span className="text-mute">No written comment.</span>}
            </blockquote>

            {review.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {review.tags.map((t) => (
                  <span key={t} className="rounded-sm border border-rule px-3 py-1 text-sm text-mute">{t}</span>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
