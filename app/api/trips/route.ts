import { NextResponse } from "next/server";
import { safeDatabaseError, withUserTransaction } from "@/lib/postgres";
import {
  AuthenticationRequiredError,
  requireSessionUserId,
} from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const trips = await withUserTransaction(userId, async (client) => {
      const result = await client.query(
        `select t.id, t.name, t.destination, t.start_date, t.invite_code,
                t.short_code, t.status
         from public.trip_members m
         join public.trips t on t.id = m.trip_id
         where m.user_id = $1::uuid and m.status = 'active'
           and m.deleted_at is null and t.deleted_at is null
         order by t.created_at desc`,
        [userId]
      );
      return result.rows;
    });
    return NextResponse.json({ data: trips }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: safeDatabaseError(error) },
      { status: error instanceof AuthenticationRequiredError ? 401 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
