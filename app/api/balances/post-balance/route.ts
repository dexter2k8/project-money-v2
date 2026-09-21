import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { parseDateLocal } from "@/app/utils/dates";
import type { TPostSingleBalanceArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const body: TPostSingleBalanceArgs = await req.json();
    const { accountId, balance: rawBalance, enddate } = body;
    const balance = Math.abs(rawBalance) < 0.005 ? 0 : rawBalance;

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

    const parsedDate = parseDateLocal(enddate);
    const enddateStr = parsedDate.toISOString().split("T")[0];

    const { data, error } = await getSupabaseAdmin()
      .from("saldos")
      .insert({
        account_id: accountId,
        balance,
        enddate: enddateStr,
      })
      .select()
      .single<{ id: string }>();

    if (error) throw error;

    return NextResponse.json({ id: data.id, balance, enddate: enddateStr }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Create balance error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
