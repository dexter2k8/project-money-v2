import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { parseDateLocal } from "@/app/utils/dates";
import type { TPatchBalanceArgs } from "../../types";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();

    const { id } = await params;
    const body: TPatchBalanceArgs = await req.json();
    const accountId = req.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const { data: account, error: accountError } = await getSupabaseAdmin()
      .from("contas")
      .select("id, user_id")
      .eq("id", accountId)
      .single<{ id: string; user_id: string }>();

    if (accountError || !account || account.user_id !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const parsedDate = parseDateLocal(body.enddate);
    const enddateStr = parsedDate.toISOString().split("T")[0];

    const { error } = await getSupabaseAdmin()
      .from("saldos")
      .update({
        balance: body.balance,
        enddate: enddateStr,
      })
      .eq("id", id)
      .eq("account_id", accountId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Update balance error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
