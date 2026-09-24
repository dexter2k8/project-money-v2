import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { parseDateLocal } from "@/app/utils/dates";
import type { NextRequest } from "next/server";

dayjs.extend(utc);
dayjs.extend(timezone);

export const runtime = "nodejs";

const BRT_TZ = "America/Sao_Paulo";

/**
 * Extracts "YYYY-MM" month key from a YYYY-MM-DD date string.
 * Uses direct string parsing to avoid timezone issues with `new Date()`.
 */
function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/**
 * Returns the last day of a given month as YYYY-MM-DD.
 * Month is 1-indexed (1=Jan, 12=Dec).
 */
function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = dayjs.tz(`${year}-${String(month).padStart(2, "0")}-01`, BRT_TZ).endOf("month");
  return lastDay.startOf("day").format("YYYY-MM-DD");
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, startDate } = body as { accountId: string; startDate?: string };

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

    // Normalize startDate to YYYY-MM-DD (the format stored in extratos.dtposted).
    // The client may send a date-only string (form) or an ISO string with
    // timezone offset (OFX import), so parse it with the same helper used when
    // storing transactions. The recalculation then snaps to the FIRST day of
    // that month: previousBalance is seeded with the saldo before the month, so
    // every transaction of the month must be included — cutting at the exact
    // day would drop days 1..D-1 from the monthly total and cascade the error
    // to all following months.
    let startFilter: string | null = null;
    if (startDate) {
      const parsedStart = parseDateLocal(startDate);
      startFilter = !Number.isNaN(parsedStart.getTime())
        ? `${parsedStart.toISOString().substring(0, 7)}-01`
        : null;
    }

    // PostgREST caps a response at 1000 rows (db-max-rows) in unspecified
    // order: the single unpaginated select used here silently dropped the
    // newest extratos once the account history crowded the cap, so month
    // balances were computed from an incomplete set. Page through with a
    // stable order, and only fetch rows from startFilter on — earlier
    // transactions never enter the totals (the seed comes from the saldo
    // before the month).
    const BATCH_SIZE = 1000;
    const allTransactions: { dtposted: string; trnamt: number }[] = [];
    for (let from = 0; ; from += BATCH_SIZE) {
      let query = getSupabaseAdmin()
        .from("extratos")
        .select("dtposted, trnamt")
        .eq("account_id", accountId);
      if (startFilter) {
        query = query.gte("dtposted", startFilter);
      }
      const { data, error } = await query
        .order("id", { ascending: true })
        .range(from, from + BATCH_SIZE - 1);

      if (error) throw error;

      for (const txn of data ?? []) {
        allTransactions.push({
          dtposted: String(txn.dtposted),
          trnamt: (txn.trnamt as number) ?? 0,
        });
      }

      if (!data || data.length < BATCH_SIZE) break;
    }

    allTransactions.sort((a, b) => a.dtposted.localeCompare(b.dtposted));

    const filteredTransactions = startFilter
      ? allTransactions.filter((txn) => txn.dtposted >= startFilter)
      : allTransactions;

    let previousBalance = 0;

    const { data: existingSaldos, error: saldosError } = await getSupabaseAdmin()
      .from("saldos")
      .select("id, enddate, balance")
      .eq("account_id", accountId)
      .order("enddate", { ascending: true });

    if (saldosError) throw saldosError;

    if (startFilter) {
      const previousSaldos = (existingSaldos ?? []).filter((s) => {
        return String(s.enddate) < startFilter;
      });
      if (previousSaldos.length > 0) {
        const lastSaldo = previousSaldos[previousSaldos.length - 1];
        previousBalance = (lastSaldo.balance as number) ?? 0;
      }
    }

    const transactionsByMonth = new Map<string, { dtposted: string; trnamt: number }[]>();
    for (const txn of filteredTransactions) {
      const monthKey = getMonthKey(txn.dtposted);
      if (!transactionsByMonth.has(monthKey)) {
        transactionsByMonth.set(monthKey, []);
      }
      transactionsByMonth.get(monthKey)!.push(txn);
    }

    const existingSaldoMap = new Map<string, string>();
    for (const saldo of existingSaldos ?? []) {
      const key = getMonthKey(String(saldo.enddate));
      existingSaldoMap.set(key, saldo.id);
    }

    const sortedMonths = Array.from(transactionsByMonth.keys()).sort();

    const inserts: { id?: string; account_id: string; balance: number; enddate: string }[] = [];
    const updates: { id: string; balance: number; enddate: string }[] = [];

    for (const monthKey of sortedMonths) {
      const txns = transactionsByMonth.get(monthKey)!;
      const monthTotal = txns.reduce((sum, txn) => sum + txn.trnamt, 0);
      const rawBalance = previousBalance + monthTotal;
      const finalBalance = Math.abs(rawBalance) < 0.005 ? 0 : rawBalance;

      const [yearStr, monthStr] = monthKey.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const enddate = getLastDayOfMonth(year, month);

      const existingSaldoId = existingSaldoMap.get(monthKey);
      if (existingSaldoId) {
        updates.push({ id: existingSaldoId, balance: finalBalance, enddate });
      } else {
        inserts.push({ account_id: accountId, balance: finalBalance, enddate });
      }

      previousBalance = finalBalance;
    }

    if (inserts.length > 0) {
      const { error } = await getSupabaseAdmin().from("saldos").insert(inserts);
      if (error) throw error;
    }

    for (const update of updates) {
      const { error } = await getSupabaseAdmin()
        .from("saldos")
        .update({ balance: update.balance, enddate: update.enddate })
        .eq("id", update.id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Post balances error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
