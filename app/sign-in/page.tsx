import { Suspense } from "react";
import { SignInForm } from "../components/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 page-fade">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-3 mb-10">
          <span
            className="block w-7 h-7 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
              boxShadow: "0 0 12px rgba(212,168,73,0.4)",
            }}
          />
          <span className="font-display text-[19px] tracking-tight text-ink">
            The Abundance Shift
          </span>
        </div>

        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-3">
          Begin
        </div>
        <h1 className="font-display text-[38px] text-ink leading-[1.1] mb-3">
          Welcome back, or welcome in.
        </h1>
        <p className="text-[14px] text-ink-soft leading-relaxed mb-10">
          Enter your email — we'll send a one-time link. No password. The work
          we do here is private to you.
        </p>

        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>

        <p className="mt-8 text-[12px] text-ink-muted leading-relaxed">
          By signing in you accept that this is a personal practice tool. What
          you write stays in your account.
        </p>
      </div>
    </div>
  );
}
