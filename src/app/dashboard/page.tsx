import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { getSession } from "@/lib/session";
import { getStaffById, reviewsFor } from "@/lib/staff-directory";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const staff = getStaffById(session.staffId);
  if (!staff) redirect("/"); // stale or forged cookie referencing an id that no longer exists

  return <DashboardShell staff={staff} reviews={reviewsFor(staff.id)} />;
}
