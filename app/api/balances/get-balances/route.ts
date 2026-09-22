import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const acctid = request.nextUrl.searchParams.get("acctid");
    const accountId = request.nextUrl.searchParams.get("accountId");
    const flatten = request.nextUrl.searchParams.get("flatten") === "true";
    const fields = request.nextUrl.searchParams.get("fields");
    const years = request.nextUrl.searchParams.get("years");
    const year = request.nextUrl.searchParams.get("year");

    let accountQuery = getSupabaseAdmin().from("contas").select("*").eq("user_id", userId);

    if (accountId) {
      accountQuery = accountQuery.eq("id", accountId);
    } else if (acctid) {
      accountQuery = accountQuery.eq("acctid", acctid);
    }

    const { data: accountDocs, error: accountError } = await accountQuery;

    if (accountError) throw accountError;

    if (!accountDocs || accountDocs.length === 0) {
      return NextResponse.json({ data: [], count: 0 }, { status: 200 });
    }

    if (fields === "metadata") {
      return NextResponse.json({ data: accountDocs, count: accountDocs.length }, { status: 200 });
    }

    if (flatten) {
      const allBalances: {
        id: string;
        acctid: string;
        description: string;
        balance: number;
        enddate: string;
        accountId: string;
      }[] = [];

      for (const account of accountDocs) {
        let saldoQuery = getSupabaseAdmin()
          .from("saldos")
          .select("*")
          .eq("account_id", account.id)
          .order("enddate", { ascending: true });

        if (years) {
          const { data: latestSaldos } = await getSupabaseAdmin()
            .from("saldos")
            .select("enddate")
            .eq("account_id", account.id)
            .order("enddate", { ascending: false })
            .limit(1);

          if (latestSaldos && latestSaldos.length > 0) {
            const latestDateMatch = String(latestSaldos[0].enddate).match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (latestDateMatch) {
              // Start `years` years (plus a one-month buffer) before the latest saldo.
              const monthsBack = Number(years) * 12 + 1;
              const absoluteMonth =
                Number(latestDateMatch[1]) * 12 + Number(latestDateMatch[2]) - 1 - monthsBack;
              const filterYear = Math.floor(absoluteMonth / 12);
              const filterMonth = (((absoluteMonth % 12) + 12) % 12) + 1;
              const lastDay = new Date(Date.UTC(filterYear, filterMonth, 0)).getUTCDate();
              const filterDay = Math.min(Number(latestDateMatch[3]), lastDay);
              const filterDateStr = `${String(filterYear).padStart(4, "0")}-${String(filterMonth).padStart(2, "0")}-${String(filterDay).padStart(2, "0")}`;
              saldoQuery = saldoQuery.gte("enddate", filterDateStr);
            }
          }
        }

        if (year) {
          const startOfPrevYear = `${Number(year) - 1}-01-01`;
          const endOfSelectedYear = `${Number(year)}-12-31`;
          saldoQuery = saldoQuery.gte("enddate", startOfPrevYear).lte("enddate", endOfSelectedYear);
        }

        const { data: saldos, error: saldoError } = await saldoQuery;

        if (saldoError) throw saldoError;

        for (const saldo of saldos ?? []) {
          allBalances.push({
            id: saldo.id,
            acctid: account.acctid,
            description: account.description ?? "",
            balance: saldo.balance ?? 0,
            enddate: saldo.enddate,
            accountId: account.id,
          });
        }
      }

      return NextResponse.json({ data: allBalances, count: allBalances.length }, { status: 200 });
    }

    const data = await Promise.all(
      accountDocs.map(async (account) => {
        let saldoQuery = getSupabaseAdmin()
          .from("saldos")
          .select("*")
          .eq("account_id", account.id)
          .order("enddate", { ascending: true });

        if (years) {
          const { data: latestSaldos } = await getSupabaseAdmin()
            .from("saldos")
            .select("enddate")
            .eq("account_id", account.id)
            .order("enddate", { ascending: false })
            .limit(1);

          if (latestSaldos && latestSaldos.length > 0) {
            const latestDateMatch = String(latestSaldos[0].enddate).match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (latestDateMatch) {
              // Start `years` years (plus a one-month buffer) before the latest saldo.
              const monthsBack = Number(years) * 12 + 1;
              const absoluteMonth =
                Number(latestDateMatch[1]) * 12 + Number(latestDateMatch[2]) - 1 - monthsBack;
              const filterYear = Math.floor(absoluteMonth / 12);
              const filterMonth = (((absoluteMonth % 12) + 12) % 12) + 1;
              const lastDay = new Date(Date.UTC(filterYear, filterMonth, 0)).getUTCDate();
              const filterDay = Math.min(Number(latestDateMatch[3]), lastDay);
              const filterDateStr = `${String(filterYear).padStart(4, "0")}-${String(filterMonth).padStart(2, "0")}-${String(filterDay).padStart(2, "0")}`;
              saldoQuery = saldoQuery.gte("enddate", filterDateStr);
            }
          }
        }

        if (year) {
          const startOfPrevYear = `${Number(year) - 1}-01-01`;
          const endOfSelectedYear = `${Number(year)}-12-31`;
          saldoQuery = saldoQuery.gte("enddate", startOfPrevYear).lte("enddate", endOfSelectedYear);
        }

        const { data: saldos, error: saldoError } = await saldoQuery;

        if (saldoError) throw saldoError;

        return {
          ...account,
          saldos: saldos ?? [],
        };
      }),
    );

    const count = data[0]?.saldos.length ?? 0;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get balances error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
