import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Hãy đăng nhập để tiếp tục.");
    this.name = "AuthenticationRequiredError";
  }
}

export async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function requireSessionUserId() {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthenticationRequiredError();
  return userId;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
