import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { getSession } from "@/lib/session";
import { findStaff, reviewsFor } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const staff = findStaff(session.staffId)!;
  return <DashboardShell staff={staff} reviews={reviewsFor(staff.id)} />;
}
