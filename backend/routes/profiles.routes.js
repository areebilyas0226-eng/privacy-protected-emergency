import express from "express";

export default function profileRoutes(pool) {

const router = express.Router();

router.post("/:code", async (req, res) => {

const client = await pool.connect();

try {

const { code } = req.params;

const {
owner_name,
mobile,
vehicle_number,
blood_group,
emergency_contact
} = req.body;

/* validate input */

if (!owner_name || !mobile || !vehicle_number) {
return res.status(400).json({
message: "Missing required fields"
});
}

/* start transaction */

await client.query("BEGIN");

/* find QR tag */

const tagResult = await client.query(
`
SELECT id,status
FROM qr_tags
WHERE qr_code=$1
`,
[code]
);

if (!tagResult.rows.length) {

await client.query("ROLLBACK");

return res.status(404).json({
message: "QR tag not found"
});

}

const tag = tagResult.rows[0];

/* prevent double activation */

if (tag.status === "active") {

await client.query("ROLLBACK");

return res.status(400).json({
message: "already_activated"
});

}

/* create vehicle profile linked with tag */

await client.query(
`
INSERT INTO vehicle_profiles
(
qr_tag_id,
owner_name,
owner_mobile,
vehicle_number,
blood_group,
emergency_contact
)
VALUES ($1,$2,$3,$4,$5,$6)
`,
[
tag.id,
owner_name,
mobile,
vehicle_number,
blood_group,
emergency_contact
]
);

/* activate tag */

await client.query(
`
UPDATE qr_tags
SET
status='active',
activated_at = NOW()
WHERE id=$1
`,
[tag.id]
);

await client.query("COMMIT");

return res.json({
message: "Tag activated successfully"
});

} catch (err) {

await client.query("ROLLBACK");

console.error("PROFILE CREATE ERROR:", err);

return res.status(500).json({
message: "Server error"
});

} finally {

client.release();

}

});

return router;

}