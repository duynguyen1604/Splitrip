import { NextResponse } from "next/server";
import { safeDatabaseError, withUserTransaction } from "@/lib/postgres";
import {
  AuthenticationRequiredError,
  isUuid,
  requireSessionUserId,
} from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ tripId: string }> }
) {
  try {
    const userId = await requireSessionUserId();
    const { tripId } = await context.params;
    const toMember = new URL(request.url).searchParams.get("toMember") ?? "";
    if (!isUuid(tripId) || !isUuid(toMember)) {
      return NextResponse.json({ error: "Mã chuyến hoặc thành viên không hợp lệ." }, { status: 400 });
    }

    const result = await withUserTransaction(userId, async (client) =>
      client.query(
        "select * from public.get_payment_target($1::uuid, $2::uuid)",
        [tripId, toMember]
      )
    );
    return NextResponse.json(
      { data: result.rows[0] ?? null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: safeDatabaseError(error) },
      { status: error instanceof AuthenticationRequiredError ? 401 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
