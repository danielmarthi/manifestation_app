import {
  getProfile,
  getJourneyState,
  getAllPracticeLogs,
  getEvidenceCountsByDate,
  getMilestoneSummaries,
  getAllEvidence,
} from "../../lib/data";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
  const [profile, journey, logs, evidenceCounts, milestones, allEvidence] =
    await Promise.all([
      getProfile(),
      getJourneyState(),
      getAllPracticeLogs(),
      getEvidenceCountsByDate(),
      getMilestoneSummaries(),
      getAllEvidence(),
    ]);
  if (!profile) return null;

  const completedDates = logs
    .filter((l) => l.completed_at !== null)
    .map((l) => l.practice_date);
  const partialDates = logs
    .filter((l) => l.completed_at === null && hasAnyStep(l.steps_completed))
    .map((l) => l.practice_date);

  return (
    <CalendarClient
      firstName={profile.first_name ?? undefined}
      startDate={journey.startDate}
      journeyDay={journey.journeyDay}
      practicedDays={journey.practicedDays}
      streak={journey.streak}
      totalEntries={allEvidence.length}
      completedDates={completedDates}
      partialDates={partialDates}
      evidenceCounts={evidenceCounts}
      milestoneSummaries={milestones.map((m) => ({
        day_marker: m.day_marker,
        content: m.content,
      }))}
    />
  );
}

function hasAnyStep(steps: Record<string, boolean>): boolean {
  return Object.values(steps ?? {}).some(Boolean);
}
