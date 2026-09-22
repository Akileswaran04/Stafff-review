import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken } from "@/lib/session";
import { verifyLoginCode } from "@/lib/staff-directory";

const CODE_PATTERN = /^[A-Z]{2,6}-[A-Z0-9]{6,10}$/;

// Best-effort per-instance throttle. Login codes are high-entropy (~40 bits) and hashed with a
// server-side pepper, so this isn't the only thing standing between an attacker and a guess — but
// a real deployment behind multiple instances should still put a real limiter (Upstash / edge WAF)
// in front of this.
const hits = new Map<string, { n: number; reset: number }>();
function throttled(key: string) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + 60_000 });
    return false;
  }
  return ++h.n > 8;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const code = String(body?.staffId ?? "").trim().toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    return NextResponse.json({ error: "That doesn't look like a staff ID." }, { status: 400 });
  }

  const staff = verifyLoginCode(code);
  if (!staff) return NextResponse.json({ error: "We couldn't find that staff ID." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(staff.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
