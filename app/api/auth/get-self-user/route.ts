import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { verifyToken } from "@/app/utils/jwks";
import type { IUser } from "./types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { data: userData, error } = await getSupabaseAdmin().auth.admin.getUserById(decoded.sub);

    if (error || !userData?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userData.user;

    const responseUser: IUser = {
      uid: user.id,
      displayName: user.user_metadata?.display_name ?? null,
      email: user.email ?? null,
      photoURL: user.user_metadata?.avatar_url ?? null,
      role: user.app_metadata?.role ?? null,
      exp: decoded.exp,
    };

    return NextResponse.json(responseUser, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}
