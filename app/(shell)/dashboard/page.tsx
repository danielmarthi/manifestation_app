import { redirect } from "next/navigation";

// The dashboard was renamed to /today. Keep this redirect for old links/bookmarks.
export default function DashboardRedirect() {
  redirect("/today");
}
