import { redirect } from "next/navigation";
import { Header } from "../components/Header";
import { ConditionalSidebar } from "../components/ConditionalSidebar";
import { getProfile, getJourneyState } from "../lib/data";

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

  const journey = await getJourneyState();

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={profile}
        journeyDay={journey.journeyDay}
        practicedDays={journey.practicedDays}
      />
      <div className="flex flex-1">
        <main className="flex-1 min-w-0">{children}</main>
        <ConditionalSidebar profile={profile} />
      </div>
    </div>
  );
}
