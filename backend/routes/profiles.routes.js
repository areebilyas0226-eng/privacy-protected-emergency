export default (pool) => {
  const router = express.Router();

  router.get("/:type/:qrId", async (req, res) => {
    const { type, qrId } = req.params;

    if (!["vehicle", "pet"].includes(type)) {
      return res.status(400).json({ error: "Invalid profile type" });
    }

    const table =
      type === "vehicle" ? "vehicle_profiles" : "pet_profiles";

    try {
      const result = await pool.query(
        `SELECT * FROM ${table} WHERE qr_id = $1`,
        [qrId]
      );

      if (!result.rows.length) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
};