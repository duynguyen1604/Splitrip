"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Topbar } from "@/components/topbar";
import { TripCard } from "@/components/trip-card";
import { useTrips } from "@/features/trips/hooks/use-trips";
import { useCreateTrip } from "@/features/trips/hooks/use-create-trip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  Plus,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { data: authSession, isPending: authPending } = authClient.useSession();
  const isAuthenticated = Boolean(authSession?.user);
  const { data: trips = [], isLoading, isError, error, refetch } = useTrips();
  const createTripMutation = useCreateTrip();

  async function handleCreateTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const creatorName = displayName.trim() || authSession?.user.name.trim() || "";

    if (!tripName.trim()) {
      toast.error("Vui lòng nhập tên chuyến đi.");
      return;
    }
    if (!creatorName) {
      toast.error("Vui lòng nhập tên hiển thị của bạn.");
      return;
    }

    try {
      const result = await createTripMutation.mutateAsync({
        name: tripName.trim(),
        displayName: creatorName,
      });
      toast.success("Tạo chuyến đi thành công!");
      router.push(`/trips/${result.trip_id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo chuyến đi.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      <Topbar subtitle="Đi cùng nhau, chia tiền rõ ràng." />

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#123f36] px-5 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-9 sm:py-10 lg:min-h-[360px] lg:px-12">
          <div className="absolute -right-16 -top-28 -z-10 size-80 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="absolute -bottom-36 left-1/3 -z-10 size-80 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="grid items-center gap-9 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-100">
                <Compass className="size-3.5" />
                Đi cùng nhau, vui trọn chuyến
              </div>
              <h1 className="mt-5 text-3xl font-black leading-[1.12] tracking-tight sm:text-4xl lg:text-[50px]">
                Chuyến đi của cả nhóm,
                <span className="block text-teal-200">gói gọn trong một nơi.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                Rủ bạn bè, theo dõi chi tiêu và biết rõ ai cần thanh toán cho ai —
                từ lúc lên kèo đến khi về nhà.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <a
                    href="#create-trip"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#123f36] transition hover:bg-teal-50"
                  >
                    <Plus className="size-4" />
                    Tạo chuyến mới
                  </a>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#123f36] transition hover:bg-teal-50"
                  >
                    Bắt đầu miễn phí <ArrowRight className="size-4" />
                  </Link>
                )}
                <Link
                  href="/join"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <KeyRound className="size-4" />
                  Tôi có mã mời
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-white/55">
                {isAuthenticated
                  ? `Xin chào ${authSession?.user.name}, sẵn sàng lên đường chưa?`
                  : "Đăng nhập để lưu chuyến đi và đồng bộ giữa các thiết bị."}
              </p>
            </div>

            <div className="mx-auto w-full max-w-[420px] lg:ml-auto">
              <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-3 shadow-2xl backdrop-blur-sm sm:p-4">
                <div className="rounded-[20px] bg-[#f9fbf9] p-4 text-slate-900 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-800">
                        Lịch trình mẫu
                      </p>
                      <h2 className="mt-1.5 text-lg font-extrabold">Đà Lạt cuối tuần</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="size-3.5" /> Đà Lạt · 3 ngày · 5 người
                      </p>
                    </div>
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                      <Compass className="size-5" />
                    </span>
                  </div>

                  <div className="relative mt-5 space-y-3 before:absolute before:bottom-5 before:left-[13px] before:top-5 before:w-px before:bg-teal-200">
                    <div className="relative flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white"><MapPin className="size-3.5" /></span>
                      <div><p className="text-xs font-bold">Hẹn nhau khởi hành</p><p className="mt-0.5 text-[10px] text-slate-500">Thứ Sáu · 17:30</p></div>
                      <Check className="ml-auto size-4 text-teal-700" />
                    </div>
                    <div className="relative flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                      <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white"><CalendarDays className="size-3.5" /></span>
                      <div><p className="text-xs font-bold">Cà phê ngắm đồi</p><p className="mt-0.5 text-[10px] text-slate-500">Thứ Bảy · 08:00</p></div>
                      <Users className="ml-auto size-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-teal-50 p-3">
                      <span className="flex items-center gap-2 text-xs font-semibold text-teal-900"><Wallet className="size-4" /> Chi tiêu minh bạch</span>
                      <span className="text-xs font-extrabold text-teal-800">1.250.000₫</span>
                    </div>
                  </div>
                  <p className="mt-3 text-right text-[9px] font-medium text-slate-400">Giao diện minh họa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 py-6 sm:grid-cols-3 sm:py-8">
          <FeatureCard icon={<Users className="size-4" />} title="Cả nhóm cùng tham gia" description="Mời bạn bè bằng link hoặc mã chuyến." />
          <FeatureCard icon={<Receipt className="size-4" />} title="Chi tiêu rõ ràng" description="Ghi khoản chi và xem số dư cập nhật." />
          <FeatureCard icon={<CreditCard className="size-4" />} title="Quyết toán gọn nhẹ" description="Gợi ý chuyển tiền và tạo mã VietQR." />
        </section>

        {isAuthenticated ? (
          <section id="create-trip" className="grid scroll-mt-24 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="text-lg font-extrabold">Chuyến đi của bạn</CardTitle>
                  <CardDescription className="mt-1 text-xs">Tiếp tục kế hoạch cùng nhóm.</CardDescription>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{trips.length} chuyến</span>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                {isLoading || authPending ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                    <Loader2 className="size-5 animate-spin text-teal-700" /> Đang tải chuyến đi...
                  </div>
                ) : isError ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Chưa tải được chuyến đi.</p>
                    <p className="mt-1 text-xs">{error instanceof Error ? error.message : "Vui lòng thử lại."}</p>
                    <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-3">Thử lại</Button>
                  </div>
                ) : trips.length > 0 ? (
                  <div className="space-y-3">{trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-teal-800 shadow-sm"><Compass className="size-6" /></span>
                    <p className="mt-4 text-sm font-bold text-slate-900">Chuyến đi đầu tiên đang chờ bạn</p>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">Tạo chuyến mới hoặc nhập mã mời để tham gia kế hoạch của bạn bè.</p>
                    <a href="#new-trip" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:underline">Bắt đầu ngay <ArrowDownRight className="size-3.5" /></a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card id="new-trip" className="scroll-mt-24 rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800"><Plus className="size-4" /></span>
                  <CardTitle className="text-lg font-extrabold">Lên kế hoạch mới</CardTitle>
                </div>
                <CardDescription className="text-xs">Bắt đầu bằng tên chuyến và tên hiển thị của bạn.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTrip} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="trip-name" className="text-xs font-semibold">Tên chuyến đi</Label>
                    <Input id="trip-name" maxLength={80} required placeholder="Ví dụ: Đà Lạt săn mây cuối tuần" value={tripName} onChange={(event) => setTripName(event.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="organizer-name" className="text-xs font-semibold">Tên bạn muốn dùng trong chuyến</Label>
                    <Input id="organizer-name" maxLength={30} placeholder={authSession?.user.name || "Ví dụ: Minh Anh"} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <Button type="submit" disabled={createTripMutation.isPending} className="h-11 w-full rounded-xl bg-teal-800 font-bold text-white hover:bg-teal-900">
                    {createTripMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                    {createTripMutation.isPending ? "Đang tạo chuyến..." : "Tạo chuyến đi"}
                  </Button>
                </form>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs text-slate-500">Đã được mời vào chuyến?</p>
                  <Link href="/join" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 transition hover:bg-slate-50">
                    <KeyRound className="size-3.5 text-teal-800" /> Nhập mã mời
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Sẵn sàng lên đường?</p>
              <h2 className="mt-2 text-xl font-black text-slate-900">Tạo tài khoản để lưu chuyến đi của bạn.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Đăng nhập trên điện thoại hoặc máy tính để cùng nhóm lập kế hoạch và theo dõi chi tiêu.</p>
            </div>
            <Link href="/login" className="mt-5 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-bold text-white transition hover:bg-teal-900 sm:mt-0">
              Đăng nhập / Đăng ký <ArrowRight className="size-4" />
            </Link>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        Tripmate · Mọi kế hoạch, một hành trình.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
