"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Topbar } from "@/components/topbar";
import { TripCard } from "@/components/trip-card";
import { useTrips } from "@/features/trips/hooks/use-trips";
import { useCreateTrip } from "@/features/trips/hooks/use-create-trip";
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
import {
  Sparkles,
  Compass,
  Plus,
  Loader2,
  Users,
  KeyRound,
  AlertCircle,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [displayName, setDisplayName] = useState("");

  const { data: trips = [], isLoading, isError, error } = useTrips();
  const createTripMutation = useCreateTrip();

  async function handleCreateTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tripName.trim()) {
      toast.error("Vui lòng nhập tên chuyến đi.");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Vui lòng nhập tên hiển thị của bạn.");
      return;
    }

    try {
      const result = await createTripMutation.mutateAsync({
        name: tripName.trim(),
        displayName: displayName.trim(),
      });

      toast.success("Tạo chuyến đi thành công!");
      router.push(`/trips/${result.trip_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo chuyến.";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/40 via-background to-background">
      <Topbar subtitle="Đi cùng nhau, chia tiền rõ ràng." />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-bold text-teal-800 tracking-wide uppercase">
              <Sparkles className="size-3.5 text-teal-700" />
              Chuyến đi của bạn
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
              Lên kèo nhẹ nhàng.
              <br />
              <span className="text-teal-700">Chia tiền rõ ràng.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Tạo chuyến đi, gửi link vào nhóm và cùng nhau ghi nhận các khoản
              chi — không cần tải ứng dụng, không cần tài khoản ngân hàng liên kết.
            </p>
          </div>

          <div className="hidden md:flex size-16 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-700/20">
            <Compass className="size-8" />
          </div>
        </section>

        {/* Database setup notice if Supabase not configured or failed */}
        {isError && (
          <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <h3 className="font-bold text-base">Chưa kết nối Supabase</h3>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  {error instanceof Error ? error.message : "Vui lòng kiểm tra lại cấu hình."}
                </p>
                <p className="mt-2 text-xs text-amber-700">
                  Hãy điền <code>NEXT_PUBLIC_SUPABASE_URL</code> và <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> trong <code>.env.local</code>, bật Anonymous Sign-ins trong Supabase Dashboard và áp dụng migration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main 2-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Recent Trips Column */}
          <div className="md:col-span-7">
            <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-bold">Chuyến gần đây</CardTitle>
                  <CardDescription className="text-xs">
                    Những chuyến bạn đang tham gia
                  </CardDescription>
                </div>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  {trips.length} chuyến
                </span>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin text-teal-700" />
                    <p className="mt-2 text-xs">Đang tải danh sách chuyến...</p>
                  </div>
                ) : trips.length > 0 ? (
                  <div className="space-y-3">
                    {trips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-12 text-center">
                    <Users className="mx-auto size-8 text-muted-foreground/60" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Bạn chưa có chuyến nào
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tạo chuyến đầu tiên bên cạnh hoặc nhập mã mời từ bạn bè nhé.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Create Trip Form Column */}
          <div className="md:col-span-5 space-y-6">
            <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Bắt đầu chuyến mới</CardTitle>
                <CardDescription className="text-xs">
                  Chỉ cần tên chuyến và tên hiển thị của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTrip} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="trip-name" className="text-xs font-semibold">
                      Tên chuyến đi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="trip-name"
                      maxLength={80}
                      required
                      placeholder="Ví dụ: Đà Lạt săn mây cuối tuần"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="organizer-name" className="text-xs font-semibold">
                      Tên của bạn <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="organizer-name"
                      maxLength={30}
                      required
                      placeholder="Ví dụ: Minh Anh"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createTripMutation.isPending}
                    className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white font-semibold transition-all shadow-sm"
                  >
                    {createTripMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Đang tạo chuyến...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 size-4" />
                        Tạo chuyến mới
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <p className="text-xs text-muted-foreground mb-2">
                    Bạn được bạn bè mời tham gia chuyến?
                  </p>
                  <Link
                    href="/join"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <KeyRound className="size-3.5 text-teal-700" />
                    Nhập mã mời tham gia →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        Tripmate · Kế hoạch chung, chi tiêu minh bạch.
      </footer>
    </div>
  );
}
