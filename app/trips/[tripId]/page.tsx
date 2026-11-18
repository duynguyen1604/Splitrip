"use client";

import { useTripContext } from "@/features/trips/context";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { BalanceList } from "@/features/expenses/components/balance-list";
import { MemberList } from "@/features/trips/components/member-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TripExpensesPage() {
  const { data, refetch } = useTripContext();
  const { trip, members, expenses, balances, userId } = data;

  const getMemberName = (id: string) =>
    members.find((m) => m.id === id)?.display_name ?? "Thành viên";

  return (
    <div className="space-y-6">
      {/* 2-Column Section: Expenses and Add Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Expenses List Column */}
        <div className="md:col-span-7">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    Khoản chi trong chuyến
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tất cả các lần chi tiêu đã được ghi nhận
                  </CardDescription>
                </div>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  {expenses.length} khoản
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ExpenseList
                expenses={expenses}
                getMemberName={getMemberName}
              />
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form Column */}
        <div className="md:col-span-5">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold">Thêm khoản chi</CardTitle>
              <CardDescription className="text-xs">
                Khoản chi được chia đều và phân bổ số dư tự động
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ExpenseForm
                members={members}
                userId={userId}
                tripId={trip.id}
                onSuccess={() => refetch()}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2-Column Section: Balances and Members */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Balances Column */}
        <div className="md:col-span-7">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold">
                Số dư trong chuyến
              </CardTitle>
              <CardDescription className="text-xs">
                Số tiền đã trả trừ đi phần phải chịu. Tổng số dư của cả nhóm luôn bằng 0.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <BalanceList
                balances={balances}
                getMemberName={getMemberName}
                userId={userId}
                members={members}
              />
            </CardContent>
          </Card>
        </div>

        {/* Members Column */}
        <div className="md:col-span-5">
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    Thành viên
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Những người đã tham gia vào chuyến
                  </CardDescription>
                </div>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  {members.length} người
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <MemberList members={members} userId={userId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
