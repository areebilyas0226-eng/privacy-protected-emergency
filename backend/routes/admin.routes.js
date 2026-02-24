import express from "express";
import { v4 as uuidv4 } from "uuid";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool) {
  const router = express.Router();

  router.use(adminAuth);

  /* ===============================
     1️⃣ GENERATE QR BATCH
  =============================== */
  router.post("/generate-batch", async (req, res) => {
    const quantity = parseInt(req.body.quantity);
    const batch_name = req.body.batch_name || `Batch-${Date.now()}`;
    const agent_name = req.body.agent_name || null;

    if (!quantity || quantity < 1 || quantity > 5000) {
      return res.status(400).json({
        message: "Valid quantity required (1–5000)"
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Create batch record
      const batchResult = await client.query(
        `
        INSERT INTO qr_batches (batch_name, agent_name, quantity)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [batch_name, agent_name, quantity]
      );

      const batch = batchResult.rows[0];

      // 2. Insert QR codes
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

      return res.json({
        message: "Batch generated",
        data: batch
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      return res.status(500).json({ message: "Batch generation failed" });
    } finally {
      client.release();
    }
  });

  /* ===============================
     2️⃣ LIST BATCHES  (FIXED)
  =============================== */
  router.get("/batches", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT *
        FROM qr_batches
        ORDER BY created_at DESC
      `);

      return res.json({
        data: result.rows
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  /* ===============================
     3️⃣ LIST ORDERS
  =============================== */
  router.get("/orders", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM tag_orders ORDER BY created_at DESC`
      );

      return res.json({ data: result.rows });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  /* ===============================
     4️⃣ INVENTORY VIEW
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

      return res.json({ data: result.rows });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  return router;
}