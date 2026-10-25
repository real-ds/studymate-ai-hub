import { neon } from "@neondatabase/serverless"

const sql = neon("postgresql://neondb_owner:npg_B9gSIejw2vZl@ep-proud-leaf-atokv40e-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require")

await sql`CREATE TABLE IF NOT EXISTS file_storage (
  id text PRIMARY KEY NOT NULL,
  data text NOT NULL,
  mime_type text NOT NULL
);`

console.log("OK")
process.exit(0)
