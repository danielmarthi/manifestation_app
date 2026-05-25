import { redirect } from "next/navigation";
import { getProfile } from "../lib/data";

/**
 * /onboarding — smart router. Detects which stage the user is at
 * and redirects them to the correct step.
 */
export default async function OnboardingIndex() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Already finished onboarding
  if (profile.onboarding_completed_at) {
    redirect("/dashboard");
  }

  // Generated but not yet confirmed (reveal not clicked)
  if (profile.future_self_portrait) {
    redirect("/onboarding/reveal");
  }

  // Stage 3: areas saved, questions in progress or ready to start
  if (profile.selected_areas && (profile.selected_areas as string[]).length > 0) {
    redirect("/onboarding/questions");
  }

  // Stage 2: personal context saved, pick areas
  if (profile.about_text) {
    redirect("/onboarding/areas");
  }

  // Stage 1: fresh start
  redirect("/onboarding/you");
}
