import { randomUUID } from "crypto";
import { getProfile, getRecentEvidence } from "../../lib/data";
import { CoachConversation } from "../../components/CoachConversation";

export default async function CoachPage() {
  const [profile, recentEvidence] = await Promise.all([
    getProfile(),
    getRecentEvidence(5),
  ]);
  if (!profile) return null;

  // Start a fresh conversation each visit for now (we can resume later).
  const conversationId = randomUUID();

  return (
    <CoachConversation
      conversationId={conversationId}
      firstName={profile.first_name ?? "friend"}
      streak={profile.streak}
      assumption={profile.assumption ?? "It is already done."}
      recentEvidenceCount={recentEvidence.length}
    />
  );
}
