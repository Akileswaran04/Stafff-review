"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { Review, Staff } from "@/lib/types";
import NetworkField, { type NetworkFieldHandle } from "./NetworkField";
import ProfileHeader from "./ProfileHeader";
import ReviewGrid from "./ReviewGrid";
import EmptyState from "./EmptyState";
import { Crenel, Tower } from "./Decor";

export default function DashboardShell({ staff, reviews }: { staff: Staff; reviews: Review[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const field = useRef<NetworkFieldHandle>(null);
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    const clearCookie = fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // reverse of the intro: the mesh breaks apart and collapses into the single dot
    if (reduce) await new Promise((r) => setTimeout(r, 250));
    else { await new Promise((r) => requestAnimationFrame(() => r(null))); await field.current?.playOutro(); }
    await clearCookie;
    router.replace("/");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-midnight text-cream">
      <ProfileHeader staff={staff} count={reviews.length} onLogout={logout} leaving={leaving} />
      {reviews.length === 0 ? <EmptyState /> : <ReviewGrid reviews={reviews} />}

      <footer className="relative mt-8 h-56 overflow-hidden">
        <div className="pointer-events-none absolute -bottom-4 -right-10 w-[60vw] max-w-[520px]">
          <Tower color="#2A2C38" />
        </div>
        <div className="relative mx-auto flex h-full max-w-6xl items-end justify-between px-5 pb-10 sm:px-8">
          <Crenel className="h-11 w-28" color="#D4A574" />
          <p className="font-display text-3xl uppercase text-gold sm:text-4xl">DIST 2026</p>
        </div>
      </footer>

      {leaving && (
        <motion.div
          className="fixed inset-0 z-50 bg-midnight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0.25 : 0.35 }}
        >
          {!reduce && <NetworkField ref={field} />}
        </motion.div>
      )}
    </div>
  );
}
