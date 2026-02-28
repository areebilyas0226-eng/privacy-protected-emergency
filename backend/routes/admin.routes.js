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

      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      if (
        email.trim().toLowerCase() !==
        process.env.ADMIN_EMAIL.trim().toLowerCase()
      )
        return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH
      );

      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000
      });

      res.json({ message: "Login successful" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  router.use(adminAuth);

  /* ===============================
     CREATE ORDER
  =============================== */
  router.post("/orders", async (req, res) => {
    const { customer_name, mobile, quantity } = req.body;
    const qty = Number(quantity);

    if (!customer_name || !mobile || !qty)
      return res.status(400).json({ message: "All fields required" });

    if (!Number.isInteger(qty) || qty < 1 || qty > 100)
      return res.status(400).json({ message: "Invalid quantity (1–100)" });

    try {
      const result = await pool.query(
        `INSERT INTO tag_orders
        (customer_name, mobile, quantity_ordered, quantity_fulfilled, status)
        VALUES ($1,$2,$3,0,'pending')
        RETURNING *`,
        [customer_name.trim(), mobile.trim(), qty]
      );

      res.json({ data: result.rows[0] });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Order creation failed" });
    }
  });

  /* ===============================
     GENERATE QR BATCH
  =============================== */
  router.post("/generate-batch", async (req, res) => {
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1)
      return res.status(400).json({ message: "Invalid quantity" });

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `SELECT * FROM tag_orders
         WHERE status='pending'
         ORDER BY created_at ASC
         LIMIT 1`
      );

      if (orderResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "No pending orders. Create order first."
        });
      }

      const order = orderResult.rows[0];
      const remaining =
        order.quantity_ordered - order.quantity_fulfilled;

      if (qty > remaining) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Only ${remaining} QR allowed for this order`
        });
      }

      // Create batch record
      const batchResult = await client.query(
        `INSERT INTO qr_batches (batch_name, quantity)
         VALUES ($1, $2)
         RETURNING *`,
        [`Batch-${Date.now()}`, qty]
      );

      const batchId = batchResult.rows[0].id;

      // Generate QR tags
      for (let i = 0; i < qty; i++) {
        await client.query(
          `INSERT INTO qr_tags
          (qr_code, status, type, batch_id)
          VALUES ($1,'inactive','vehicle',$2)`,
          [uuidv4(), batchId]
        );
      }

      // Update order fulfillment
      await client.query(
        `UPDATE tag_orders
         SET quantity_fulfilled = quantity_fulfilled + $1,
             status = CASE
               WHEN quantity_fulfilled + $1 >= quantity_ordered
               THEN 'completed'
               ELSE 'pending'
             END
         WHERE id=$2`,
        [qty, order.id]
      );

      await client.query("COMMIT");

      res.json({ message: "QR batch generated successfully" });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res.status(500).json({ message: "Batch generation failed" });
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
    } catch {
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
    } catch {
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

    } catch {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  return router;
}