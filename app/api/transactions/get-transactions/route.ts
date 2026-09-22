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
    const month = request.nextUrl.searchParams.get("month");
    const year = request.nextUrl.searchParams.get("year");
    const years = request.nextUrl.searchParams.get("years");

    if (!acctid && !accountId) {
      return NextResponse.json({ error: "acctid or accountId is required" }, { status: 400 });
    }

    let startDateStr: string | null = null;
    let endDateStr: string | null = null;

    if (month && year) {
      const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59));
      startDateStr = startDate.toISOString().split("T")[0];
      endDateStr = endDate.toISOString().split("T")[0];
    }

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

    const data = await Promise.all(
      accountDocs.map(async (account) => {
        let extratosQuery = getSupabaseAdmin()
          .from("extratos")
          .select("*")
          .eq("account_id", account.id);

        if (years && !startDateStr) {
          const { data: latestExtratos } = await getSupabaseAdmin()
            .from("extratos")
            .select("dtposted")
            .eq("account_id", account.id)
            .order("dtposted", { ascending: false })
            .limit(1);

          if (latestExtratos && latestExtratos.length > 0) {
            const latestDateMatch = String(latestExtratos[0].dtposted).match(
              /^(\d{4})-(\d{2})-(\d{2})/,
            );
            if (latestDateMatch) {
              // Fetch transactions from `years` years before the latest one.
              // Clamp the day to handle Feb 29 in non-leap target years.
              const filterYear = Number(latestDateMatch[1]) - Number(years);
              const lastDay = new Date(
                Date.UTC(filterYear, Number(latestDateMatch[2]), 0),
              ).getUTCDate();
              const filterDay = Math.min(Number(latestDateMatch[3]), lastDay);
              startDateStr = `${String(filterYear).padStart(4, "0")}-${latestDateMatch[2]}-${String(filterDay).padStart(2, "0")}`;
            }
          }
        }

        if (startDateStr) {
          extratosQuery = extratosQuery.gte("dtposted", startDateStr);
        }
        if (endDateStr) {
          extratosQuery = extratosQuery.lte("dtposted", endDateStr);
        }

        const { data: extratos, error: extratosError } = await extratosQuery.order("dtposted", {
          ascending: true,
        });

        if (extratosError) throw extratosError;

        return {
          ...account,
          extratos: extratos ?? [],
        };
      }),
    );

    const count = data[0]?.extratos.length ?? 0;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get transactions error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
