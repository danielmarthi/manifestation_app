import { createClient } from "../../lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/sign-in", request.url), { status: 303 });
}
