import express from "express";

export default function tagRoutes(pool) {
  const router = express.Router();

  /*
  =========================
  ACTIVATE TAG
  =========================
  */

  router.post("/activate/:code", async (req, res) => {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({ message: "invalid_code" });
      }

      /* try both possible column names */
      let existing = await pool.query(
        "SELECT id,status FROM qr_tags WHERE code = $1",
        [code]
      );

      if (existing.rowCount === 0) {
        existing = await pool.query(
          "SELECT id,status FROM qr_tags WHERE qr_code = $1",
          [code]
        );
      }

      if (existing.rowCount === 0) {
        return res.status(404).json({ message: "qr_not_found" });
      }

      if (existing.rows[0].status === "active") {
        return res.status(400).json({ message: "already_activated" });
      }

      /* update tag */

      await pool.query(
        `
        UPDATE qr_tags
        SET
          status = 'activation_pending',
          activated_at = NOW(),
          expires_at = NOW() + interval '5 months'
        WHERE code = $1 OR qr_code = $1
        `,
        [code]
      );

      return res.json({ message: "tag_activated" });

    } catch (err) {
      console.error("ACTIVATION ERROR:", err);
      return res.status(500).json({ message: "activation_failed" });
    }
  });

  return router;
}