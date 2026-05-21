import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "mysql://root:@localhost:3306/mskpredict";

const pool = mysql.createPool(connectionString);

export const db = drizzle(pool, { schema, mode: "default" });

export async function healthCheck() {
  try {
    const [rows] = await pool.query<any[]>("SELECT NOW() AS now");
    return { healthy: true, timestamp: rows[0]?.now };
  } catch (error) {
    console.error("Database health check failed:", error);
    return { healthy: false, error: String(error) };
  }
}
