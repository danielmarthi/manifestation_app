import { createClient } from "../../lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Sign out returns the user to the public landing page.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
