import express from "express";

export default function publicRoutes(pool) {
  const router = express.Router();

  /* ===============================
     COMMON QR VALIDATION
  =============================== */
  async function getQR(code) {
    const result = await pool.query(
      "SELECT * FROM qr_tags WHERE qr_code = $1",
      [code]
    );
    return result.rows[0] || null;
  }

  /* ===============================
     QR SCAN ENTRY
     Sticker QR should point here:
     https://yourdomain.com/q/<qr_code>
  =============================== */
  router.get("/q/:code", async (req, res) => {
    const { code } = req.params;

    try {
      const qr = await getQR(code);

      if (!qr) {
        return res.status(404).send("QR not found");
      }

      if (qr.status === "inactive") {
        return res.redirect(`/activate/${code}`);
      }

      if (
        qr.subscription_expires_at &&
        new Date(qr.subscription_expires_at) < new Date()
      ) {
        return res.redirect(`/subscribe/${code}`);
      }

      return res.redirect(`/emergency/${code}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  /* ===============================
     ACTIVATE PAGE VALIDATION
  =============================== */
  router.get("/activate/:code", async (req, res) => {
    const { code } = req.params;

    try {
      const qr = await getQR(code);

      if (!qr) {
        return res.status(404).send("QR not found");
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/activate/${code}`
      );
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  /* ===============================
     SUBSCRIPTION PAGE
  =============================== */
  router.get("/subscribe/:code", async (req, res) => {
    const { code } = req.params;

    try {
      const qr = await getQR(code);

      if (!qr) {
        return res.status(404).send("QR not found");
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/subscribe/${code}`
      );
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  return router;
}