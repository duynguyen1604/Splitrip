"use client";

import { formatVnd } from "@/lib/money";
import type { Balance, Member } from "@/features/trips/types";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

interface BalanceListProps {
  balances: Balance[];
  getMemberName: (id: string) => string;
  userId: string;
  members: Member[];
}

export function BalanceList({
  balances,
  getMemberName,
  userId,
  members,
}: BalanceListProps) {
  if (balances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
        <Scale className="size-8 text-muted-foreground/60" />
        <p className="mt-2 text-xs text-muted-foreground">
          Số dư sẽ xuất hiện sau khi nhóm ghi khoản chi đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/70">
      {balances.map((balance) => {
        const member = members.find((m) => m.id === balance.member_id);
        const isSelf = member?.user_id === userId;
        const name = getMemberName(balance.member_id);

        return (
          <div
            key={balance.member_id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 text-xs font-bold">
                {name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground text-sm">
                  {name}
                  {isSelf && (
                    <span className="ml-1 text-xs text-teal-700 font-medium">
                      (bạn)
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Đã trả {formatVnd(balance.paid)} · Chịu {formatVnd(balance.owed)}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {balance.net > 0 ? (
                <div className="flex items-center gap-1 font-bold text-emerald-600 text-sm">
                  <ArrowDownLeft className="size-3.5" />
                  <span>+{formatVnd(balance.net)}</span>
                </div>
              ) : balance.net < 0 ? (
                <div className="flex items-center gap-1 font-bold text-rose-600 text-sm">
                  <ArrowUpRight className="size-3.5" />
                  <span>{formatVnd(Math.abs(balance.net))}</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  Đã cân bằng
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
