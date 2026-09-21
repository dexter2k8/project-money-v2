import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const accountId = request.nextUrl.searchParams.get("accountId");

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

    const { data: saldos, error: saldoError } = await getSupabaseAdmin()
      .from("saldos")
      .select("enddate")
      .eq("account_id", accountId)
      .order("enddate", { ascending: true });

    if (saldoError) throw saldoError;

    const yearsMap = new Map<number, Set<number>>();

    for (const saldo of saldos ?? []) {
      const enddate = new Date(saldo.enddate);
      const year = enddate.getUTCFullYear();
      const month = enddate.getUTCMonth();

      if (!yearsMap.has(year)) {
        yearsMap.set(year, new Set());
      }
      yearsMap.get(year)!.add(month);
    }

    const years = Array.from(yearsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, months]) => ({
        year,
        months: Array.from(months).sort((a, b) => a - b),
      }));

    return NextResponse.json({ data: years }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get years error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
