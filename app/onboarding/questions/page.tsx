import { redirect } from "next/navigation";
import { getProfile } from "../../lib/data";
import { OnboardingQuestions } from "./OnboardingQuestions";

export default async function QuestionsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.about_text) redirect("/onboarding/you");
  if (!profile.selected_areas || (profile.selected_areas as string[]).length === 0) {
    redirect("/onboarding/areas");
  }
  if (profile.onboarding_completed_at) redirect("/dashboard");

  const selectedAreas = profile.selected_areas as string[];
  const savedAnswers = (profile.onboarding_answers as Record<string, unknown>[] | null) ?? [];

  return (
    <OnboardingQuestions
      selectedAreas={selectedAreas}
      savedAnswers={savedAnswers}
    />
  );
}
