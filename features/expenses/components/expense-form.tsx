"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatVnd, splitEqually } from "@/lib/money";
import { CATEGORIES, localDateString } from "@/lib/constants";
import { useAddExpense } from "@/features/expenses/hooks/use-add-expense";
import type { Member } from "@/features/trips/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";

interface ExpenseFormProps {
  members: Member[];
  userId: string;
  tripId: string;
  onSuccess?: () => void;
}

export function ExpenseForm({
  members,
  userId,
  tripId,
  onSuccess,
}: ExpenseFormProps) {
  const activeMembers = members.filter((m) => m.status === "active");
  const self = members.find((m) => m.user_id === userId);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [payerIdOverride, setPayerIdOverride] = useState<string | null>(null);
  const payerId = payerIdOverride ?? self?.id ?? activeMembers[0]?.id ?? "";
  const [selectedIdsOverride, setSelectedIdsOverride] = useState<string[] | null>(null);
  const selectedIds = selectedIdsOverride ?? activeMembers.map((m) => m.id);

  const addExpenseMutation = useAddExpense();

  const numericAmount = Number(amount.replace(/[.,\s₫]/g, ""));
  const perPersonEstimate =
    selectedIds.length > 0 && numericAmount > 0
      ? Math.floor(numericAmount / selectedIds.length)
      : 0;

  function handleToggleMember(id: string) {
    setSelectedIdsOverride((current) => {
      const selected = current ?? activeMembers.map((m) => m.id);
      return selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id];
    });
  }

  function handleSelectAll() {
    if (selectedIds.length === activeMembers.length) {
      setSelectedIdsOverride([]);
    } else {
      setSelectedIdsOverride(activeMembers.map((m) => m.id));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người tham gia chia tiền.");
      return;
    }

    if (!payerId) {
      toast.error("Vui lòng chọn người đã trả tiền.");
      return;
    }

    try {
      const splitRows = splitEqually(numericAmount, selectedIds);
      await addExpenseMutation.mutateAsync({
        tripId,
        title: title.trim() || CATEGORIES[category] || "Chi tiêu",
        amount: numericAmount,
        paidBy: payerId,
        category,
        spentOn: localDateString(),
        splits: splitRows,
      });

      toast.success("Đã lưu khoản chi và cập nhật số dư.");
      setTitle("");
      setAmount("");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể lưu khoản chi.";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="expense-amount" className="text-xs font-semibold">
          Số tiền (VND) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="expense-amount"
          inputMode="numeric"
          required
          placeholder="Ví dụ: 350.000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-10 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expense-title" className="text-xs font-semibold">
          Tên khoản chi
        </Label>
        <Input
          id="expense-title"
          maxLength={100}
          placeholder="Ví dụ: Ăn trưa hải sản, Vé cáp treo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="payer" className="text-xs font-semibold">
            Ai đã trả? <span className="text-red-500">*</span>
          </Label>
          <select
            id="payer"
            required
            value={payerId}
            onChange={(e) => setPayerIdOverride(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          >
            {activeMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.display_name}
                {member.user_id === userId ? " (bạn)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-semibold">
            Hạng mục
          </Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          >
            {Object.entries(CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">
            Chia cho ({selectedIds.length}/{activeMembers.length})
          </Label>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-medium text-teal-700 hover:underline"
          >
            {selectedIds.length === activeMembers.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-border p-2 bg-muted/20">
          {activeMembers.map((member) => {
            const isChecked = selectedIds.includes(member.id);
            return (
              <label
                key={member.id}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted/50 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                    {member.display_name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="font-medium text-foreground">
                    {member.display_name}
                    {member.user_id === userId ? " (bạn)" : ""}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleMember(member.id)}
                  className="size-4 rounded border-border text-teal-700 focus:ring-teal-700"
                />
              </label>
            );
          })}
        </div>
      </div>

      {perPersonEstimate > 0 && (
        <div className="rounded-xl bg-teal-50/80 border border-teal-200/60 p-2.5 text-xs text-teal-900 flex items-center justify-between">
          <span>Ước tính / người:</span>
          <span className="font-bold text-teal-800">
            {formatVnd(perPersonEstimate)}
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={addExpenseMutation.isPending || activeMembers.length === 0}
        className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white font-semibold transition-all shadow-sm"
      >
        {addExpenseMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 size-4" />
            Lưu khoản chi
          </>
        )}
      </Button>
    </form>
  );
}
