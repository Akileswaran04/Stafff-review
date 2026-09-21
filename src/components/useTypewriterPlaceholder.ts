"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Loops through examples with a typewriter effect. Static first example under reduced motion. */
export function useTypewriterPlaceholder(examples: string[], paused = false) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(examples[0] ?? "");

  useEffect(() => {
    if (reduce || paused) { setText(examples[0] ?? ""); return; }
    let i = 0, n = 0, dir: 1 | -1 = 1, t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = examples[i];
      n += dir;
      setText(word.slice(0, n));
      let wait = dir === 1 ? 90 : 45;
      if (dir === 1 && n === word.length) { dir = -1; wait = 1600; }
      else if (dir === -1 && n === 0) { dir = 1; i = (i + 1) % examples.length; wait = 400; }
      t = setTimeout(tick, wait);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, paused, examples.join("|")]);

  return text;
}
