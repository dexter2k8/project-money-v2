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
    const { accountId, month, year } = body as {
      accountId: string;
      month: number;
      year: number;
    };

    if (!accountId || month == null || !year) {
      return NextResponse.json(
        { error: "accountId, month, and year are required" },
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

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const { data: extratosToDelete, error: fetchError } = await getSupabaseAdmin()
      .from("extratos")
      .select("id")
      .eq("account_id", accountId)
      .gte("dtposted", startDateStr)
      .lte("dtposted", endDateStr);

    if (fetchError) throw fetchError;

    if (extratosToDelete && extratosToDelete.length > 0) {
      const ids = extratosToDelete.map((e) => e.id);
      const { error } = await getSupabaseAdmin()
        .from("extratos")
        .delete()
        .in("id", ids);
      if (error) throw error;
    }

    const { data: saldosToDelete, error: saldosFetchError } = await getSupabaseAdmin()
      .from("saldos")
      .select("id")
      .eq("account_id", accountId)
      .gte("enddate", startDateStr)
      .lte("enddate", endDateStr);

    if (saldosFetchError) throw saldosFetchError;

    if (saldosToDelete && saldosToDelete.length > 0) {
      const ids = saldosToDelete.map((s) => s.id);
      const { error } = await getSupabaseAdmin()
        .from("saldos")
        .delete()
        .in("id", ids);
      if (error) throw error;
    }

    return NextResponse.json(
      { success: true, deleted: extratosToDelete?.length ?? 0 },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete transactions error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
