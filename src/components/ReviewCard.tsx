"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/stats";
import RatingDots from "./RatingDots";

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
export const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/**
 * Flat panel, identical height on every card. Name, rating and date are always visible. With privacy mode on, only the comment
 * is blurred until you hover / focus the card. Click opens the full review. Touch screens have no
 * hover, so the comment is shown outright there.
 */
export default function ReviewCard({
  review, variants, onOpen, privacy,
}: { review: Review; variants: Variants; onOpen: (r: Review, trigger: HTMLElement) => void; privacy: boolean }) {
  const reduce = useReducedMotion();
  const [canHover, setCanHover] = useState(true);
  const [hot, setHot] = useState(false);
  useEffect(() => setCanHover(window.matchMedia("(hover: hover)").matches), []);
  const revealed = !privacy || !canHover || hot;

  return (
    <motion.article
      variants={variants}
      role="button"
      tabIndex={0}
      aria-label={`Open review by ${review.student_alias}, rated ${review.rating} out of 5`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
      onPointerLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onClick={(e) => onOpen(review, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(review, e.currentTarget); }
      }}
      className="review-card relative flex cursor-pointer flex-col overflow-hidden rounded p-4 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-display text-lg uppercase leading-none tracking-wide">{review.student_alias}</h3>
        <RatingDots rating={review.rating} />
      </div>

      {/* fixed three-line slot: every card ends up the same height whatever the review length */}
      <div className="relative my-3 h-[4.1rem]">
        <motion.p
          animate={{ filter: revealed ? "blur(0px)" : "blur(6px)", opacity: revealed ? 1 : 0.55 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="line-clamp-3 select-none text-sm font-medium leading-snug text-cream/90"
        >
          {review.comment || "No written comment."}
        </motion.p>
        {privacy && (
          <motion.span
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.22em] text-mute"
          >
            Hover to reveal
          </motion.span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-rule pt-3">
        <time dateTime={review.created_at} className="font-mono text-[11px] leading-none tracking-id text-mute">{formatDate(review.created_at)}</time>
        <span className="review-open rounded-sm px-2 py-[3px] text-[10px] font-bold uppercase leading-none tracking-wide">
          Open <span aria-hidden>↗</span>
        </span>
      </div>
    </motion.article>
  );
}
