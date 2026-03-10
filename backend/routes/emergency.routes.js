import express from "express";

export default function emergencyRoutes(pool){

const router = express.Router();

router.get("/:code", async(req,res)=>{

try{

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
WHERE q.qr_code=$1
`,
[req.params.code]
);

if(!result.rows.length){
return res.status(404).json({message:"QR not found"});
}

const qr = result.rows[0];

const now = new Date();

/* inactive */

if(qr.status !== "active"){
return res.json({
status:"inactive"
});
}

/* expired */

if(qr.expires_at && new Date(qr.expires_at) < now){
return res.json({
status:"expired"
});
}

/* profile missing */

if(!qr.owner_mobile){
return res.status(404).json({
message:"Profile not found"
});
}

/* log scan */

await pool.query(
`
INSERT INTO emergency_logs
(qr_tag_id,action_type,caller_ip)
VALUES($1,'scan',$2)
`,
[qr.id,req.ip]
);

return res.json({

status:"active",

qr_code:qr.qr_code,

owner_name:qr.owner_name,
owner_mobile:qr.owner_mobile,

vehicle_number:qr.vehicle_number,
model:qr.model,

blood_group:qr.blood_group,
emergency_contact:qr.emergency_contact

});

}catch(err){

console.error("EMERGENCY ERROR:",err);

res.status(500).json({message:"Server error"});

}

});

return router;

}