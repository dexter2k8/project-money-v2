import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";
import type { TSignInArgs } from "./types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, avatar }: TSignInArgs = body;

    const { data, error } = await getSupabaseAdmin().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (name || avatar) {
      await getSupabaseAdmin().auth.admin.updateUserById(data.user.id, {
        user_metadata: {
          ...data.user.user_metadata,
          ...(name && { display_name: name }),
          ...(avatar && { avatar_url: avatar }),
        },
      });
    }

    // Use the access token and refresh token from Supabase session
    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    const cookieStore = await cookies();
    cookieStore.set({
      name: "project-money-token",
      value: accessToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    if (refreshToken) {
      cookieStore.set({
        name: "project-money-refresh-token",
        value: refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    const user = {
      uid: data.user.id,
      email: data.user.email,
      displayName: name ?? data.user.user_metadata?.display_name ?? null,
      photoURL: avatar ?? data.user.user_metadata?.avatar_url ?? null,
    };

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json({ error: "Sign-in failed" }, { status: 401 });
  }
}
