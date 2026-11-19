"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldCheck, Users } from "lucide-react";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned?: boolean;
  banReason?: string | null;
};

export default function AdminPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const currentRole = (session?.user as { role?: string } | undefined)?.role;
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    enabled: currentRole === "admin",
    queryFn: async () => {
      const result = await authClient.admin.listUsers({ query: { limit: 100 } });
      if (result.error) throw new Error(result.error.message);
      return (result.data?.users ?? []) as ManagedUser[];
    },
  });
  const users = usersQuery.data ?? [];
  const loading = usersQuery.isPending || usersQuery.isFetching;
  const [workingUserId, setWorkingUserId] = useState<string | null>(null);

  async function loadUsers() {
    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  async function toggleBan(user: ManagedUser) {
    setWorkingUserId(user.id);
    try {
      const result = user.banned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({ userId: user.id, banReason: "Vi phạm quy định sử dụng." });
      if (result.error) throw new Error(result.error.message);
      toast.success(user.banned ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật tài khoản.");
    } finally {
      setWorkingUserId(null);
    }
  }

  async function toggleRole(user: ManagedUser) {
    setWorkingUserId(user.id);
    const nextRole = user.role === "admin" ? "user" : "admin";
    try {
      const result = await authClient.admin.setRole({ userId: user.id, role: nextRole });
      if (result.error) throw new Error(result.error.message);
      toast.success(nextRole === "admin" ? "Đã cấp quyền quản trị." : "Đã gỡ quyền quản trị.");
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật quyền.");
    } finally {
      setWorkingUserId(null);
    }
  }

  const topbar = <Topbar />;

  if (sessionPending) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        {topbar}
        <main className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-teal-700" /></main>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        {topbar}
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-xl font-bold">Đăng nhập để tiếp tục</h1>
          <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-teal-700">Đăng nhập →</Link>
        </main>
      </div>
    );
  }

  if (currentRole !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50/60">
        {topbar}
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <ShieldCheck className="mx-auto size-10 text-amber-600" />
          <h1 className="mt-3 text-xl font-bold">Bạn không có quyền quản trị</h1>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-teal-700">Về trang chủ →</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      {topbar}
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800"><Users className="size-5" /></span>
          <div>
            <h1 className="text-2xl font-black">Quản trị người dùng</h1>
            <p className="text-sm text-muted-foreground">Quản lý quyền hệ thống và trạng thái tài khoản.</p>
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Thành viên hệ thống</CardTitle>
            <CardDescription>{users.length} tài khoản đang hiển thị (tối đa 100).</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-teal-700" /></div>
            ) : users.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có tài khoản để hiển thị.</p>
            ) : (
              <div className="divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {user.role === "admin" ? "Quản trị viên" : "Người dùng"} · {user.banned ? "Đã khóa" : "Đang hoạt động"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={workingUserId === user.id || user.id === session.user.id} onClick={() => void toggleRole(user)}>
                        {user.role === "admin" ? "Gỡ quyền admin" : "Cấp quyền admin"}
                      </Button>
                      <Button size="sm" variant={user.banned ? "default" : "destructive"} disabled={workingUserId === user.id || user.id === session.user.id} onClick={() => void toggleBan(user)}>
                        {user.banned ? "Mở khóa" : "Khóa tài khoản"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
