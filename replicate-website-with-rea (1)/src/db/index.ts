import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Works with the local Postgres AND with Supabase.
 * For Supabase just set DATABASE_URL to the connection string from
 * Project Settings → Database (use the "Transaction pooler" string on serverless hosts).
 * SSL is enabled automatically for any non-local host.
 */
function buildConfig(url: string) {
  const u = new URL(url);
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(u.hostname);
  // `sslmode` in the URL would override our ssl option inside node-postgres, so strip it.
  u.searchParams.delete("sslmode");
  const useSsl = process.env.DATABASE_SSL ? process.env.DATABASE_SSL !== "false" : !isLocal;
  return {
    connectionString: u.toString(),
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.DATABASE_POOL_MAX ?? (isLocal ? 10 : 5)),
  };
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new Pool(buildConfig(databaseUrl));

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
