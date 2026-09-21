import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import { parseDateLocal } from "@/app/utils/dates";
import { createTransactionKey } from "@/app/utils/duplicateCheck";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type TTransactionInput = {
  trntype: string;
  dtposted: string;
  trnamt: number;
  memo: string;
  chknum: string;
};

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, transactions } = body as {
      accountId: string;
      transactions: TTransactionInput[];
    };

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "transactions array is required" }, { status: 400 });
    }

    const { data: account, error: accountError } = await getSupabaseAdmin()
      .from("contas")
      .select("id, user_id")
      .eq("id", accountId)
      .single<{ id: string; user_id: string }>();

    if (accountError || !account || account.user_id !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { data: existingExtratos, error: fetchError } = await getSupabaseAdmin()
      .from("extratos")
      .select("trntype, dtposted, trnamt, memo, chknum")
      .eq("account_id", accountId);

    if (fetchError) throw fetchError;

    const existingKeys = new Set(
      (existingExtratos ?? []).map((doc) =>
        createTransactionKey({
          trntype: doc.trntype ?? "",
          dtposted: doc.dtposted ?? "",
          trnamt: doc.trnamt ?? 0,
          memo: doc.memo ?? "",
          chknum: doc.chknum ?? "",
        })
      ),
    );

    const uniqueTransactions = transactions.filter(
      (txn) => !existingKeys.has(createTransactionKey(txn)),
    );

    if (uniqueTransactions.length === 0) {
      return NextResponse.json(
        { data: [], count: 0, skipped: transactions.length },
        { status: 200 },
      );
    }

    const insertData = uniqueTransactions.map((txn) => ({
      account_id: accountId,
      trntype: txn.trntype,
      dtposted: parseDateLocal(txn.dtposted).toISOString().split("T")[0],
      trnamt: txn.trnamt,
      memo: txn.memo,
      chknum: txn.chknum,
    }));

    const { data: insertedData, error: insertError } = await getSupabaseAdmin()
      .from("extratos")
      .insert(insertData)
      .select("id, trntype, dtposted, trnamt, memo, chknum");

    if (insertError) throw insertError;

    return NextResponse.json(
      { data: insertedData, count: insertedData?.length ?? 0 },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Post transaction error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
