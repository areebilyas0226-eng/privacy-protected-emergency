import express from "express";
import adminAuth from "../middleware/adminAuth.js";

export default function inventoryRoutes(pool) {

const router = express.Router();

/* =========================
ADMIN INVENTORY
========================= */

router.get("/", adminAuth, async (req, res) => {

try {

const result = await pool.query(`
SELECT

q.id AS tag_id,
q.qr_code,
q.type AS qr_type,
q.status,
q.plan_type,
q.activated_at,
q.expires_at,

vp.owner_name,
vp.owner_mobile,
vp.vehicle_number,

b.batch_name

FROM qr_tags q

LEFT JOIN vehicle_profiles vp
ON q.id = vp.qr_tag_id

LEFT JOIN qr_batches b
ON q.order_id = b.id

ORDER BY q.created_at DESC
LIMIT 1000
`);

res.json(result.rows);

} catch (err) {

console.error("INVENTORY FETCH ERROR:", err);

res.status(500).json({
message: "Failed to fetch inventory"
});

}

});

return router;

}