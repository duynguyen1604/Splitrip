"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/topbar";
import { useTripDetail } from "@/features/trips/hooks/use-trip-detail";
import { TripProvider } from "@/features/trips/context";
import { formatVnd } from "@/lib/money";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  Wallet,
  Scale,
  Calendar,
  MapPin,
  Loader2,
  Receipt,
  QrCode,
  Map,
} from "lucide-react";

export default function TripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, error, refetch } = useTripDetail(tripId);

  const trip = data?.trip;
  const members = data?.members ?? [];
  const expenses = data?.expenses ?? [];
  const balances = data?.balances ?? [];
  const userId = data?.userId ?? "";

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );
  const selfMember = members.find((m) => m.user_id === userId);
  const myBalance =
    balances.find((b) => b.member_id === selfMember?.id)?.net ?? 0;

  const inviteUrl =
    typeof window !== "undefined" && trip
      ? `${window.location.origin}/join?code=${trip.invite_code}`
      : "";

  async function handleCopyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Đã sao chép link mời vào bộ nhớ tạm!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(`Link mời: ${inviteUrl}`);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Topbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-teal-700" />
          <p className="mt-3 text-sm">Đang tải thông tin chuyến đi...</p>
        </main>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Topbar />
        <main className="flex-1 max-w-lg mx-auto w-full p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mb-6"
          >
            <ArrowLeft className="size-3.5" />
            Về danh sách chuyến đi
          </Link>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <h2 className="text-base font-bold text-destructive">
              Không thể tải chuyến đi
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Chuyến đi không tồn tại hoặc bạn chưa tham gia."}
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4"
              size="sm"
            >
              Thử lại
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isExpensesActive = pathname === `/trips/${tripId}`;
  const isSettleActive = pathname === `/trips/${tripId}/settle`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60">
      <Topbar
        rightAction={
          <Link
            href="/"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            Tất cả chuyến ↗
          </Link>
        }
      />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mb-4 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Tất cả chuyến đi
        </Link>

        {/* Trip Header Banner */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
              Chuyến đi của nhóm
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {trip.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {trip.destination ? (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-teal-600" />
                  {trip.destination}
                </span>
              ) : (
                <span>Chưa chọn điểm đến</span>
              )}
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="size-3.5 text-teal-600" />
                {members.length} thành viên
              </span>
            </div>
          </div>

          {/* Invite Box */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-xs">
            <span className="max-w-[180px] sm:max-w-[220px] truncate px-2.5 text-xs font-mono text-muted-foreground">
              {inviteUrl}
            </span>
            <Button
              onClick={handleCopyInvite}
              size="sm"
              className="h-8 gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-teal-200" />
                  Đã chép
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Mời bạn
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Summary Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Tổng chi</span>
              <Wallet className="size-4 text-teal-600" />
            </div>
            <div className="mt-2 text-xl md:text-2xl font-black text-foreground">
              {formatVnd(totalSpent)}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Thành viên</span>
              <Users className="size-4 text-teal-600" />
            </div>
            <div className="mt-2 text-xl md:text-2xl font-black text-foreground">
              {members.length} người
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Số dư của bạn</span>
              <Scale className="size-4 text-teal-600" />
            </div>
            <div
              className={`mt-2 text-xl md:text-2xl font-black ${
                myBalance > 0
                  ? "text-emerald-600"
                  : myBalance < 0
                  ? "text-rose-600"
                  : "text-foreground"
              }`}
            >
              {myBalance > 0 ? `+${formatVnd(myBalance)}` : myBalance < 0 ? formatVnd(myBalance) : "0₫"}
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/70 mb-6 overflow-x-auto">
          <Link
            href={`/trips/${tripId}`}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
              isExpensesActive
                ? "border-teal-700 text-teal-800"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="size-3.5" />
            Chi tiêu ({expenses.length})
          </Link>

          <Link
            href={`/trips/${tripId}/settle`}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
              isSettleActive
                ? "border-teal-700 text-teal-800"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="size-3.5" />
            Quyết toán & VietQR
          </Link>

          <div className="relative inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-xs font-medium text-muted-foreground/60 opacity-60 cursor-not-allowed whitespace-nowrap">
            <Map className="size-3.5" />
            Lịch trình
            <span className="rounded-full bg-slate-100 text-slate-600 px-1.5 py-0.2 text-[10px] font-medium">
              Phase 4
            </span>
          </div>
        </div>

        {/* Page Content with Provider */}
        <TripProvider value={{ data, isLoading, refetch }}>
          {children}
        </TripProvider>
      </main>

      <footer className="mt-auto border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        Tripmate · Kế hoạch chung, chi tiêu minh bạch.
      </footer>
    </div>
  );
}
