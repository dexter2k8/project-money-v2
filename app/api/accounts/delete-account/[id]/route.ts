import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const id = req.nextUrl.pathname.split("/").pop() ?? "";

    const { data: existing, error: fetchError } = await getSupabaseAdmin()
      .from("contas")
      .select("user_id")
      .eq("id", id)
      .single<{ user_id: string }>();

    if (fetchError || !existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin()
      .from("contas")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json("Account deleted successfully", { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete account error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
