import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

declare global {
  var __bettermailerSqlClient: ReturnType<typeof postgres> | undefined;
  var __bettermailerDrizzleDb:
    | ReturnType<typeof drizzle>
    | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL. Add it to your local environment before using database-backed auth."
    );
  }

  return databaseUrl;
}

function createDb() {
  const sql =
    globalThis.__bettermailerSqlClient ??
    postgres(getDatabaseUrl(), {
      max: 1,
    });

  const database = globalThis.__bettermailerDrizzleDb ?? drizzle(sql);

  if (process.env.NODE_ENV !== "production") {
    globalThis.__bettermailerSqlClient = sql;
    globalThis.__bettermailerDrizzleDb = database;
  }

  return database;
}

export function getDb() {
  return createDb();
}

export const db = getDb();
