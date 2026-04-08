import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Applying manual migration...');
  try {
    await sql.unsafe(`ALTER TABLE "users" ALTER COLUMN "auth_id" DROP NOT NULL;`);
    await sql.unsafe(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "external_id" varchar(255);`);
    await sql.unsafe(`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "external_source" varchar(50);`);
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
