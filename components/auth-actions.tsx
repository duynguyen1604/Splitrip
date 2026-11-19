"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AuthActions() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  if (isPending) return null;
  if (!data?.user) {
    return (
      <Link
        href="/login"
        className="text-xs font-semibold text-teal-700 hover:text-teal-800"
      >
        Đăng nhập
      </Link>
    );
  }

  const role = (data.user as typeof data.user & { role?: string }).role;

  async function handleSignOut() {
    const result = await authClient.signOut();
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    router.replace("/login");
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {role === "admin" && (
        <Link
          href="/admin"
          className="text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          Quản trị
        </Link>
      )}
      <span className="hidden max-w-32 truncate text-xs text-muted-foreground sm:inline">
        {data.user.name}
      </span>
      <Button variant="outline" size="sm" onClick={handleSignOut} className="h-8 text-xs">
        Đăng xuất
      </Button>
    </div>
  );
}
