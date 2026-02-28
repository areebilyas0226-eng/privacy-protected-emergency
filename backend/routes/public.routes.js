import express from "express";

export default function publicRoutes(pool) {
  const router = express.Router();

  /* ===============================
     QR ENTRY POINT
  =============================== */
  router.get("/q/:code", async (req, res) => {
    const { code } = req.params;

    try {
      const result = await pool.query(
        `SELECT * FROM qr_tags WHERE qr_code = $1`,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).send("QR not found");
      }

      const qr = result.rows[0];

      // Not activated yet
      if (qr.status === "inactive") {
        return res.redirect(`/activate/${code}`);
      }

      // Subscription expired
      if (
        qr.subscription_expires_at &&
        new Date(qr.subscription_expires_at) < new Date()
      ) {
        return res.redirect(`/subscribe/${code}`);
      }

      // Valid subscription
      return res.redirect(`/emergency/${code}`);

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  return router;
}