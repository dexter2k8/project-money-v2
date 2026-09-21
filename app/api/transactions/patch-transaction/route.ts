import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { parseDateLocal } from "@/app/utils/dates";
import type { NextRequest } from "next/server";
import type { Database } from "@/app/services/supabase-types";

export const runtime = "nodejs";

type TTransactionUpdate = {
  dtposted?: string;
  trnamt?: number;
  memo?: string;
  chknum?: string;
  trntype?: string;
};

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, transactionId, data } = body as {
      accountId: string;
      transactionId: string;
      data: TTransactionUpdate;
    };

    if (!accountId || !transactionId) {
      return NextResponse.json(
        { error: "accountId and transactionId are required" },
        { status: 400 },
      );
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
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

    const updateData: Database["public"]["Tables"]["extratos"]["Update"] = {};
    if (data.dtposted !== undefined) {
      updateData.dtposted = parseDateLocal(data.dtposted).toISOString().split("T")[0];
    }
    if (data.trnamt !== undefined) updateData.trnamt = data.trnamt;
    if (data.memo !== undefined) updateData.memo = data.memo;
    if (data.chknum !== undefined) updateData.chknum = data.chknum;
    if (data.trntype !== undefined) updateData.trntype = data.trntype;

    const { error } = await getSupabaseAdmin()
      .from("extratos")
      .update(updateData)
      .eq("id", transactionId)
      .eq("account_id", accountId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Patch transaction error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
