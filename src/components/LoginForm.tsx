"use client";

import { forwardRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DEMO_STAFF } from "@/lib/demo-data";
import MagneticButton from "./MagneticButton";
import { useTypewriterPlaceholder } from "./useTypewriterPlaceholder";

const EXAMPLES = ["DIST-1042", "DIST-2210", "DIST-0387", "DIST-1519"];

/** Calls onAuthenticated after the cookie is set; failures show inline with a shake. */
const LoginForm = forwardRef<HTMLFormElement, { onAuthenticated: () => void | Promise<void> }>(function LoginForm(
  { onAuthenticated },
  ref,
) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const placeholder = useTypewriterPlaceholder(EXAMPLES, focused || value.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading" || !value.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ staffId: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      await onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
      setShake((n) => n + 1);
    }
  }

  const loading = status === "loading";

  return (
    <form ref={ref} onSubmit={submit} noValidate className="mx-auto w-full max-w-sm">
      <motion.div
        key={shake}
        animate={shake && !reduce ? { x: [0, -9, 8, -5, 3, 0] } : undefined}
        transition={{ duration: 0.45 }}
        className="animate-ring-pulse rounded bg-panel"
      >
        <label htmlFor="staff-id" className="sr-only">Staff ID</label>
        <input
          id="staff-id"
          value={value}
          onChange={(e) => { setValue(e.target.value.toUpperCase()); if (status === "error") setStatus("idle"); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder || " "}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={status === "error"}
          aria-describedby="login-error"
          disabled={loading}
          className="w-full rounded bg-transparent px-6 py-4 text-center font-mono text-lg font-medium uppercase tracking-id text-gold outline-none placeholder:text-mute/60 focus-visible:outline-none"
        />
      </motion.div>

      <p id="login-error" role="alert" className="mt-3 min-h-5 text-center text-sm font-medium text-clay">
        {status === "error" ? error : ""}
      </p>

      <MagneticButton className="mt-3">
        <motion.button
          type="submit"
          disabled={loading}
          aria-label={loading ? "Signing in" : "Open my reviews"}
          animate={{
            width: loading ? 56 : "100%",
            borderRadius: loading && !reduce ? ["3px", "30%", "50%"] : "3px",
          }}
          transition={{ duration: reduce ? 0.15 : 0.55, ease: [0.65, 0, 0.35, 1] }}
          className="grid h-14 place-items-center overflow-hidden bg-gold font-bold uppercase tracking-wide text-midnight transition-colors hover:bg-cream"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-midnight/30 border-t-midnight" />
          ) : (
            <span>Open my reviews</span>
          )}
        </motion.button>
      </MagneticButton>

      <div className="mt-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-mute">Demo IDs</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {DEMO_STAFF.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={loading}
              onClick={() => { setValue(s.id); setStatus("idle"); setError(""); }}
              className="rounded-sm border border-rule px-3 py-1 font-mono text-xs tracking-id text-gold transition hover:border-gold"
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
});

export default LoginForm;
