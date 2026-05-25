import { redirect } from "next/navigation";
import { getProfile } from "../../lib/data";
import { RevealClient } from "./RevealClient";

export default async function RevealPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  if (profile.onboarding_completed_at) redirect("/dashboard");
  if (!profile.future_self_portrait) redirect("/onboarding/generating");

  return (
    <RevealClient
      firstName={profile.first_name ?? "Friend"}
      futureSelfName={profile.future_self_name ?? `${profile.first_name ?? "Friend"}, Future`}
      futureSelfPortrait={profile.future_self_portrait}
      futureSelfTags={profile.future_self_tags ?? []}
      releasing={profile.releasing ?? []}
      oldSelfName={profile.old_self_name ?? `${profile.first_name ?? "Friend"}, Before`}
      oldSelfPortrait={profile.old_self_portrait ?? ""}
      oldSelfTags={profile.old_self_tags ?? []}
      gapStatement={profile.gap_statement ?? ""}
    />
  );
}
