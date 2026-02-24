import express from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool) {
  const router = express.Router();

  /* ===============================
     LOGIN (PUBLIC)
  =============================== */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password required" });
      }

      // Case-insensitive email check
      if (
        email.toLowerCase() !==
        process.env.ADMIN_EMAIL.toLowerCase()
      ) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare bcrypt hash
      const isMatch = await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH
      );

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
      });

      return res.json({ message: "Login successful" });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  /* Protect everything below */
  router.use(adminAuth);

  /* ===============================
     LOGOUT
  =============================== */
  router.post("/logout", (req, res) => {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax"
    });

    res.json({ message: "Logged out" });
  });

  /* ===============================
     GENERATE BATCH
  =============================== */
  router.post("/generate-batch", async (req, res) => {
    const quantity = parseInt(req.body.quantity);
    const batch_name =
      req.body.batch_name || `Batch-${Date.now()}`;
    const agent_name = req.body.agent_name || null;

    if (!quantity || quantity < 1 || quantity > 5000) {
      return res.status(400).json({
        message: "Valid quantity required (1–5000)"
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const batchResult = await client.query(
        `
        INSERT INTO qr_batches (batch_name, agent_name, quantity)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [batch_name, agent_name, quantity]
      );

      const batch = batchResult.rows[0];

      for (let i = 0; i < quantity; i++) {
        const qr_code = uuidv4().toUpperCase();

        await client.query(
          `
          INSERT INTO qr_tags 
          (qr_code, type, status, plan_type, price_paid, batch_id)
          VALUES ($1, 'vehicle', 'inactive', 'yearly', 0, $2)
          `,
          [qr_code, batch.id]
        );
      }

      await client.query("COMMIT");

      res.json({ message: "Batch generated", data: batch });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ message: "Batch generation failed" });
    } finally {
      client.release();
    }
  });

  /* ===============================
     LIST BATCHES
  =============================== */
  router.get("/batches", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM qr_batches ORDER BY created_at DESC`
      );
      res.json({ data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  /* ===============================
     LIST ORDERS
  =============================== */
  router.get("/orders", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM tag_orders ORDER BY created_at DESC`
      );
      res.json({ data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  /* ===============================
     INVENTORY
  =============================== */
  router.get("/inventory", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          q.qr_code,
          q.status,
          b.batch_name,
          q.created_at
        FROM qr_tags q
        LEFT JOIN qr_batches b
          ON q.batch_id = b.id
        ORDER BY q.created_at DESC
        LIMIT 500
      `);

      res.json({ data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  return router;
}