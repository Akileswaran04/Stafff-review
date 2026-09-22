import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import type { Review, Staff } from "./types";
import { REVIEWS, STAFF } from "./staff-directory.data";

// "server-only" makes this a build error, not a runtime leak, if anything ever imports this from
// a Client Component — the only thing that should ship to the browser is what a signed-in staff
// member sees about themselves, rendered server-side.

const PEPPER = process.env.PORTAL_LOGIN_PEPPER;
if (!PEPPER) {
  throw new Error("PORTAL_LOGIN_PEPPER is not set. Add it to .env.local (see .env.example).");
}

// Keep in sync with scripts/generate-staff-directory.mjs's `deriveHash`.
function deriveHash(code: string, saltHex: string): string {
  const keyed = createHmac("sha256", PEPPER!).update(code).digest();
  return scryptSync(keyed, Buffer.from(saltHex, "hex"), 64).toString("hex");
}

function toStaff({ id, name, dept, avatar_url }: (typeof STAFF)[number]): Staff {
  return { id, name, dept, avatar_url };
}

/**
 * Checks a login code against every record's salted, peppered scrypt hash. Nothing in this file
 * or in staff-directory.data.ts ever stores the plaintext code, so reading either — including via
 * the public GitHub repo — does not reveal a working login.
 */
export function verifyLoginCode(code: string): Staff | null {
  const normalized = code.trim().toUpperCase();
  for (const rec of STAFF) {
    const candidate = Buffer.from(deriveHash(normalized, rec.salt), "hex");
    const stored = Buffer.from(rec.hash, "hex");
    if (candidate.length === stored.length && timingSafeEqual(candidate, stored)) return toStaff(rec);
  }
  return null;
}

export function getStaffById(id: string): Staff | undefined {
  const rec = STAFF.find((s) => s.id === id);
  return rec ? toStaff(rec) : undefined;
}

export function reviewsFor(staffId: string): Review[] {
  return (REVIEWS[staffId] ?? []).map((r, i) => ({ id: `${staffId}-${i}`, staff_id: staffId, ...r }));
}
