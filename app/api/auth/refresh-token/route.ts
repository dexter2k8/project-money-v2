import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/jwks";

export async function POST() {
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

    // For JWKS-based auth, we verify the existing token is still valid
    // and return its expiration. The client should re-authenticate if expired.
    return NextResponse.json({ exp: decoded.exp }, { status: 200 });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
  }
}
