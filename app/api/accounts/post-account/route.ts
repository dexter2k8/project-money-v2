import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { NextRequest } from "next/server";
import type { TPostAccountArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const body: TPostAccountArgs = await req.json();

    const { data, error } = await getSupabaseAdmin()
      .from("contas")
      .insert({
        acctid: body.acctid,
        accttype: body.accttype,
        bankid: body.bankid,
        branchid: body.branchid,
        description: body.description,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, ...body }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Create account error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
