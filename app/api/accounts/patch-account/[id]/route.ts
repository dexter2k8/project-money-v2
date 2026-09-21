import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";
import type { TPatchAccountArgs } from "../../types";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const id = req.nextUrl.pathname.split("/").pop() ?? "";
    const body: TPatchAccountArgs = await req.json();

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
      .update({
        acctid: body.acctid,
        accttype: body.accttype,
        bankid: body.bankid,
        branchid: body.branchid,
        description: body.description,
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json("Account updated successfully", { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Update account error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
