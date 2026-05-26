import Link from "next/link";
import type { ProfileRow } from "../lib/supabase/types";

export function Header({ profile }: { profile: ProfileRow }) {
  const initial = (profile.first_name ?? "?")[0]?.toUpperCase() ?? "?";
  return (
    <header className="h-14 border-b border-line bg-surface/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <span
          className="block w-6 h-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
            boxShadow: "0 0 12px rgba(212,168,73,0.35)",
          }}
        />
        <span className="font-display text-[17px] tracking-tight text-ink group-hover:text-ink-soft transition-colors">
          The Abundance Shift
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-7 text-[13px] text-ink-soft">
        <Link href="/dashboard" className="hover:text-ink transition-colors">Today</Link>
        <Link href="/coach" className="hover:text-ink transition-colors">Coach</Link>
        <Link href="/evidence" className="hover:text-ink transition-colors">Evidence</Link>
        <Link href="/learn" className="hover:text-ink transition-colors">Learn</Link>
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted leading-tight">
            Day {profile.streak}
          </span>
          <span className="text-[11px] text-ink-soft leading-tight">Phase {profile.current_phase} of 4</span>
        </div>
        <form action="/auth/signout" method="post" className="flex">
          <button
            type="submit"
            title="Sign out"
            className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center font-display text-[14px] text-ink-soft hover:bg-line transition-colors"
          >
            {initial}
          </button>
        </form>
      </div>
    </header>
  );
}
