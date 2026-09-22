"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/stats";
import RatingDots from "./RatingDots";
import { FloralSprig } from "./Decor";

/**
 * The "pop card": clicking a review blooms it open into an actual thank-you greeting card — sage
 * green, an organic blob behind the heading, hand-drawn botanical corners, the review read as the
 * letter itself. Same open/close mechanics as before (spring in, Escape/backdrop/close-box out).
 */
export default function ReviewModal({
  review, staffName, onClose,
}: { review: Review | null; staffName: string; onClose: () => void }) {
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
            initial={{ opacity: 0, y: reduce ? 0 : 40, rotate: reduce ? 0 : -2, scale: reduce ? 1 : 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.98 }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 28 }}
            className="thankyou-card relative my-auto w-full max-w-xl overflow-hidden rounded-md p-9 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] sm:p-12"
          >
            {/* organic blob behind the heading, and botanical sprigs in opposite corners */}
            <span aria-hidden className="ty-blob pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-[42%_58%_65%_35%/45%_40%_60%_55%]" />
            <FloralSprig className="pointer-events-none absolute -left-3 -top-3 h-24 w-24 opacity-90 sm:h-28 sm:w-28" />
            <FloralSprig flip className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 opacity-90 sm:h-28 sm:w-28" />

            {/* the close box */}
            <button
              ref={closeBtn}
              onClick={onClose}
              aria-label="Close card"
              className="ty-close absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
                <path d="M4 4l16 16M20 4L4 20" />
              </svg>
            </button>

            <div className="relative">
              <p className="ty-kicker text-center font-mono text-[11px] uppercase tracking-[0.3em]">Teachers&rsquo; Day</p>
              <h2 id="review-title" className="ty-heading mt-2 text-center font-script text-6xl leading-none sm:text-7xl">Thank you!</h2>

              <p className="ty-ink mt-8 text-sm sm:text-base">Dear {staffName},</p>
              <blockquote className="ty-ink mt-3 text-lg leading-relaxed sm:text-xl">
                {review.comment || <span className="ty-mute">No written comment.</span>}
              </blockquote>

              <p className="ty-mute mt-6 text-sm sm:text-base">With warmest regards,</p>
              <p className="ty-signature -mt-1 font-script text-4xl leading-none sm:text-5xl">{review.student_alias}</p>

              <div className="ty-rule mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <RatingDots rating={review.rating} size={9} />
                <time dateTime={review.created_at} className="ty-mute font-mono text-xs tracking-id">{formatDate(review.created_at)}</time>
              </div>

              {review.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {review.tags.map((t) => (
                    <span key={t} className="ty-tag rounded-full px-3 py-1 text-xs font-medium">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
