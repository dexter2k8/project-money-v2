import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { TPatchUserArgs } from "../types";

export async function PATCH(req: NextRequest) {
  const body: TPatchUserArgs = await req.json();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const uid = req.nextUrl.pathname.split("/").pop() ?? "";

    const updateData: {
      user_metadata?: Record<string, unknown>;
      password?: string;
      email?: string;
    } = {};

    if (body.displayName !== undefined || body.photoURL !== undefined) {
      updateData.user_metadata = {};
      if (body.displayName !== undefined) {
        updateData.user_metadata.display_name = body.displayName;
      }
      if (body.photoURL !== undefined) {
        updateData.user_metadata.avatar_url = body.photoURL;
      }
    }

    if (body.password) {
      updateData.password = body.password;
    }

    if (body.email) {
      updateData.email = body.email;
    }

    const { error } = await getSupabaseAdmin().auth.admin.updateUserById(uid, updateData);

    if (error) throw error;

    return NextResponse.json("User updated successfully", { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
