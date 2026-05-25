import Link from "next/link";
import { createClient } from "./lib/supabase/server";

export const metadata = {
  title: "The Abundance Shift — Become the one who receives.",
  description:
    "A daily, identity-based manifestation practice. Diagnose the assumption blocking your desire, meet your future self, and live from her — five minutes a day.",
};

export default async function LandingPage() {
  // Auth-aware CTAs: signed-in visitors get a clean "Open the app" instead of "Sign in".
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = Boolean(user);

  return (
    <div className="min-h-screen bg-background text-ink">
      <LandingNav isAuthed={isAuthed} />
      <Hero isAuthed={isAuthed} />
      <ProblemSection />
      <ShiftSection />
      <HowItWorksSection />
      <PracticePeekSection />
      <FutureSelfSection />
      <WhoForSection />
      <ClosingPrinciple />
      <FinalCTA isAuthed={isAuthed} />
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function BrandOrb({ size = 28 }: { size?: number }) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
        boxShadow: `0 0 ${size * 0.6}px rgba(212,168,73,0.4)`,
      }}
    />
  );
}

function LandingNav({ isAuthed }: { isAuthed: boolean }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-line/60">
      <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandOrb size={26} />
          <span className="font-display text-[18px] tracking-tight text-ink group-hover:text-ink-soft transition-colors">
            The Abundance Shift
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] text-ink-soft">
          <a href="#how" className="hover:text-ink transition-colors">How it works</a>
          <a href="#practice" className="hover:text-ink transition-colors">The practice</a>
          <a href="#who" className="hover:text-ink transition-colors">Who it's for</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
            >
              Open the app →
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:inline text-[13px] text-ink-soft hover:text-ink transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-in"
                className="px-5 py-2 rounded-full bg-ink text-surface text-[13px] hover:bg-ink-soft transition-colors"
              >
                Begin
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Atmospheric glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[-180px] -translate-x-1/2 w-[820px] h-[820px] rounded-full opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,73,0.32) 0%, rgba(179,90,58,0.10) 38%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 text-center page-fade">
        <div className="flex justify-center mb-8">
          <div className="candle-glow">
            <BrandOrb size={56} />
          </div>
        </div>

        <div className="text-[11px] uppercase tracking-[0.22em] text-ochre mb-5">
          A daily practice for becoming
        </div>

        <h1 className="font-display text-[44px] sm:text-[64px] leading-[1.04] text-ink max-w-3xl mx-auto">
          Your future self is already real.
          <br />
          This is how you catch up.
        </h1>

        <p className="mt-7 max-w-xl mx-auto text-[16px] sm:text-[17px] leading-[1.65] text-ink-soft">
          The Abundance Shift is a quiet, identity-based manifestation practice.
          No vision boards. No bypass. No performance. Just the inner work that
          actually moves the needle — five minutes a day.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={isAuthed ? "/dashboard" : "/sign-in"}
            className="px-7 py-3.5 rounded-full bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors shadow-sm"
          >
            {isAuthed ? "Continue your practice →" : "Begin your shift — free"}
          </Link>
          {!isAuthed && (
            <Link
              href="/sign-in"
              className="px-6 py-3.5 rounded-full border border-line text-[14px] text-ink-soft hover:bg-surface-2 transition-colors"
            >
              I already have an account
            </Link>
          )}
        </div>

        <div className="mt-8 text-[12px] text-ink-muted">
          No credit card. No password. Just an email.
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function ProblemSection() {
  const triedAndFailed = [
    "Visualization that started to feel like make-believe",
    "Affirmations you didn't quite believe when you said them",
    "Vision boards that gather dust by February",
    "Scripting that quietly turned into wishing",
    "Gratitude lists that started to feel performative",
    "Books, podcasts, courses — and you're still waiting",
  ];

  return (
    <section className="border-t border-line/60 bg-surface/40">
      <div className="max-w-4xl mx-auto px-6 py-24 sm:py-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted mb-5">
          If you're here, you've probably tried…
        </div>
        <h2 className="font-display text-[34px] sm:text-[44px] leading-[1.08] text-ink max-w-2xl">
          You've done the surface work. So why does it still feel like waiting?
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5">
          {triedAndFailed.map((item) => (
            <div key={item} className="flex items-start gap-3 text-[15px] text-ink-soft">
              <span className="mt-2 h-px w-5 bg-line shrink-0" />
              <span className="line-through decoration-line/80 decoration-[1px]">
                {item}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-2xl text-[16px] sm:text-[17px] leading-[1.65] text-ink-soft border-l-2 border-terracotta pl-6">
          None of it is wrong. It just skips the part that actually matters —
          the part underneath the words.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function ShiftSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ochre mb-5">
          The shift
        </div>
        <h2 className="font-display text-[40px] sm:text-[56px] leading-[1.04] text-ink">
          From <span className="italic text-ink-muted">wanting</span>{" "}
          <span className="text-ink-muted">→</span>{" "}
          to <span className="text-terracotta">being.</span>
        </h2>

        <div className="mt-12 max-w-2xl mx-auto space-y-5 text-[16px] sm:text-[17px] leading-[1.75] text-ink-soft text-left">
          <p>
            Your reality is a mirror of your{" "}
            <span className="text-ink">assumption</span> about who you are. Not
            your wishes. Not your effort. Your assumption.
          </p>
          <p>
            When you live from the version of yourself your desire is already
            true for, the inner conflict that's been blocking it dissolves. The
            action becomes obvious. The receiving becomes possible.
          </p>
          <p className="font-display text-[20px] text-ink leading-[1.4] pt-4">
            That's the work. Everything else is decoration.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const pillars = [
    {
      n: "01",
      title: "Diagnose your actual block",
      body:
        "A 7-step onboarding conversation surfaces the specific assumption keeping your desire at arm's length. Not a generic limiting belief — yours, in your own words.",
    },
    {
      n: "02",
      title: "Meet your future self",
      body:
        "You get a vivid, embodied portrait of the version of you it's already true for. She becomes your reference point — present tense, never future.",
    },
    {
      n: "03",
      title: "A 5-minute daily practice",
      body:
        "One assumption. One identity statement. One piece of evidence. One gratitude. Built like a meditation, not a checklist. It compounds.",
    },
    {
      n: "04",
      title: "A coach who knows your story",
      body:
        "When the doubt comes — and it will — your AI coach knows your gap, your beliefs, your future self, and exactly what to say in the moment.",
    },
  ];

  return (
    <section id="how" className="border-t border-line/60 bg-surface/40">
      <div className="max-w-5xl mx-auto px-6 py-24 sm:py-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted mb-5">
          Inside The Abundance Shift
        </div>
        <h2 className="font-display text-[34px] sm:text-[44px] leading-[1.08] text-ink max-w-2xl">
          Four moves. One quiet practice.
        </h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((p) => (
            <div
              key={p.n}
              className="bg-surface border border-line rounded-2xl p-7 hover:border-line/80 transition-colors"
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-display text-[28px] text-terracotta leading-none">
                  {p.n}
                </span>
                <div className="h-px flex-1 bg-line/70" />
              </div>
              <h3 className="font-display text-[22px] text-ink leading-tight mb-3">
                {p.title}
              </h3>
              <p className="text-[14.5px] leading-[1.65] text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function PracticePeekSection() {
  const steps = [
    { label: "Breathe — three breaths, body soft", done: true },
    { label: "Be — read today's identity statement aloud", done: true },
    { label: "See — today's visualization (90s)", done: true },
    { label: "Thank — one gratitude in advance", done: false },
    { label: "Assume — read & feel the assumption", done: false },
  ];

  return (
    <section id="practice" className="relative">
      <div className="max-w-5xl mx-auto px-6 py-24 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-ochre mb-5">
              The daily ritual
            </div>
            <h2 className="font-display text-[34px] sm:text-[44px] leading-[1.08] text-ink mb-6">
              Five minutes. Same time. Every day.
            </h2>
            <div className="space-y-4 text-[16px] leading-[1.7] text-ink-soft">
              <p>
                Most practices fail because they're built for the inspired
                version of you, not the tired one. This isn't.
              </p>
              <p>
                You open the app. The page already knows where you are — your
                assumption, your streak, today's identity statement. You move
                through five breath-paced steps. You close the app.
              </p>
              <p className="text-ink">
                That's the whole thing. Done before your coffee.
              </p>
            </div>
          </div>

          {/* Mocked-up "today" card */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 60% 40%, rgba(212,168,73,0.18), transparent 70%)",
              }}
            />
            <div className="relative bg-surface border border-line rounded-2xl p-7 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
                My assumption — read it. Feel it. Live from it.
              </div>
              <p className="font-display text-[24px] text-ink leading-[1.2] mb-7">
                "It is already done. I receive easily."
              </p>

              <div className="border-t border-line/70 pt-5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
                  Today's ritual — day 14
                </div>
                <div className="space-y-1.5">
                  {steps.map((s) => (
                    <div
                      key={s.label}
                      className={
                        "flex items-center gap-3 px-3 py-2 rounded-lg " +
                        (s.done ? "text-ink-muted" : "text-ink")
                      }
                    >
                      <span
                        className={
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 " +
                          (s.done
                            ? "bg-terracotta border-terracotta"
                            : "border-line bg-background")
                        }
                      >
                        {s.done && (
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6.5l2.5 2.5 4.5-5"
                              stroke="#faf6ef"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span
                        className={
                          "text-[13px] " +
                          (s.done ? "line-through decoration-line/70" : "")
                        }
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-5 text-[12px] text-ink-soft">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-ink text-[15px]">3</span>
                    <span className="text-ink-muted">/ 5 steps today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-ink text-[15px]">14</span>
                    <span className="text-ink-muted">day streak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function FutureSelfSection() {
  return (
    <section className="border-t border-line/60 bg-surface/40">
      <div className="max-w-5xl mx-auto px-6 py-24 sm:py-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted mb-5 text-center">
          The two selves
        </div>
        <h2 className="font-display text-[34px] sm:text-[44px] leading-[1.08] text-ink text-center max-w-3xl mx-auto mb-16">
          The practice is the bridge between who you were and who you already are.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Old self */}
          <div className="bg-surface border border-line rounded-2xl p-7 old-self-treatment">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
              The one you've been
            </div>
            <h3 className="font-display text-[22px] text-ink-soft leading-tight mb-5">
              Always chasing. Always preparing. Almost ready.
            </h3>
            <ul className="space-y-2.5 text-[14px] text-ink-muted leading-relaxed">
              <li>She waits for a sign before she trusts.</li>
              <li>She earns her rest. She earns her joy.</li>
              <li>She watches the inbox, the bank balance, the door.</li>
              <li>She knows her desire by heart — and feels it just out of reach.</li>
            </ul>
          </div>

          {/* Future self */}
          <div
            className="relative rounded-2xl p-7 border"
            style={{
              borderColor: "var(--gold-soft)",
              background:
                "linear-gradient(135deg, rgba(230,196,122,0.10), rgba(179,90,58,0.06) 60%, transparent)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-ochre mb-3">
              The one you already are
            </div>
            <h3 className="font-display text-[22px] text-ink leading-tight mb-5">
              Unhurried. Expectant. Already the one for whom it lands.
            </h3>
            <ul className="space-y-2.5 text-[14px] text-ink-soft leading-relaxed">
              <li>She doesn't perform belief. She lives from it.</li>
              <li>She doesn't grip. She doesn't audition.</li>
              <li>She moves at the pace of someone who knows it's done.</li>
              <li>The desire isn't a destination. It's a footnote to who she is.</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-center text-[15px] text-ink-soft italic max-w-2xl mx-auto">
          The Abundance Shift doesn't ask you to fake her. It teaches you to
          recognize her — and then to live from her, one small assumption at a
          time.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function WhoForSection() {
  const forYou = [
    "You've done the surface-level work and it isn't landing",
    "You're suspicious of woo but open to depth",
    "You want a daily practice, not another book",
    "You're ready to stop performing and start becoming",
  ];
  const notForYou = [
    "You want a magic spell that requires nothing of you",
    "You'd rather feel good than get honest",
    "You're not willing to spend five quiet minutes on yourself",
    "You think the universe owes you, and you owe it nothing",
  ];

  return (
    <section id="who" className="border-t border-line/60">
      <div className="max-w-5xl mx-auto px-6 py-24 sm:py-28">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted mb-5">
          Honest fit
        </div>
        <h2 className="font-display text-[34px] sm:text-[44px] leading-[1.08] text-ink max-w-2xl mb-14">
          This isn't for everyone. That's by design.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-terracotta mb-5">
              This is for you if…
            </div>
            <ul className="space-y-4">
              {forYou.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[15px] text-ink-soft leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted mb-5">
              This isn't for you if…
            </div>
            <ul className="space-y-4">
              {notForYou.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[15px] text-ink-muted leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-line shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function ClosingPrinciple() {
  return (
    <section className="border-t border-line/60 bg-surface/40">
      <div className="max-w-3xl mx-auto px-6 py-24 sm:py-28 text-center">
        <div className="flex justify-center mb-8">
          <div className="breath-pulse">
            <BrandOrb size={36} />
          </div>
        </div>
        <p className="font-display text-[28px] sm:text-[36px] leading-[1.25] text-ink">
          Manifestation isn't a trick. It's a state.
        </p>
        <p className="font-display text-[28px] sm:text-[36px] leading-[1.25] text-ink-soft mt-3">
          The shift is becoming the one for whom it's already obvious.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function FinalCTA({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="border-t border-line/60 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,73,0.30) 0%, rgba(179,90,58,0.08) 40%, transparent 75%)",
          filter: "blur(8px)",
        }}
      />
      <div className="relative max-w-3xl mx-auto px-6 py-28 sm:py-36 text-center">
        <h2 className="font-display text-[40px] sm:text-[54px] leading-[1.05] text-ink">
          Your future self is patient.
          <br />
          She knows you'll catch up.
        </h2>
        <p className="mt-7 max-w-xl mx-auto text-[16px] sm:text-[17px] leading-[1.7] text-ink-soft">
          Make today the day you stop waiting on the universe and start living
          from the version of you it's already true for.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={isAuthed ? "/dashboard" : "/sign-in"}
            className="px-8 py-3.5 rounded-full bg-ink text-surface text-[14.5px] hover:bg-ink-soft transition-colors"
          >
            {isAuthed ? "Open my dashboard →" : "Begin your shift — free"}
          </Link>
          {!isAuthed && (
            <Link
              href="/sign-in"
              className="px-7 py-3.5 rounded-full border border-line text-[14.5px] text-ink-soft hover:bg-surface-2 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        <div className="mt-8 text-[12px] text-ink-muted">
          No password. No credit card. Just an email and five quiet minutes a day.
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-line/60 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-ink-muted">
        <div className="flex items-center gap-2.5">
          <BrandOrb size={18} />
          <span className="font-display text-[13px] text-ink-soft">
            The Abundance Shift
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>A personal practice tool. What you write stays in your account.</span>
        </div>
      </div>
    </footer>
  );
}
