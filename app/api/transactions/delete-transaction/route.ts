import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, transactionId } = body as {
      accountId: string;
      transactionId: string;
    };

    if (!accountId || !transactionId) {
      return NextResponse.json(
        { error: "accountId and transactionId are required" },
        { status: 400 },
      );
    }

    const { data: account, error: accountError } = await getSupabaseAdmin()
      .from("contas")
      .select("id, user_id")
      .eq("id", accountId)
      .single<{ id: string; user_id: string }>();

    if (accountError || !account || account.user_id !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { data: existing, error: fetchError } = await getSupabaseAdmin()
      .from("extratos")
      .select("id")
      .eq("id", transactionId)
      .eq("account_id", accountId)
      .single<{ id: string }>();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin()
      .from("extratos")
      .delete()
      .eq("id", transactionId)
      .eq("account_id", accountId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete transaction error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
