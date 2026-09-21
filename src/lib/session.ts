import { cookies } from "next/headers";
import { findStaff } from "./demo-data";

export const SESSION_COOKIE = "staff_session";

/** Demo session: the httpOnly cookie holds the staff ID, validated against the hardcoded list. */
export async function getSession() {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  const staff = id ? findStaff(id) : undefined;
  return staff ? { staffId: staff.id } : null;
}
