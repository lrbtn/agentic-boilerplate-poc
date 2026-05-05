import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export type AppDatabase = NodePgDatabase<typeof schema>;

const DEFAULT_URL = "postgres://grocery:grocery@localhost:5432/grocery";

export function createPool(databaseUrl: string = process.env.DATABASE_URL ?? DEFAULT_URL): Pool {
  return new Pool({ connectionString: databaseUrl });
}

export function createDb(pool: Pool): AppDatabase {
  return drizzle(pool, { schema });
}
