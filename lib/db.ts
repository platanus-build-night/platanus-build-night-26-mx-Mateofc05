// Drizzle + node-postgres client. Pooled singleton via globalThis so Next dev
// hot-reloads don't open a new pool on every reload.

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/schema";

const globalForDb = globalThis as unknown as {
  __lineupPool?: Pool;
};

function getPool(): Pool {
  if (!globalForDb.__lineupPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env (see .env.example).",
      );
    }
    globalForDb.__lineupPool = new Pool({ connectionString });
  }
  return globalForDb.__lineupPool;
}

export const db = drizzle(getPool(), { schema });

export { schema };
