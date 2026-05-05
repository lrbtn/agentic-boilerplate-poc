import { Pool } from "pg";

const DEFAULT_URL = "postgres://grocery:grocery@localhost:5432/grocery";

export async function resetDb(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? DEFAULT_URL });
  try {
    await pool.query("TRUNCATE TABLE items");
  } finally {
    await pool.end();
  }
}
