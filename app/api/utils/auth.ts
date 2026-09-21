import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { verifyToken } from "@/app/utils/jwks";

export class AuthError extends Error {
  response: NextResponse;
  constructor(message: string, response: NextResponse) {
    super(message);
    this.name = "AuthError";
    this.response = response;
  }
}

export async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("project-money-token")?.value;

  if (!token) {
    throw new AuthError(
      "Not authenticated",
      NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    );
  }

  try {
    const decoded = await verifyToken(token);
    const uid = decoded.sub;

    if (!uid) {
      throw new Error("Invalid token: no sub claim");
    }

    const { data: userData, error } = await getSupabaseAdmin().auth.admin.getUserById(uid);

    if (error || !userData?.user) {
      throw new Error("User not found");
    }

    return uid;
  } catch {
    throw new AuthError(
      "Invalid or expired token",
      NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    );
  }
}
