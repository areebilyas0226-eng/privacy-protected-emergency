import express from "express";

export default function adminRoutes(pool) {

const router = express.Router();

/* =========================
INVENTORY
========================= */

router.get("/inventory", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT

        q.id AS tag_id,
        q.qr_code,
        q.status,
        q.type AS qr_type,
        q.plan_type,
        q.activated_at,
        q.expires_at,

        /* VEHICLE */
        vp.owner_name AS vehicle_owner_name,
        vp.owner_mobile AS vehicle_owner_mobile,
        vp.vehicle_number,

        /* PET */
        pp.owner_name AS pet_owner_name,
        pp.owner_mobile AS pet_owner_mobile,
        pp.pet_name,

        b.batch_name

      FROM qr_tags q

      LEFT JOIN vehicle_profiles vp
      ON q.id = vp.qr_tag_id

      LEFT JOIN pet_profiles pp
      ON q.id = pp.qr_tag_id

      LEFT JOIN qr_batches b
      ON q.order_id = b.id

      ORDER BY q.created_at DESC
      LIMIT 1000
    `);

    const formatted = result.rows.map(tag => {

      const owner_name =
        tag.vehicle_owner_name ||
        tag.pet_owner_name ||
        null;

      const owner_mobile =
        tag.vehicle_owner_mobile ||
        tag.pet_owner_mobile ||
        null;

      return {
        tag_id: tag.tag_id,
        qr_code: tag.qr_code,
        status: tag.status,
        qr_type: tag.qr_type,
        plan_type: tag.plan_type,
        activated_at: tag.activated_at,
        expires_at: tag.expires_at,
        owner_name,
        owner_mobile,
        vehicle_number: tag.vehicle_number || null,
        pet_name: tag.pet_name || null,
        batch_name: tag.batch_name
      };

    });

    res.json(formatted);

  } catch (err) {

    console.error("Inventory error:", err);

    res.status(500).json({
      message: "Failed to fetch inventory"
    });

  }

});

/* =========================
ADMIN TEST
========================= */

router.get("/test",(req,res)=>{
res.json({message:"Admin routes working"});
});

return router;

}