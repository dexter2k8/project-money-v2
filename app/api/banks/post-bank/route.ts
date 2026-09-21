import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/supabase-error";
import { getSupabaseAdmin } from "@/app/services/supabase-admin";
import type { TPostBankArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body: TPostBankArgs = await req.json();
    const { id, ...data } = body;

    const { error } = await getSupabaseAdmin()
      .from("bancos")
      .upsert({ id, ...data })
      .select()
      .single<{ id: string }>();

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Create bank error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
