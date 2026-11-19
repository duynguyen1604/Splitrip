import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { getPostgresPool } from "@/lib/postgres";

const authSecret = process.env.BETTER_AUTH_SECRET?.trim();
if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET must be configured in production.");
}

export const auth = betterAuth({
  appName: "Tripmate",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: authSecret || "tripmate-local-only-secret-not-for-deployment-00000000",
  database: getPostgresPool(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  plugins: [admin()],
});
