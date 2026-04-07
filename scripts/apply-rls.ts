import { db } from "../src/db";
import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function applyRLS() {
  console.log("Applying RLS policies...");
  
  const sqlFilePath = path.join(__dirname, "../supabase/migrations/rls_policies.sql");
  const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

  try {
    // Split combined SQL if needed, but drizzle-orm can often run raw strings if they are single statements.
    // For safety with multiple statements, we can run them one by one if necessary.
    const statements = sqlContent
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await db.execute(sql.raw(statement));
    }

    console.log("RLS policies applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to apply RLS policies:", error);
    process.exit(1);
  }
}

applyRLS();
