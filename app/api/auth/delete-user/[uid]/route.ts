import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const uid = req.nextUrl.pathname.split("/").pop() ?? "";

    const { error } = await getSupabaseAdmin().auth.admin.deleteUser(uid);

    if (error) throw error;

    return NextResponse.json("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Delete user error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
