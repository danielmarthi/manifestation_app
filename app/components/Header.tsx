"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ProfileRow } from "../lib/supabase/types";
import { SOSModal } from "./SOSModal";

interface HeaderProps {
  profile: ProfileRow;
  journeyDay: number;
  practicedDays: number;
}

const PRIMARY = [
  { href: "/today", label: "Today" },
  { href: "/calendar", label: "Journey" },
  { href: "/coach", label: "Coach" },
  { href: "/learn", label: "Learn" },
];

const SECONDARY = [
  { href: "/phases", label: "Phases" },
  { href: "/identity", label: "Identity" },
];

export function Header({ profile, journeyDay, practicedDays }: HeaderProps) {
  const pathname = usePathname();
  const [sosOpen, setSosOpen] = useState(false);
  const initial = (profile.first_name ?? "?")[0]?.toUpperCase() ?? "?";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="h-14 border-b border-line bg-surface/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Logo */}
      <Link href="/today" className="flex items-center gap-2.5 group shrink-0">
        <span
          className="block w-6 h-6 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #e6c47a, #b35a3a 70%, #4a3f36 100%)",
            boxShadow: "0 0 12px rgba(212,168,73,0.35)",
          }}
        />
        <span className="font-display text-[17px] tracking-tight text-ink group-hover:text-ink-soft transition-colors hidden sm:block">
          The Abundance Shift
        </span>
      </Link>

      {/* Primary nav */}
      <nav className="hidden md:flex items-center gap-7 text-[13px]">
        {PRIMARY.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              "transition-colors " +
              (isActive(l.href)
                ? "text-ink font-medium"
                : "text-ink-soft hover:text-ink")
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Secondary links */}
        <nav className="hidden lg:flex items-center gap-4 text-[12px] text-ink-muted">
          {SECONDARY.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "transition-colors " +
                (isActive(l.href) ? "text-ink-soft" : "hover:text-ink-soft")
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* SOS */}
        <button
          onClick={() => setSosOpen(true)}
          title="Hard moment? Tap any time."
          className="flex items-center gap-1.5 text-[12px] text-sos hover:bg-sos/10 px-2.5 py-1.5 rounded-full transition-colors group"
        >
          <span className="relative flex shrink-0">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-sos opacity-60 group-hover:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sos" />
          </span>
          <span className="hidden sm:block">Hard moment?</span>
        </button>

        {/* Hybrid day chip */}
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Day {journeyDay}
          </span>
          <span className="text-[11px] text-ink-soft">
            {practicedDays} practiced
          </span>
        </div>

        {/* Avatar / sign out */}
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

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} profile={profile} />
    </header>
  );
}
