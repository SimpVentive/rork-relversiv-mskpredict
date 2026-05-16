import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://localhost:5432/mskpredict";

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

export async function healthCheck() {
  try {
    const result = await pool.query("SELECT NOW()");
    return { healthy: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error("Database health check failed:", error);
    return { healthy: false, error: String(error) };
  }
}
