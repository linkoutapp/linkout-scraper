import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Add verified column (default false)
  await sql`ALTER TABLE signups ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false`;
  // Add verification_token column
  await sql`ALTER TABLE signups ADD COLUMN IF NOT EXISTS verification_token TEXT`;
  
  console.log('Done: added verified + verification_token columns to signups');
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
