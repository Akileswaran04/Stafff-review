"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import NetworkField, { type NetworkFieldHandle } from "./NetworkField";
import LoginForm from "./LoginForm";
import { Crenel, Tower } from "./Decor";

const BLURB = "A private space for DIST staff. Enter your staff ID to read what students said — no password, nothing else.".split(" ");
const REVEALED = "[data-title], [data-script], [data-fade], [data-word], [data-form], [data-tower]";

export default function Landing() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const field = useRef<NetworkFieldHandle>(null);
  const scope = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    // the mesh is sampled from the rendered title, so wait for the fonts
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        if (reduce) {
          gsap.fromTo(REVEALED, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.06 });
          return;
        }
        const tl = field.current!.buildIntro({ restingOpacity: 0.16 });

        // once the network has spelled DIST, it resolves into the solid lettering
        tl.fromTo("[data-title]", { opacity: 1, clipPath: "inset(100% 0 0 0)", y: 50 }, { clipPath: "inset(0% 0 0 0)", y: 0, duration: 1, ease: "power3.out" }, "settle")
          .fromTo("[data-script]", { opacity: 1, clipPath: "inset(-20% 100% -20% -5%)" }, { clipPath: "inset(-20% -5% -20% -5%)", duration: 1.3, ease: "power3.out" }, "settle+=0.5")
          .fromTo("[data-tower]", { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }, "settle+=0.3")
          .to("[data-fade]", { opacity: 1, duration: 0.7, stagger: 0.08 }, "settle+=0.5")
          .fromTo("[data-word]", { y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.03 }, "settle+=0.9")
          .fromTo("[data-form]", { y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "settle+=1.1");
      }, scope);
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, [reduce]);

  async function handleAuthenticated() {
    // cross-fade + 4% scale out; the incoming page fades in via app/template.tsx
    await controls.start({ opacity: 0, scale: reduce ? 1 : 1.04, transition: { duration: 0.4, ease: "easeInOut" } });
    router.push("/dashboard");
  }

  return (
    <div ref={scope} className="relative min-h-dvh overflow-hidden bg-midnight text-cream">
      <NetworkField ref={field} anchor={() => title.current} />

      <motion.div animate={controls} className="relative z-10 flex min-h-dvh flex-col px-5 pb-8 pt-6 sm:px-10">
        {/* corner labels */}
        <header data-fade className="grid grid-cols-3 items-start text-sm font-medium uppercase leading-tight text-mute opacity-0 sm:text-base">
          <p>DIST<br />Staff Portal</p>
          <p className="text-center font-display text-3xl leading-none text-cream sm:text-5xl">2026</p>
          <p className="text-right">Information Science<br />&amp; Technology</p>
        </header>

        {/* the word */}
        <div className="relative flex flex-1 items-center justify-center py-4">
          <span data-fade className="absolute left-0 top-[20%] origin-top-left -rotate-90 translate-y-[6ch] text-xs uppercase tracking-[0.3em] text-mute opacity-0 sm:left-[5%]">DIST</span>
          <span data-fade className="absolute right-0 top-[20%] origin-top-right rotate-90 text-xs uppercase tracking-[0.3em] text-mute opacity-0 sm:right-[5%]">DIST</span>

          <h1
            ref={title}
            data-title
            className="distress inline-block select-none font-display uppercase leading-[0.8] opacity-0"
            style={{ fontSize: "min(46vw, 48vh)" }}
          >
            DIST
          </h1>
          {/* brass script with a midnight keyline so it reads over both the ivory letters and the dark ground */}
          <span
            data-script
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 whitespace-nowrap font-script leading-none text-gold opacity-0"
            style={{ fontSize: "min(15vw, 19vh)", WebkitTextStroke: "0.09em #12131A", paintOrder: "stroke fill" }}
          >
            Staff Reviews
          </span>
        </div>

        {/* bottom row */}
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,24rem)_1fr]">
          <p className="max-w-xs text-sm leading-snug text-mute sm:text-base">
            {BLURB.map((w, i) => (
              <span key={i} data-word className="mr-[0.25em] inline-block opacity-0">{w}</span>
            ))}
          </p>

          <div data-form className="opacity-0">
            <LoginForm onAuthenticated={handleAuthenticated} />
          </div>

          <div data-fade className="hidden justify-end opacity-0 lg:flex">
            <Crenel className="h-11 w-28" color="#D4A574" />
          </div>
        </div>
      </motion.div>

      {/* mast rising from the bottom-right, overlapping the lettering */}
      <div data-tower className="pointer-events-none absolute -bottom-6 -right-16 z-[5] w-[70vw] max-w-[680px] opacity-0 lg:-right-10">
        <Tower color="#3A3C4A" />
      </div>
    </div>
  );
}
