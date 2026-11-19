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
  context: { params: Promise<{ memberId: string }> }
) {
  try {
    const userId = await requireSessionUserId();
    const { memberId } = await context.params;
    if (!isUuid(memberId)) {
      return NextResponse.json({ error: "Mã thành viên không hợp lệ." }, { status: 400 });
    }

    const account = await withUserTransaction(userId, async (client) => {
      const result = await client.query(
        `select b.member_id, b.bank_bin, b.account_number, b.account_name
         from public.trip_members m
         left join public.member_bank_accounts b on b.member_id = m.id
         where m.id = $1::uuid and m.user_id = $2::uuid and m.deleted_at is null`,
        [memberId, userId]
      );
      return result.rows[0] ?? null;
    });

    if (!account) {
      return NextResponse.json({ error: "Bạn không thể xem tài khoản này." }, { status: 403 });
    }
    return NextResponse.json(
      { data: account.bank_bin ? account : null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: safeDatabaseError(error) },
      { status: error instanceof AuthenticationRequiredError ? 401 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
