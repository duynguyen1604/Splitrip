import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  const isLocalHost = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);

  if (process.env.NODE_ENV !== "development" || !isLocalHost) {
    return new Response(null, { status: 404 });
  }

  const accounts = [
    {
      label: "Quản trị viên",
      email: process.env.DEMO_ADMIN_EMAIL,
      password: process.env.DEMO_ADMIN_PASSWORD,
    },
    {
      label: "Người dùng",
      email: process.env.DEMO_USER_EMAIL,
      password: process.env.DEMO_USER_PASSWORD,
    },
  ].filter(
    (account): account is { label: string; email: string; password: string } =>
      Boolean(account.email && account.password)
  );

  return NextResponse.json(
    { accounts },
    { headers: { "Cache-Control": "no-store, private" } }
  );
}
