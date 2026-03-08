import express from "express";

export default function profileRoutes(pool) {

const router = express.Router();

/* =========================================
CREATE VEHICLE PROFILE (REGISTRATION)
POST /api/profile/:qrCode
========================================= */

router.post("/:qrCode", async (req, res) => {

try {

const { qrCode } = req.params;

const {
owner_name,
mobile,
vehicle_name,
vehicle_number,
blood_group,
family_contact
} = req.body;

/* find QR tag */

const qrResult = await pool.query(
`SELECT id FROM qr_tags WHERE qr_code=$1 LIMIT 1`,
[qrCode]
);

if (qrResult.rowCount === 0) {
return res.status(404).json({ message: "QR not found" });
}

const qrTagId = qrResult.rows[0].id;

/* check existing profile */

const exists = await pool.query(
`SELECT id FROM vehicle_profiles WHERE qr_tag_id=$1 LIMIT 1`,
[qrTagId]
);

if (exists.rowCount > 0) {
return res.status(400).json({ message: "Profile already exists" });
}

/* insert vehicle profile */

await pool.query(
`
INSERT INTO vehicle_profiles
(
qr_tag_id,
owner_name,
owner_mobile,
vehicle_number,
model,
blood_group,
family_contact
)
VALUES ($1,$2,$3,$4,$5,$6,$7)
`,
[
qrTagId,
owner_name,
mobile,
vehicle_number,
vehicle_name,
blood_group,
family_contact
]
);

return res.json({
message: "profile_created"
});

} catch (error) {

console.error("PROFILE CREATE ERROR:", error);

return res.status(500).json({
message: "Server error"
});

}

});

/* =========================================
GET PROFILE BY QR
GET /api/profile/:type/:qrCode
========================================= */

router.get("/:type/:qrCode", async (req, res) => {

try {

const { type, qrCode } = req.params;

if (!["vehicle", "pet"].includes(type)) {
return res.status(400).json({ message: "Invalid profile type" });
}

const qrResult = await pool.query(
`SELECT id FROM qr_tags WHERE qr_code=$1 LIMIT 1`,
[qrCode]
);

if (qrResult.rowCount === 0) {
return res.status(404).json({ message: "QR not found" });
}

const qrTagId = qrResult.rows[0].id;

const table = type === "vehicle"
? "vehicle_profiles"
: "pet_profiles";

const result = await pool.query(
`SELECT * FROM ${table} WHERE qr_tag_id=$1 LIMIT 1`,
[qrTagId]
);

if (result.rowCount === 0) {
return res.status(404).json({
message: "Profile not found"
});
}

return res.json(result.rows[0]);

} catch (error) {

console.error("PROFILE FETCH ERROR:", error);

return res.status(500).json({
message: "Server error"
});

}

});

return router;

}