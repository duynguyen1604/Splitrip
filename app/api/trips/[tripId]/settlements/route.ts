import { NextResponse } from "next/server";
import { safeDatabaseError, withUserTransaction } from "@/lib/postgres";
import {
  AuthenticationRequiredError,
  isUuid,
  requireSessionUserId,
} from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string }> }
) {
  try {
    const userId = await requireSessionUserId();
    const { tripId } = await context.params;
    if (!isUuid(tripId)) {
      return NextResponse.json({ error: "Mã chuyến không hợp lệ." }, { status: 400 });
    }

    const settlements = await withUserTransaction(userId, async (client) => {
      const access = await client.query<{ allowed: boolean }>(
        "select public.is_trip_member($1::uuid) as allowed",
        [tripId]
      );
      if (!access.rows[0]?.allowed) return null;

      const result = await client.query(
        `select id, trip_id, from_member, to_member, amount, status,
                marked_at, confirmed_at, created_by
         from public.settlements
         where trip_id = $1::uuid and deleted_at is null
         order by marked_at desc`,
        [tripId]
      );
      return result.rows.map((row) => ({ ...row, amount: Number(row.amount) }));
    });

    if (!settlements) {
      return NextResponse.json({ error: "Chuyến đi không tồn tại hoặc bạn chưa tham gia." }, { status: 404 });
    }
    return NextResponse.json({ data: settlements }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: safeDatabaseError(error) },
      { status: error instanceof AuthenticationRequiredError ? 401 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
