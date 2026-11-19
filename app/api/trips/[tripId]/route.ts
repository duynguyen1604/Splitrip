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

    const data = await withUserTransaction(userId, async (client) => {
      const access = await client.query<{ allowed: boolean }>(
        "select public.is_trip_member($1::uuid) as allowed",
        [tripId]
      );
      if (!access.rows[0]?.allowed) return null;

      const [tripResult, memberResult, expenseResult, balanceResult] =
        await Promise.all([
          client.query(
            `select id, name, destination, start_date, end_date, invite_code,
                    short_code, status
             from public.trips where id = $1::uuid and deleted_at is null`,
            [tripId]
          ),
          client.query(
            `select id, trip_id, display_name, role, status, user_id, created_at
             from public.trip_members
             where trip_id = $1::uuid and deleted_at is null
             order by created_at`,
            [tripId]
          ),
          client.query(
            `select e.id, e.title, e.amount, e.category, e.spent_on,
                    e.paid_by, e.created_at,
                    coalesce(
                      jsonb_agg(jsonb_build_object(
                        'member_id', s.member_id,
                        'owed_amount', s.owed_amount
                      )) filter (where s.member_id is not null),
                      '[]'::jsonb
                    ) as expense_splits
             from public.expenses e
             left join public.expense_splits s on s.expense_id = e.id
             where e.trip_id = $1::uuid and e.deleted_at is null
             group by e.id
             order by e.spent_on desc, e.created_at desc`,
            [tripId]
          ),
          client.query(
            "select * from public.get_trip_balances($1::uuid)",
            [tripId]
          ),
        ]);

      const trip = tripResult.rows[0];
      if (!trip) return null;

      return {
        trip,
        members: memberResult.rows,
        expenses: expenseResult.rows.map((expense) => ({
          ...expense,
          amount: Number(expense.amount),
          expense_splits: expense.expense_splits.map(
            (split: { owed_amount: string | number }) => ({
              ...split,
              owed_amount: Number(split.owed_amount),
            })
          ),
        })),
        balances: balanceResult.rows.map((balance) => ({
          ...balance,
          paid: Number(balance.paid),
          owed: Number(balance.owed),
          sent: Number(balance.sent),
          received: Number(balance.received),
          net: Number(balance.net),
        })),
        userId,
      };
    });

    if (!data) {
      return NextResponse.json({ error: "Chuyến đi không tồn tại hoặc bạn chưa tham gia." }, { status: 404 });
    }
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: safeDatabaseError(error) },
      { status: error instanceof AuthenticationRequiredError ? 401 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
