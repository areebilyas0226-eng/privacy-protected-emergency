import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL.trim();

/*
  Remove unsupported Neon params like channel_binding
*/
const sanitizedUrl = connectionString.replace(
  /&?channel_binding=require/g,
  ""
);

const pool = new Pool({
  connectionString: sanitizedUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on("connect", () => {
  console.log("Postgres pool connected");
});

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
  process.exit(1);
});

export default pool;