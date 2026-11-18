"use client";

import { formatVnd } from "@/lib/money";
import { CATEGORIES } from "@/lib/constants";
import type { Expense } from "@/features/trips/types";
import { ReceiptText, Utensils, Plane, Hotel, Ticket, CircleEllipsis } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  getMemberName: (id: string) => string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  food: Utensils,
  transport: Plane,
  lodging: Hotel,
  tickets: Ticket,
  other: CircleEllipsis,
};

export function ExpenseList({ expenses, getMemberName }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <ReceiptText className="size-6" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">
          Chưa có khoản chi nào
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ghi lại khoản chi đầu tiên của chuyến đi bằng biểu mẫu bên dưới.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/70">
      {expenses.map((expense) => {
        const Icon = CATEGORY_ICONS[expense.category] ?? CircleEllipsis;
        const categoryLabel = CATEGORIES[expense.category] ?? "Khác";
        const payerName = getMemberName(expense.paid_by);
        const formattedDate = new Date(
          `${expense.spent_on}T00:00:00`
        ).toLocaleDateString("vi-VN");

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground text-sm">
                  {expense.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {payerName} đã trả · {categoryLabel} · {formattedDate}
                </p>
              </div>
            </div>

            <span className="shrink-0 font-bold text-foreground text-sm">
              {formatVnd(expense.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
