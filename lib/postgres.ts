import { Pool, type PoolClient, type QueryResultRow } from "pg";

type GlobalPool = typeof globalThis & { __tripmatePgPool?: Pool };

function getPool(requireConnection = true) {
  const connectionString = process.env.DATABASE_URL;
  if (requireConnection && !connectionString) {
    throw new Error("Thiếu DATABASE_URL trong .env.local để kết nối PostgreSQL.");
  }

  const globalPool = globalThis as GlobalPool;
  globalPool.__tripmatePgPool ??= new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return globalPool.__tripmatePgPool;
}

export function getPostgresPool() {
  return getPool(false);
}

export const postgres = {
  query<R extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) {
    return getPool(true).query<R>(text, values);
  },
  connect() {
    return getPool(true).connect();
  },
};

export async function withUserTransaction<T>(
  userId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await postgres.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_catalog.set_config('app.user_id', $1, true)", [
      userId,
    ]);
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function safeDatabaseError(error: unknown) {
  if (!(error instanceof Error)) return "Không thể xử lý yêu cầu PostgreSQL.";

  const databaseError = error as Error & { code?: string };
  if (error.message.startsWith("Thiếu DATABASE_URL")) return error.message;
  if (databaseError.code === "P0001" || databaseError.code?.startsWith("22")) {
    return error.message;
  }
  return "Không thể kết nối PostgreSQL. Hãy kiểm tra DATABASE_URL và trạng thái database.";
}
