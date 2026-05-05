import { Pool } from "pg";

export default async function globalSetup() {
  const url =
    process.env.DATABASE_URL ?? "postgres://grocery:grocery@localhost:5432/grocery";
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query("TRUNCATE TABLE items");
  } finally {
    await pool.end();
  }
}
