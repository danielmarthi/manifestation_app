import {
  getProfile,
  getIdentityStatements,
  getTodayPracticeLog,
} from "../../lib/data";
import { PracticeFlow } from "../../components/PracticeFlow";

export default async function PracticePage() {
  const [profile, identityStatements, todayLog] = await Promise.all([
    getProfile(),
    getIdentityStatements(),
    getTodayPracticeLog(),
  ]);
  if (!profile) return null;

  return (
    <PracticeFlow
      assumption={profile.assumption ?? "It is already done."}
      streak={profile.streak}
      identityStatements={identityStatements.map((s) => s.text)}
      stepsAlreadyDone={(todayLog?.steps_completed ?? {}) as Record<string, boolean>}
      gratitudeAlready={todayLog?.gratitude ?? ""}
      futureSelfBody={profile.future_self_body ?? []}
    />
  );
}
