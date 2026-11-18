"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { formatVnd } from "@/lib/money";
import { getBankByBin } from "@/lib/vietqr/banks";
import { buildVietQrPayload, sanitizeMemo } from "@/lib/vietqr/payload";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  X,
  QrCode,
  Building2,
  User,
  CreditCard,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface VietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  receiverName: string;
  tripCode: string;
  senderName: string;
  onMarkPaid?: () => Promise<void>;
}

export function VietQrModal({
  isOpen,
  onClose,
  bankBin,
  accountNumber,
  accountName,
  amount,
  receiverName,
  tripCode,
  senderName,
  onMarkPaid,
}: VietQrModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  const bank = getBankByBin(bankBin);
  const memo = sanitizeMemo(`TM ${tripCode.slice(0, 6)} ${senderName}`);

  useEffect(() => {
    if (!isOpen || !bankBin || !accountNumber) return;

    const payload = buildVietQrPayload({
      bankBin,
      accountNumber,
      amount,
      memo,
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: {
        dark: "#0f766e",
        light: "#ffffff",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => {
        console.error("Lỗi tạo mã QR:", err);
      });
  }, [isOpen, bankBin, accountNumber, amount, memo]);

  if (!isOpen) return null;

  async function handleCopy(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`Đã chép ${field}!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.info(text);
    }
  }

  async function handleConfirmMarkPaid() {
    if (!onMarkPaid) return;
    setMarking(true);
    try {
      await onMarkPaid();
      toast.success("Đã ghi nhận thanh toán chờ xác nhận!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <QrCode className="size-4" />
            </span>
            <div>
              <h3 className="font-bold text-foreground text-base">
                Thanh toán VietQR
              </h3>
              <p className="text-xs text-muted-foreground">
                Chuyển cho {receiverName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div className="relative rounded-2xl border border-teal-200 bg-white p-3 shadow-md">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="VietQR Code"
                className="size-56 sm:size-64 object-contain rounded-lg"
              />
            ) : (
              <div className="flex size-56 sm:size-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-teal-700" />
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Mở app ngân hàng quét mã QR để điền tự động số tiền & nội dung
          </p>
        </div>

        {/* Transfer Details Card */}
        <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-teal-700" />
              Ngân hàng
            </span>
            <span className="font-semibold text-foreground text-right truncate max-w-[200px]">
              {bank?.shortName ?? bankBin}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-teal-700" />
              Số tài khoản
            </span>
            <button
              onClick={() => handleCopy(accountNumber, "số tài khoản")}
              className="flex items-center gap-1 font-mono font-bold text-teal-800 hover:underline"
            >
              {accountNumber}
              {copiedField === "số tài khoản" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-teal-700" />
              Chủ tài khoản
            </span>
            <span className="font-bold text-foreground uppercase">
              {accountName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Số tiền</span>
            <button
              onClick={() => handleCopy(String(amount), "số tiền")}
              className="flex items-center gap-1 font-black text-foreground text-sm hover:underline"
            >
              {formatVnd(amount)}
              {copiedField === "số tiền" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-teal-700" />
              Nội dung CK
            </span>
            <button
              onClick={() => handleCopy(memo, "nội dung")}
              className="flex items-center gap-1 font-mono font-semibold text-teal-800 hover:underline"
            >
              {memo}
              {copiedField === "nội dung" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        {onMarkPaid && (
          <Button
            onClick={handleConfirmMarkPaid}
            disabled={marking}
            className="mt-4 w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md gap-2"
          >
            {marking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang lưu giao dịch...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Tôi đã chuyển tiền xong
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
