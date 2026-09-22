import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getStaffById } from "./staff-directory";

export const SESSION_COOKIE = "staff_session";
const TTL_MS = 1000 * 60 * 60 * 2; // 2 hours
export const SESSION_TTL_SECONDS = TTL_MS / 1000;

const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  throw new Error("SESSION_SECRET is not set. Add it to .env.local (see .env.example).");
}

const sign = (payload: string) => createHmac("sha256", SECRET!).update(payload).digest("hex");

/**
 * Signed, stateless session token: `${staffId}:${expiresAtMs}.${hmac}`. The staff id inside it
 * isn't a secret (it grants nothing by itself), but the signature means a tampered or hand-crafted
 * cookie — e.g. someone else's id pasted in via devtools — fails verification instead of just working.
 */
export function createSessionToken(staffId: string): string {
  const payload = `${staffId}:${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);

  let given: Buffer, expected: Buffer;
  try {
    given = Buffer.from(token.slice(dot + 1), "hex");
    expected = Buffer.from(sign(payload), "hex");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const [staffId, expiresAt] = payload.split(":");
  if (!staffId || Date.now() > Number(expiresAt)) return null;

  return getStaffById(staffId) ? { staffId } : null;
}
