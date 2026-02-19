import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

// Test connection once
pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL");
    client.release();
  })
  .catch((err) => {
    console.error("Initial DB connection failed:", err);
  });

// DO NOT kill server on DB error
pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
});

export default pool;