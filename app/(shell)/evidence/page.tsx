import {
  getProfile,
  getAllEvidence,
  getWeeklyInsights,
  getPracticeDaysCount,
} from "../../lib/data";
import { EvidencePageClient } from "./EvidencePageClient";

export default async function EvidencePage() {
  const [profile, all, weeklyInsights, totalDays] = await Promise.all([
    getProfile(),
    getAllEvidence(),
    getWeeklyInsights(),
    getPracticeDaysCount(),
  ]);

  if (!profile) return null;

  return (
    <EvidencePageClient
      entries={all}
      weeklyInsights={weeklyInsights}
      totalDays={totalDays}
      firstName={profile.first_name ?? undefined}
    />
  );
}
