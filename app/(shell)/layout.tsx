import { redirect } from "next/navigation";
import { Header } from "../components/Header";
import { LeftNav } from "../components/LeftNav";
import { FutureSelfSidebar } from "../components/FutureSelfSidebar";
import { getProfile } from "../lib/data";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  // Onboarding hasn't been completed yet → push them through it.
  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} />
      <div className="flex flex-1">
        <LeftNav profile={profile} />
        <main className="flex-1 min-w-0">{children}</main>
        <FutureSelfSidebar profile={profile} />
      </div>
    </div>
  );
}
