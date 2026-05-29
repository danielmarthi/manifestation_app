"use client";

import { usePathname } from "next/navigation";
import { FutureSelfSidebar } from "./FutureSelfSidebar";
import type { ProfileRow } from "../lib/supabase/types";

// The Future Self sidebar is a quick reference on Today. The Identity page is
// the full blueprint, so we don't duplicate the panel there.
const SHOW_ON = ["/today"];

export function ConditionalSidebar({ profile }: { profile: ProfileRow }) {
  const pathname = usePathname();
  const show = SHOW_ON.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!show) return null;
  return <FutureSelfSidebar profile={profile} />;
}
