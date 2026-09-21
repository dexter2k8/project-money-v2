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
            const latestDate = new Date(latestSaldos[0].enddate);
            const filterDate = new Date(latestDate);
            filterDate.setUTCFullYear(filterDate.getUTCFullYear() - Number(years));
            filterDate.setUTCMonth(filterDate.getUTCMonth() - 1);
            saldoQuery = saldoQuery.gte("enddate", filterDate.toISOString().split("T")[0]);
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
            const latestDate = new Date(latestSaldos[0].enddate);
            const filterDate = new Date(latestDate);
            filterDate.setUTCFullYear(filterDate.getUTCFullYear() - Number(years));
            filterDate.setUTCMonth(filterDate.getUTCMonth() - 1);
            saldoQuery = saldoQuery.gte("enddate", filterDate.toISOString().split("T")[0]);
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
