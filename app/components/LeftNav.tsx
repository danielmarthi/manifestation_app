"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sun, Compass, Book, Heart, Spark, Chat, Journal, Path, Flame } from "./Icons";
import { SOSModal } from "./SOSModal";
import type { ProfileRow } from "../lib/supabase/types";

const links = [
  { href: "/", label: "Dashboard", icon: Sun },
  { href: "/phases", label: "My Phases", icon: Path },
  { href: "/practice", label: "Daily Practice", icon: Spark },
  { href: "/evidence", label: "Evidence Journal", icon: Journal },
  { href: "/identity", label: "My Identity", icon: Heart },
  { href: "/coach", label: "AI Coach", icon: Chat },
  { href: "/learn", label: "Learn", icon: Book },
];

export function LeftNav({ profile }: { profile: ProfileRow }) {
  const pathname = usePathname();
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex w-[220px] shrink-0 border-r border-line bg-surface/60 flex-col">
        <div className="sticky top-14 flex flex-col flex-1 py-6 px-3 h-[calc(100vh-3.5rem)]">
          <nav className="flex-1 space-y-0.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    "flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] transition-colors " +
                    (active
                      ? "bg-surface-2 text-ink"
                      : "text-ink-soft hover:bg-surface-2/70 hover:text-ink")
                  }
                >
                  <Icon
                    className={
                      "shrink-0 " + (active ? "text-terracotta" : "text-ink-muted")
                    }
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-4 border-t border-line/60">
            <button
              onClick={() => setSosOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] text-sos hover:bg-sos/10 transition-colors group"
            >
              <span className="relative flex shrink-0">
                <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-sos opacity-60 group-hover:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sos" />
              </span>
              <span>Hard moment?</span>
              <Flame className="ml-auto text-sos/70" />
            </button>
            <div className="px-3 mt-1 text-[10.5px] text-ink-muted leading-snug">
              Tap any time. Available from day one.
            </div>
          </div>
        </div>
      </aside>

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} profile={profile} />
    </>
  );
}
