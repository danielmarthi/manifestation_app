import { redirect } from "next/navigation";
import { getProfile } from "../../lib/data";
import { OnboardingAreas } from "./OnboardingAreas";

export default async function AreasPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.about_text) redirect("/onboarding/you");
  if (profile.onboarding_completed_at) redirect("/today");

  return (
    <OnboardingAreas
      defaultSelected={(profile.selected_areas as string[] | null) ?? []}
    />
  );
}
