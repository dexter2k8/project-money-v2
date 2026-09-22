import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("project-money-token")?.value;
    const refreshToken = cookieStore.get("project-money-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create a fresh client per request to avoid session state conflicts
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    // Set the current session so Supabase knows who we are
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (setSessionError) {
      console.error("Set session error:", setSessionError);
      return NextResponse.json({ error: "Session refresh failed" }, { status: 401 });
    }

    // Refresh to get new tokens
    const { data, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !data.session) {
      console.error("Refresh session error:", refreshError);
      return NextResponse.json({ error: "Session refresh failed" }, { status: 401 });
    }

    const newAccessToken = data.session.access_token;
    const newRefreshToken = data.session.refresh_token;

    // Update cookies with new tokens
    cookieStore.set({
      name: "project-money-token",
      value: newAccessToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    if (newRefreshToken) {
      cookieStore.set({
        name: "project-money-refresh-token",
        value: newRefreshToken,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    // Return the new expiration
    return NextResponse.json({ exp: data.session.expires_at }, { status: 200 });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
  }
}
