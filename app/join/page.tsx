"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/topbar";
import { useJoinTrip } from "@/features/trips/hooks/use-join-trip";
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
import { ArrowLeft, KeyRound, Loader2, Users } from "lucide-react";

function JoinForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState((params.get("code") ?? "").toUpperCase());
  const [displayName, setDisplayName] = useState("");

  const joinTripMutation = useJoinTrip();

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!code.trim()) {
      toast.error("Vui lòng nhập mã mời.");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Vui lòng nhập tên hiển thị.");
      return;
    }

    try {
      const result = await joinTripMutation.mutateAsync({
        code: code.trim(),
        displayName: displayName.trim(),
      });

      toast.success("Tham gia chuyến đi thành công!");
      router.push(`/trips/${result.trip_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tham gia chuyến đi.";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/40 via-background to-background">
      <Topbar subtitle="Bạn được mời đi cùng một chuyến." />

      <main className="flex-1 mx-auto w-full max-w-md px-4 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mb-6 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Về trang chủ
        </Link>

        <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-teal-100/80 text-teal-800 mb-2">
              <Users className="size-6 text-teal-700" />
            </div>
            <CardTitle className="text-xl font-bold">Tham gia chuyến</CardTitle>
            <CardDescription className="text-xs">
              Nhập mã trong lời mời và tên của bạn để cả nhóm cùng nhận diện.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-code" className="text-xs font-semibold">
                  Mã mời <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="invite-code"
                    autoCapitalize="characters"
                    minLength={6}
                    maxLength={24}
                    required
                    placeholder="Ví dụ: A1B2C3D4E5F6"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="h-10 uppercase tracking-wider font-mono text-center text-base"
                  />
                  <KeyRound className="absolute right-3 top-2.5 size-5 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="display-name" className="text-xs font-semibold">
                  Tên hiển thị của bạn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="display-name"
                  maxLength={30}
                  minLength={1}
                  required
                  placeholder="Bạn muốn cả nhóm gọi là gì?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={joinTripMutation.isPending}
                className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white font-semibold transition-all shadow-sm"
              >
                {joinTripMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang vào nhóm...
                  </>
                ) : (
                  "Vào nhóm ngay"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        Tripmate · Kế hoạch chung, chi tiêu minh bạch.
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-teal-700" />
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
