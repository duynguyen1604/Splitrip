"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2, LogIn, UserPlus } from "lucide-react";

type DemoAccount = {
  label: string;
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: demoAccounts = [] } = useQuery({
    queryKey: ["local-demo-accounts"],
    enabled: process.env.NODE_ENV === "development",
    queryFn: async () => {
      const response = await fetch("/api/dev/demo-accounts", { cache: "no-store" });
      if (!response.ok) return [] as DemoAccount[];
      const result = (await response.json()) as { accounts: DemoAccount[] };
      return result.accounts;
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
          : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) throw new Error(result.error.message);
      toast.success(mode === "sign-up" ? "Tạo tài khoản thành công." : "Đăng nhập thành công.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đăng nhập.");
    } finally {
      setSubmitting(false);
    }
  }

  if (session.data?.user) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        <Topbar />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-bold">Bạn đã đăng nhập</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tiếp tục lập kế hoạch chuyến đi cùng nhóm.</p>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-teal-700">Về trang chủ</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Topbar />
      <main className="mx-auto flex w-full max-w-md px-4 py-10 sm:py-16">
        <section className="w-full rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Tripmate</p>
            <h1 className="mt-2 text-2xl font-black">
              {mode === "sign-up" ? "Tạo tài khoản" : "Chào mừng trở lại"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lưu chuyến đi và tiếp tục trên các thiết bị của bạn.
            </p>
            {session.error && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                {session.error.message}
              </p>
            )}
          </div>

          {demoAccounts.length > 0 && (
            <section className="mb-5 rounded-xl border border-dashed border-teal-300 bg-teal-50/70 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-teal-950">Tài khoản xem thử</p>
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                  Local
                </span>
              </div>
              <p className="mt-1 text-[11px] text-teal-900/70">
                Chỉ hiển thị trên localhost khi chạy môi trường phát triển.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => {
                      setMode("sign-in");
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="rounded-lg border border-teal-200 bg-white p-3 text-left transition hover:border-teal-500 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <span className="block text-xs font-bold text-slate-900">
                      {account.label}
                    </span>
                    <span className="mt-1 block break-all font-mono text-[10px] text-slate-600">
                      {account.email}
                    </span>
                    <span className="mt-0.5 block break-all font-mono text-[10px] text-slate-600">
                      {account.password}
                    </span>
                    <span className="mt-2 block text-[10px] font-bold text-teal-800">
                      Nhấn để tự điền
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "sign-up" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Tên hiển thị</Label>
                <Input id="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting || session.isPending} className="w-full bg-teal-700 text-white hover:bg-teal-800">
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : mode === "sign-up" ? <UserPlus className="mr-2 size-4" /> : <LogIn className="mr-2 size-4" />}
              {mode === "sign-up" ? "Tạo tài khoản" : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "sign-up" ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <button
              type="button"
              className="font-semibold text-teal-700 hover:underline"
              onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
            >
              {mode === "sign-up" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
