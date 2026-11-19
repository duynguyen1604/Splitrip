import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
const handlers = toNextJsHandler(auth);

function missingDatabaseResponse() {
  if (process.env.DATABASE_URL?.trim()) return null;
  return Response.json(
    { message: "Hãy điền DATABASE_URL vào .env.local để bật đăng nhập PostgreSQL." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: Request) {
  const configurationError = missingDatabaseResponse();
  return configurationError ?? handlers.GET(request);
}

export async function POST(request: Request) {
  const configurationError = missingDatabaseResponse();
  return configurationError ?? handlers.POST(request);
}
