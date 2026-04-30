import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Exchange code for session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(sessionData.session.access_token);

    if (userError || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // If OAuth user just created an account, they might not have a profile row
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        email: user.email,
      });
    } else if (profile.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Default redirect for normal users
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
