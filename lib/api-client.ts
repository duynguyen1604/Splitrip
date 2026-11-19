import { authClient } from "@/lib/auth-client";

export async function ensureAuthenticatedUser() {
  const { data, error } = await authClient.getSession();
  if (error) throw new Error(error.message);
  if (!data?.user) throw new Error("Hãy đăng nhập để tiếp tục.");
  return { userId: data.user.id };
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Yêu cầu không thành công.");
  }
  return payload.data as T;
}

export function callRpc<T>(name: string, args: Record<string, unknown>) {
  return apiRequest<T>("/api/rpc", {
    method: "POST",
    body: JSON.stringify({ name, args }),
  });
}
