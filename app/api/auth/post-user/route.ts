import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";
import type { TPostUserArgs } from "./types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, photoURL }: TPostUserArgs = body;

    const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        ...(displayName && { display_name: displayName }),
        ...(photoURL && { avatar_url: photoURL }),
      },
    });

    if (error) throw error;

    await getSupabaseAdmin().auth.admin.updateUserById(data.user.id, {
      app_metadata: { role: "user" },
    });

    return NextResponse.json(
      {
        uid: data.user.id,
        email: data.user.email,
        displayName: displayName ?? null,
        photoURL: photoURL ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
