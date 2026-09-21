import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { IUser } from "../get-self-user/types";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("project-money-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { data: listUsers, error } = await getSupabaseAdmin().auth.admin.listUsers();

    if (error) throw error;

    if (!listUsers || !listUsers.users) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    const users: IUser[] = listUsers.users.map((user) => ({
      uid: user.id,
      email: user.email as string,
      displayName: (user.user_metadata?.display_name as string) ?? "",
      photoURL: (user.user_metadata?.avatar_url as string) ?? "",
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("List users error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export const runtime = "nodejs";
