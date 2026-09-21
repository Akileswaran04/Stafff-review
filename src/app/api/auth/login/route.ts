import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { findStaff } from "@/lib/demo-data";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const staff = findStaff(String(body?.staffId ?? ""));
  if (!staff) return NextResponse.json({ error: "We couldn't find that staff ID." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, staff.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  return res;
}
