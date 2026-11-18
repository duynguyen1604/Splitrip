"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { POPULAR_BANKS } from "@/lib/vietqr/banks";
import {
  useMemberBankAccount,
  useSaveBankAccount,
} from "@/features/settlement/hooks/use-settlement-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Check, CreditCard, Loader2 } from "lucide-react";

interface BankAccountCardProps {
  memberId: string;
  displayName: string;
}

export function BankAccountCard({
  memberId,
  displayName,
}: BankAccountCardProps) {
  const { data: bankAccount, isLoading } = useMemberBankAccount(memberId);
  const saveMutation = useSaveBankAccount();

  const [bankBin, setBankBin] = useState("970436");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState(displayName.toUpperCase());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (bankAccount) {
      setBankBin(bankAccount.bank_bin);
      setAccountNumber(bankAccount.account_number);
      setAccountName(bankAccount.account_name);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [bankAccount]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accountNumber.trim()) {
      toast.error("Vui lòng nhập số tài khoản.");
      return;
    }
    if (!accountName.trim()) {
      toast.error("Vui lòng nhập tên chủ tài khoản.");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        memberId,
        bankBin,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim().toUpperCase(),
      });
      toast.success("Đã lưu thông tin tài khoản nhận tiền!");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể lưu thông tin.";
      toast.error(msg);
    }
  }

  const currentBank = POPULAR_BANKS.find((b) => b.bin === bankBin);

  return (
    <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
              <CreditCard className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold">
                Tài khoản nhận tiền của bạn
              </CardTitle>
              <CardDescription className="text-xs">
                Để bạn bè quét VietQR chuyển tiền cho bạn khi quyết toán
              </CardDescription>
            </div>
          </div>
          {bankAccount && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs h-8"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-teal-700" />
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="bank-select" className="text-xs font-semibold">
                Ngân hàng thụ hưởng
              </Label>
              <select
                id="bank-select"
                value={bankBin}
                onChange={(e) => setBankBin(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                {POPULAR_BANKS.map((b) => (
                  <option key={b.bin} value={b.bin}>
                    {b.shortName} — {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="account-number" className="text-xs font-semibold">
                Số tài khoản ngân hàng
              </Label>
              <Input
                id="account-number"
                required
                inputMode="numeric"
                placeholder="Ví dụ: 1023456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="h-10 font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="account-name" className="text-xs font-semibold">
                Tên chủ tài khoản (in hoa không dấu)
              </Label>
              <Input
                id="account-name"
                required
                placeholder="NGUYEN VAN A"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                className="h-10 uppercase"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="h-9 bg-teal-700 hover:bg-teal-800 text-white font-medium"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thông tin tài khoản"
                )}
              </Button>
              {bankAccount && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-teal-200/60 bg-teal-50/40 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {currentBank?.shortName ?? bankBin} · {bankAccount?.account_number}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  {bankAccount?.account_name}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <Check className="size-3" />
              Sẵn sàng
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
