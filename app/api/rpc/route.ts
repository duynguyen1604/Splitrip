import { NextResponse } from "next/server";
import {
  safeDatabaseError,
  withUserTransaction,
} from "@/lib/postgres";
import type { PoolClient } from "pg";
import {
  AuthenticationRequiredError,
  isSameOrigin,
  requireSessionUserId,
} from "@/lib/server-session";

export const runtime = "nodejs";

type RpcArgs = Record<string, unknown>;

async function executeRpc(client: PoolClient, name: string, args: RpcArgs) {
  switch (name) {
    case "create_trip":
      return withRows(client, "select * from public.create_trip($1, $2)", [
        args.p_name,
        args.p_display_name,
      ]);
    case "join_trip_by_code":
      return withRows(client, "select * from public.join_trip_by_code($1, $2)", [
        args.p_code,
        args.p_display_name,
      ]);
    case "add_expense":
      return withScalar(
        client,
        `select public.add_expense(
          $1::uuid, $2::uuid, $3, $4::bigint, $5::uuid,
          $6::public.expense_category, $7::date, $8::jsonb
        ) as result`,
        [
          args.p_trip_id,
          args.p_client_id,
          args.p_title,
          args.p_amount,
          args.p_paid_by,
          args.p_category,
          args.p_spent_on,
          JSON.stringify(args.p_splits),
        ]
      );
    case "get_trip_balances":
      return withRows(client, "select * from public.get_trip_balances($1::uuid)", [
        args.p_trip,
      ]);
    case "get_payment_target":
      return withRows(
        client,
        "select * from public.get_payment_target($1::uuid, $2::uuid)",
        [args.p_trip_id, args.p_to_member]
      );
    case "save_bank_account":
      return withScalar(
        client,
        "select public.save_bank_account($1::uuid, $2, $3, $4) as result",
        [
          args.p_member_id,
          args.p_bank_bin,
          args.p_account_number,
          args.p_account_name,
        ]
      );
    case "mark_paid":
      return withScalar(
        client,
        "select public.mark_paid($1::uuid, $2::uuid, $3::bigint) as result",
        [args.p_trip_id, args.p_to_member, args.p_amount]
      );
    case "confirm_payment":
      return withScalar(
        client,
        "select public.confirm_payment($1::uuid) as result",
        [args.p_settlement_id]
      );
    case "delete_settlement":
      return withScalar(
        client,
        "select public.delete_settlement($1::uuid) as result",
        [args.p_settlement_id]
      );
    case "lock_trip":
      return withScalar(client, "select public.lock_trip($1::uuid) as result", [
        args.p_trip_id,
      ]);
    case "unlock_trip":
      return withScalar(client, "select public.unlock_trip($1::uuid) as result", [
        args.p_trip_id,
      ]);
    default:
      throw new Error("Thao tác PostgreSQL không được hỗ trợ.");
  }
}

async function withRows(client: PoolClient, query: string, values: unknown[]) {
  const result = await client.query(query, values);
  return result.rows;
}

async function withScalar(
  client: PoolClient,
  query: string,
  values: unknown[]
) {
  const result = await client.query<{ result: unknown }>(query, values);
  return result.rows[0]?.result ?? null;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  }

  try {
    const userId = await requireSessionUserId();
    const body = (await request.json()) as { name?: unknown; args?: unknown };
    if (
      typeof body.name !== "string" ||
      !body.args ||
      typeof body.args !== "object" ||
      Array.isArray(body.args)
    ) {
      return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
    }

    const data = await withUserTransaction(userId, (client) =>
      executeRpc(client, body.name as string, body.args as RpcArgs)
    );
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof AuthenticationRequiredError ? 401 : 400;
    return NextResponse.json(
      { error: safeDatabaseError(error) },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
