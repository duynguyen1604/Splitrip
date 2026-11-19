import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createRequire } from "node:module";
import pg from "pg";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local first.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const client = await pool.connect();

try {
  await client.query("select pg_catalog.pg_advisory_lock(830417205)");
  await client.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const migrationDirectory = join(process.cwd(), "database", "migrations");
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort((a, b) => a.localeCompare(b, "en"));

  for (const name of migrationFiles) {
    const { rowCount } = await client.query(
      "select 1 from public.schema_migrations where name = $1",
      [name]
    );
    if (rowCount) {
      console.log(`skip ${name} (already applied)`);
      continue;
    }

    await client.query("begin");
    try {
      const migration = await readFile(join(migrationDirectory, name), "utf8");
      await client.query(migration);
      await client.query("insert into public.schema_migrations (name) values ($1)", [name]);
      await client.query("commit");
      console.log(`applied ${name}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
} finally {
  await client.query("select pg_catalog.pg_advisory_unlock(830417205)").catch(() => {});
  client.release();
  await pool.end();
}
