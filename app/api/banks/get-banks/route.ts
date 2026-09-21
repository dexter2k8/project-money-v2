import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { TGetBankResponse } from "../types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth();

    const { data, error, count } = await getSupabaseAdmin()
      .from("bancos")
      .select("*", { count: "exact" });

    if (error) throw error;

    return NextResponse.json({ data: data as TGetBankResponse[], count: count ?? 0 }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get banks error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
