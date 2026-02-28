import express from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool) {
  const router = express.Router();

  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.JWT_SECRET
  ) {
    throw new Error("Missing required admin environment variables");
  }

  /* ===============================
     LOGIN
  =============================== */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      if (
        email.trim().toLowerCase() !==
        process.env.ADMIN_EMAIL.trim().toLowerCase()
      ) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

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
          process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000
      });

      res.json({ message: "Login successful" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  /* ===============================
     PROTECT BELOW
  =============================== */
  router.use(adminAuth);

  /* ===============================
     CREATE ORDER  ✅ FIX
  =============================== */
  router.post("/orders", async (req, res) => {
    const { customer_name, mobile, quantity } = req.body;

    if (!customer_name || !mobile || !quantity) {
      return res.status(400).json({
        message: "customer_name, mobile, quantity required"
      });
    }

    if (!Number.isInteger(Number(quantity)) || quantity < 1 || quantity > 100) {
      return res.status(400).json({
        message: "Valid quantity required (1–100)"
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `
        INSERT INTO tag_orders (customer_name, mobile, quantity, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *
        `,
        [customer_name, mobile, quantity]
      );

      await client.query("COMMIT");

      res.json({
        message: "Order created",
        data: orderResult.rows[0]
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Order error:", err);
      res.status(500).json({ message: "Order creation failed" });
    } finally {
      client.release();
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
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  /* ===============================
     BATCHES
  =============================== */
  router.get("/batches", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM qr_batches ORDER BY created_at DESC`
      );
      res.json({ data: result.rows });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch batches" });
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
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  return router;
}