"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTripContext } from "@/features/trips/context";
import {
  useSettlements,
  useMarkPaid,
  useConfirmPayment,
  useDeleteSettlement,
  useToggleTripLock,
} from "@/features/settlement/hooks/use-settlement-data";
import { simplifyDebts, type Transfer } from "@/lib/settlement/simplify";
import { formatVnd } from "@/lib/money";
import { ensureAnonymousSession } from "@/lib/supabase";
import { BankAccountCard } from "@/features/settlement/components/bank-account-card";
import { VietQrModal } from "@/features/settlement/components/vietqr-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  QrCode,
  Scale,
  Send,
  Trash2,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

export default function TripSettlePage() {
  const { data, refetch: refetchTrip } = useTripContext();
  const { trip, members, balances, userId } = data;

  const { data: settlements = [], refetch: refetchSettlements } =
    useSettlements(trip.id);

  const markPaidMutation = useMarkPaid();
  const confirmPaymentMutation = useConfirmPayment();
  const deleteSettlementMutation = useDeleteSettlement();
  const toggleLockMutation = useToggleTripLock();

  const selfMember = members.find((m) => m.user_id === userId);
  const isOwner = selfMember?.role === "owner";
  const isLocked = trip.status === "locked";

  // VietQR modal state
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null
  );
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [targetBank, setTargetBank] = useState<{
    bankBin: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [loadingTarget, setLoadingTarget] = useState(false);

  // Compute suggested transfers using simplifyDebts algorithm
  const suggestedTransfers = useMemo(() => {
    const netMap = new Map<string, number>();
    for (const b of balances) {
      netMap.set(b.member_id, b.net);
    }
    const order = members.map((m) => m.id);
    return simplifyDebts(netMap, order);
  }, [balances, members]);

  const getMemberName = (id: string) =>
    members.find((m) => m.id === id)?.display_name ?? "Thành viên";

  // Handle opening VietQR modal
  async function handleOpenVietQr(transfer: Transfer) {
    setSelectedTransfer(transfer);
    setLoadingTarget(true);

    try {
      const { supabase } = await ensureAnonymousSession();
      const { data: targetData, error } = await supabase.rpc(
        "get_payment_target",
        {
          p_trip_id: trip.id,
          p_to_member: transfer.to,
        }
      );

      if (error) throw error;
      const res = Array.isArray(targetData) ? targetData[0] : targetData;

      if (!res?.bank_bin || !res?.account_number) {
        toast.info(
          `${getMemberName(
            transfer.to
          )} chưa cập nhật tài khoản ngân hàng. Hãy nhắn bạn ấy thêm tài khoản bên dưới nhé!`
        );
        setTargetBank(null);
      } else {
        setTargetBank({
          bankBin: res.bank_bin,
          accountNumber: res.account_number,
          accountName: res.account_name,
        });
        setQrModalOpen(true);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải thông tin ngân hàng.";
      toast.error(msg);
    } finally {
      setLoadingTarget(false);
    }
  }

  // Quick mark paid
  async function handleQuickMarkPaid(transfer: Transfer) {
    try {
      await markPaidMutation.mutateAsync({
        tripId: trip.id,
        toMember: transfer.to,
        amount: transfer.amount,
      });
      toast.success("Đã ghi nhận thanh toán chờ xác nhận!");
      refetchSettlements();
      refetchTrip();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi ghi nhận.";
      toast.error(msg);
    }
  }

  // Confirm payment
  async function handleConfirm(settlementId: string) {
    try {
      await confirmPaymentMutation.mutateAsync({
        tripId: trip.id,
        settlementId,
      });
      toast.success("Đã xác nhận nhận tiền thành công!");
      refetchSettlements();
      refetchTrip();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xác nhận.";
      toast.error(msg);
    }
  }

  // Delete / cancel settlement
  async function handleDelete(settlementId: string) {
    try {
      await deleteSettlementMutation.mutateAsync({
        tripId: trip.id,
        settlementId,
      });
      toast.success("Đã hủy giao dịch!");
      refetchSettlements();
      refetchTrip();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể hủy.";
      toast.error(msg);
    }
  }

  // Toggle trip lock
  async function handleToggleLock() {
    try {
      await toggleLockMutation.mutateAsync({
        tripId: trip.id,
        lock: !isLocked,
      });
      toast.success(
        isLocked
          ? "Đã mở lại sổ chi tiêu cho chuyến đi."
          : "Đã chốt sổ chi tiêu thành công!"
      );
      refetchTrip();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể đổi trạng thái.";
      toast.error(msg);
    }
  }

  const pendingSettlements = settlements.filter(
    (s) => s.status === "marked_paid"
  );
  const confirmedSettlements = settlements.filter(
    (s) => s.status === "confirmed"
  );

  return (
    <div className="space-y-6">
      {/* Trip Status Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              isLocked
                ? "bg-amber-100 text-amber-800"
                : "bg-teal-100 text-teal-800"
            }`}
          >
            {isLocked ? (
              <Lock className="size-5" />
            ) : (
              <Unlock className="size-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm">
                Trạng thái:{" "}
                {isLocked ? "Đã chốt sổ quyết toán" : "Đang ghi chi tiêu"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {isLocked
                ? "Chuyến đi đã chốt sổ, không thể thêm khoản chi mới để đảm bảo số tiền quyết toán không đổi."
                : "Khi cả nhóm đã chi tiêu xong, người tạo chuyến có thể chốt sổ để chuyển tiền."}
            </p>
          </div>
        </div>

        {isOwner && (
          <Button
            variant={isLocked ? "outline" : "default"}
            size="sm"
            onClick={handleToggleLock}
            disabled={toggleLockMutation.isPending}
            className={`gap-1.5 h-9 shrink-0 ${
              !isLocked
                ? "bg-teal-700 hover:bg-teal-800 text-white font-medium"
                : ""
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="size-3.5" />
                Mở lại chi tiêu
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                Chốt sổ quyết toán
              </>
            )}
          </Button>
        )}
      </div>

      {/* Suggested Settlements Section */}
      <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Scale className="size-4" />
              </span>
              <div>
                <CardTitle className="text-base font-bold">
                  Gợi ý chuyển tiền tối giản nợ
                </CardTitle>
                <CardDescription className="text-xs">
                  Thuật toán tính toán số giao dịch ít nhất để cả nhóm cân bằng số dư
                </CardDescription>
              </div>
            </div>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
              {suggestedTransfers.length} giao dịch
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {suggestedTransfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="size-10 text-emerald-600 mb-2" />
              <p className="font-bold text-foreground text-sm">
                Tất cả số dư đã cân bằng!
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Không còn khoản nợ nào cần thanh toán giữa các thành viên trong chuyến đi.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {suggestedTransfers.map((transfer, index) => {
                const fromName = getMemberName(transfer.from);
                const toName = getMemberName(transfer.to);
                const isFromMe = transfer.from === selfMember?.id;
                const isToMe = transfer.to === selfMember?.id;

                return (
                  <div
                    key={`${transfer.from}-${transfer.to}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* From Member */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex size-8 items-center justify-center rounded-xl bg-rose-100 text-rose-800 text-xs font-bold shrink-0">
                          {fromName.slice(0, 1).toUpperCase()}
                        </span>
                        <span
                          className={`font-semibold text-sm truncate max-w-[100px] sm:max-w-[130px] ${
                            isFromMe ? "text-teal-800" : "text-foreground"
                          }`}
                        >
                          {fromName}
                          {isFromMe && " (bạn)"}
                        </span>
                      </div>

                      <ArrowRight className="size-4 text-muted-foreground shrink-0" />

                      {/* To Member */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                          {toName.slice(0, 1).toUpperCase()}
                        </span>
                        <span
                          className={`font-semibold text-sm truncate max-w-[100px] sm:max-w-[130px] ${
                            isToMe ? "text-teal-800" : "text-foreground"
                          }`}
                        >
                          {toName}
                          {isToMe && " (bạn)"}
                        </span>
                      </div>
                    </div>

                    {/* Amount & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="font-black text-foreground text-sm sm:text-base">
                        {formatVnd(transfer.amount)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleOpenVietQr(transfer)}
                          disabled={loadingTarget}
                          className="h-8 gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs shadow-xs"
                        >
                          <QrCode className="size-3.5" />
                          VietQR
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickMarkPaid(transfer)}
                          disabled={markPaidMutation.isPending}
                          className="h-8 text-xs font-medium"
                        >
                          Đã chuyển
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2-Column: Bank Account Configuration & Pending Settlements */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bank Account */}
        <div className="md:col-span-5">
          {selfMember && (
            <BankAccountCard
              memberId={selfMember.id}
              displayName={selfMember.display_name}
            />
          )}
        </div>

        {/* Right Column: Settlement History */}
        <div className="md:col-span-7 space-y-6">
          {/* Pending Settlements */}
          <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-bold">
                      Giao dịch chờ xác nhận
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Người chuyển đã báo xong, chờ người nhận kiểm tra tài khoản
                    </CardDescription>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {pendingSettlements.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {pendingSettlements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Không có giao dịch nào đang chờ xác nhận.
                </p>
              ) : (
                <div className="divide-y divide-border/70">
                  {pendingSettlements.map((s) => {
                    const fromName = getMemberName(s.from_member);
                    const toName = getMemberName(s.to_member);
                    const canConfirm =
                      s.to_member === selfMember?.id || isOwner;
                    const canDelete =
                      s.from_member === selfMember?.id ||
                      s.to_member === selfMember?.id ||
                      isOwner;

                    return (
                      <div
                        key={s.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <span>{fromName}</span>
                            <ArrowRight className="size-3 text-muted-foreground" />
                            <span>{toName}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(s.marked_at).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            · {formatVnd(s.amount)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {canConfirm && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirm(s.id)}
                              disabled={confirmPaymentMutation.isPending}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            >
                              <Check className="mr-1 size-3" />
                              Xác nhận nhận tiền
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(s.id)}
                              disabled={deleteSettlementMutation.isPending}
                              className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confirmed Settlements */}
          {confirmedSettlements.length > 0 && (
            <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    Đã hoàn thành ({confirmedSettlements.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="divide-y divide-border/60">
                  {confirmedSettlements.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 text-xs"
                    >
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>
                          {getMemberName(s.from_member)} →{" "}
                          {getMemberName(s.to_member)}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatVnd(s.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* VietQR Modal */}
      {selectedTransfer && targetBank && (
        <VietQrModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          bankBin={targetBank.bankBin}
          accountNumber={targetBank.accountNumber}
          accountName={targetBank.accountName}
          amount={selectedTransfer.amount}
          receiverName={getMemberName(selectedTransfer.to)}
          tripCode={trip.invite_code}
          senderName={selfMember?.display_name ?? "Ban"}
          onMarkPaid={() => handleQuickMarkPaid(selectedTransfer)}
        />
      )}
    </div>
  );
}
