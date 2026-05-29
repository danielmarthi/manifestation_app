import {
  getProfile,
  getIdentityStatements,
  getTodayPracticeLog,
  getJourneyState,
} from "../../lib/data";
import { PracticeFlow } from "../../components/PracticeFlow";

export default async function PracticePage() {
  const [profile, identityStatements, todayLog, journey] = await Promise.all([
    getProfile(),
    getIdentityStatements(),
    getTodayPracticeLog(),
    getJourneyState(),
  ]);
  if (!profile) return null;

  return (
    <PracticeFlow
      assumption={profile.assumption ?? "It is already done."}
      journeyDay={journey.journeyDay}
      practicedDays={journey.practicedDays}
      streak={journey.streak}
      identityStatements={identityStatements.map((s) => s.text)}
      stepsAlreadyDone={(todayLog?.steps_completed ?? {}) as Record<string, boolean>}
      gratitudeAlready={todayLog?.gratitude ?? ""}
      dailyNoteAlready={todayLog?.daily_note ?? ""}
      moodAlready={todayLog?.mood ?? ""}
      futureSelfBody={profile.future_self_body ?? []}
    />
  );
}
