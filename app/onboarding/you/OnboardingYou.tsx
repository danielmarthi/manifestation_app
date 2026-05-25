"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePersonalContext } from "../../actions/onboarding";

interface DefaultValues {
  first_name: string;
  age?: number;
  occupation?: string;
  relationship_status?: string;
  about_text?: string;
  coach_style: "mentor" | "strategist" | "guide";
}

interface Props {
  defaultValues: DefaultValues;
}

const COACH_STYLES = [
  {
    id: "mentor" as const,
    name: "The Mentor",
    description: "Warm and direct. Believes in you more than you believe in yourself right now. Pushes gently when you're avoiding something, holds you firmly when it gets hard.",
    example: "\"I hear that. And I also notice you've said 'I don't know' three times in two minutes — which usually means you do know, and it scares you a little. What's the thing you're not saying?\"",
  },
  {
    id: "strategist" as const,
    name: "The Strategist",
    description: "Clear and grounded. Less soft, more direct. Names what's actually happening without dressing it up. You want someone who tells you the truth, not someone who makes you feel better.",
    example: "\"Stuck is just another word for 'I haven't decided yet.' You're not blocked — you're postponing. What decision are you sitting on that you already know the answer to?\"",
  },
  {
    id: "guide" as const,
    name: "The Guide",
    description: "Deeper and more reflective. Speaks in a way that lands emotionally. Connects your experience to something larger — the pattern, the meaning, the shift that's already underway.",
    example: "\"Feeling stuck often means you're right at the edge of the old identity — the place where it naturally resists what comes next. That resistance isn't failure. It's the last defence of the person you're leaving behind.\"",
  },
] as const;

const RELATIONSHIP_OPTIONS = [
  "Single",
  "In a relationship",
  "Married",
  "It's complicated",
  "Prefer not to say",
];

export function OnboardingYou({ defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(defaultValues.first_name);
  const [age, setAge] = useState(defaultValues.age?.toString() ?? "");
  const [occupation, setOccupation] = useState(defaultValues.occupation ?? "");
  const [relationshipStatus, setRelationshipStatus] = useState(defaultValues.relationship_status ?? "");
  const [aboutText, setAboutText] = useState(defaultValues.about_text ?? "");
  const [coachStyle, setCoachStyle] = useState<"mentor" | "strategist" | "guide">(
    defaultValues.coach_style ?? "mentor"
  );

  const canSubmit = firstName.trim().length > 0 && aboutText.trim().length > 20;

  function handleSubmit() {
    if (!canSubmit || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        await savePersonalContext({
          first_name: firstName.trim(),
          age: age ? parseInt(age, 10) : null,
          occupation: occupation.trim() || null,
          relationship_status: relationshipStatus || null,
          about_text: aboutText.trim(),
          coach_style: coachStyle,
        });
        router.push("/onboarding/areas");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-fade">
      {/* Progress */}
      <div className="px-8 pt-8 pb-0 max-w-2xl mx-auto w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">
          Step 1 of 4
        </div>
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={
                "h-1 rounded-full flex-1 " +
                (n === 1 ? "bg-terracotta" : "bg-line")
              }
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 pb-12 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-[38px] sm:text-[46px] text-ink leading-[1.05] mb-3">
          Before we build anything, let's start with who you are right now.
        </h1>
        <p className="text-[15px] text-ink-muted mb-10">
          Not who you want to be. Who you actually are today.
        </p>

        <div className="space-y-7">
          {/* First name */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.16em] text-ink-muted mb-2">
              What should I call you?
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              autoFocus
              className="w-full px-4 py-3.5 bg-surface border border-line rounded-xl text-[16px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>

          {/* Secondary fields row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-muted mb-2">
                How old are you? <span className="normal-case tracking-normal text-ink-muted/60">(optional)</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                min={16}
                max={99}
                className="w-full px-4 py-3 bg-surface border border-line rounded-xl text-[15px] text-ink focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-muted mb-2">
                Relationship status <span className="normal-case tracking-normal text-ink-muted/60">(optional)</span>
              </label>
              <select
                value={relationshipStatus}
                onChange={(e) => setRelationshipStatus(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-line rounded-xl text-[15px] text-ink focus:outline-none focus:border-terracotta transition-colors appearance-none"
              >
                <option value="">—</option>
                {RELATIONSHIP_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.16em] text-ink-muted mb-2">
              What do you do in the world? <span className="normal-case tracking-normal text-ink-muted/60">(optional)</span>
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Designer, founder, teacher, parent..."
              className="w-full px-4 py-3.5 bg-surface border border-line rounded-xl text-[15px] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>

          {/* About text */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.16em] text-ink-muted mb-1">
              In a few sentences — who are you right now?
            </label>
            <p className="text-[12px] text-ink-muted mb-2">
              Your life, your situation, what's actually true today. No performance. No best version. Just honest.
            </p>
            <textarea
              rows={6}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="I'm a 34-year-old designer living in Lisbon. Freelancing for 3 years, recently out of a long relationship, trying to figure out what I actually want from my life and work..."
              className="w-full px-4 py-4 bg-surface border border-line rounded-xl text-[15.5px] text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-terracotta transition-colors resize-none leading-[1.6]"
            />
          </div>

          {/* Coach style */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.16em] text-ink-muted mb-1">
              How do you want your coach to talk to you?
            </label>
            <p className="text-[12px] text-ink-muted mb-4">
              This shapes every response you get. Pick the style that will actually land for you.
            </p>
            <div className="space-y-3">
              {COACH_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCoachStyle(style.id)}
                  className={
                    "w-full text-left p-5 rounded-xl border transition-all " +
                    (coachStyle === style.id
                      ? "border-terracotta bg-surface-2/80"
                      : "border-line bg-surface hover:border-line hover:bg-surface-2/40")
                  }
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 " +
                        (coachStyle === style.id
                          ? "border-terracotta"
                          : "border-line")
                      }
                    >
                      {coachStyle === style.id && (
                        <span className="w-2 h-2 rounded-full bg-terracotta" />
                      )}
                    </span>
                    <span className="font-display text-[17px] text-ink">{style.name}</span>
                  </div>
                  <p className="text-[13px] text-ink-soft mb-3 ml-7">{style.description}</p>
                  <p className="text-[12.5px] text-ink-muted italic ml-7 leading-[1.5]">
                    On "I'm feeling stuck":<br />
                    {style.example}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-sos/10 border border-sos/30 rounded-lg text-[13px] text-sos">
            {error}
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="px-8 py-3 rounded-full bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors disabled:opacity-30"
          >
            {isPending ? "Saving..." : "This is me →"}
          </button>
        </div>
      </div>
    </div>
  );
}
