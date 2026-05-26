import {
  getProfile,
  getAllEvidence,
  getWeeklyInsights,
  getMilestoneSummaries,
  getPracticeDaysCount,
} from "../../lib/data";
import { EvidencePageClient } from "./EvidencePageClient";

export default async function EvidencePage() {
  const [profile, all, weeklyInsights, milestoneSummaries, totalDays] =
    await Promise.all([
      getProfile(),
      getAllEvidence(),
      getWeeklyInsights(),
      getMilestoneSummaries(),
      getPracticeDaysCount(),
    ]);

  if (!profile) return null;

  return (
    <EvidencePageClient
      entries={all}
      weeklyInsights={weeklyInsights}
      milestoneSummaries={milestoneSummaries}
      totalDays={totalDays}
      streak={profile.streak ?? 0}
      firstName={profile.first_name ?? undefined}
    />
  );
}
