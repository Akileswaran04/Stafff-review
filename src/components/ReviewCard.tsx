"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Review } from "@/lib/types";

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
export const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

const CORNERS = ["left-[4.5px] top-[4.5px]", "right-[4.5px] top-[4.5px]", "bottom-[4.5px] left-[4.5px]", "bottom-[4.5px] right-[4.5px]"];

/**
 * Playing-card / tarot tile with exactly two things on it: the review, and one word (its first
 * tag) as the title banner. A fine brass frame with diamond corners sits inside the edge.
 * Hover: the card pops up and tilts a hair (alternating direction) and flips to solid brass with a
 * hard ivory shadow. With privacy mode on, the review is also blurred until hover / focus.
 * Click opens the full review; touch screens skip hover. `featured` makes it a double-width lead card.
 */
export default function ReviewCard({
  review, variants, onOpen, privacy, index, featured = false,
}: {
  review: Review; variants: Variants; onOpen: (r: Review, trigger: HTMLElement) => void;
  privacy: boolean; index: number; featured?: boolean;
}) {
  const reduce = useReducedMotion();
  const [canHover, setCanHover] = useState(true);
  const [hot, setHot] = useState(false);
  useEffect(() => setCanHover(window.matchMedia("(hover: hover)").matches), []);
  const revealed = !privacy || !canHover || hot;
  const tilt = index % 2 ? 0.7 : -0.7;
  const word = review.tags[0] ?? "Review";

  return (
    <motion.article
      variants={variants}
      whileHover={reduce ? undefined : { y: -8, rotate: tilt, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 22 } }}
      role="button"
      tabIndex={0}
      aria-label={`Open review by ${review.student_alias}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
      onPointerLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onClick={(e) => onOpen(review, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(review, e.currentTarget); }
      }}
      className={`review-card group relative flex h-80 cursor-pointer flex-col overflow-hidden rounded-sm p-5 text-center ${featured ? "col-span-2" : ""}`}
    >
      {/* fine inner frame with diamond corners */}
      <span aria-hidden className="card-frame pointer-events-none absolute inset-2" />
      {CORNERS.map((pos) => (
        <span key={pos} aria-hidden className={`card-dia pointer-events-none absolute ${pos}`} />
      ))}

      {/* the review, centred */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-4">
        <motion.p
          animate={{ filter: revealed ? "blur(0px)" : "blur(7px)", opacity: revealed ? 1 : 0.5 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className={`select-none font-medium ${featured ? "line-clamp-4 text-xl leading-[1.2] sm:line-clamp-6 sm:text-[2rem] sm:leading-[1.12]" : "line-clamp-4 text-sm leading-snug sm:line-clamp-8 sm:text-[17px] sm:leading-[1.35]"}`}
        >
          {review.comment || "No written comment."}
        </motion.p>

        {privacy && (
          <motion.span
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.22em] opacity-70"
          >
            Hover to reveal
          </motion.span>
        )}
      </div>

      {/* title banner: one word between two rules */}
      <div className="relative flex items-center gap-3 px-3 pb-3">
        <span className="card-rule h-px flex-1" />
        <span className="card-word min-w-0 truncate font-display text-base uppercase leading-none tracking-[0.1em] sm:text-lg sm:tracking-[0.28em]">{word}</span>
        <span className="card-rule h-px flex-1" />
      </div>
    </motion.article>
  );
}
