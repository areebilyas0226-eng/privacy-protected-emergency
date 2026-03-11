import express from "express";

export default function emergencyRoutes(pool) {

const router = express.Router();

router.get("/:code", async (req, res) => {

try {

const code = req.params.code?.trim();

if (!code) {
return res.status(400).json({
status: "invalid_qr"
});
}

/* ======================
FETCH QR + PROFILE
====================== */

const result = await pool.query(
`
SELECT
q.id,
q.status,
q.expires_at,
q.qr_code,

p.owner_name,
p.owner_mobile,
p.vehicle_number,
p.model,
p.blood_group,
p.emergency_contact

FROM qr_tags q
LEFT JOIN vehicle_profiles p
ON q.id = p.qr_tag_id

WHERE q.qr_code = $1
`,
[code]
);

/* ======================
QR NOT FOUND
====================== */

if (!result.rows.length) {
return res.json({
status: "not_found"
});
}

const qr = result.rows[0];
const now = new Date();

/* ======================
TAG NOT ACTIVE
====================== */

if (qr.status !== "active") {
return res.json({
status: "inactive"
});
}

/* ======================
SUBSCRIPTION EXPIRED
====================== */

if (qr.expires_at && new Date(qr.expires_at) < now) {
return res.json({
status: "expired"
});
}

/* ======================
PROFILE NOT CREATED
====================== */

if (!qr.owner_mobile) {
return res.json({
status: "profile_missing"
});
}

/* ======================
LOG EMERGENCY SCAN
====================== */

try {

await pool.query(
`
INSERT INTO emergency_logs
(qr_tag_id, action_type, caller_ip)
VALUES ($1,'scan',$2)
`,
[qr.id, req.ip]
);

} catch (logErr) {

console.error("Emergency log failed:", logErr);

}

/* ======================
SUCCESS RESPONSE
====================== */

return res.json({

status: "active",

qr_code: qr.qr_code,

owner: {
name: qr.owner_name || "",
mobile: qr.owner_mobile || "",
emergency_contact: qr.emergency_contact || ""
},

vehicle: {
number: qr.vehicle_number || "",
model: qr.model || ""
},

medical: {
blood_group: qr.blood_group || ""
},

emergency_numbers: {
ambulance: "108",
police: "100",
fire: "101"
}

});

} catch (err) {

console.error("EMERGENCY ERROR:", err);

return res.status(500).json({
status: "server_error"
});

}

});

return router;

}