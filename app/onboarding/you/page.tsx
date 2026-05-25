import { redirect } from "next/navigation";
import { getProfile } from "../../lib/data";
import { OnboardingYou } from "./OnboardingYou";

export default async function YouPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  if (profile.onboarding_completed_at) redirect("/dashboard");

  return (
    <OnboardingYou
      defaultValues={{
        first_name: profile.first_name ?? "",
        age: profile.age ?? undefined,
        occupation: profile.occupation ?? "",
        relationship_status: profile.relationship_status ?? "",
        about_text: profile.about_text ?? "",
        coach_style: (profile.coach_style as "mentor" | "strategist" | "guide") ?? "mentor",
      }}
    />
  );
}
