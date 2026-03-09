import express from "express";

export default function emergencyRoutes(pool){

const router = express.Router();

/* =====================
EMERGENCY DATA
===================== */

router.get("/:code", async(req,res)=>{

const { code } = req.params;

try{

const qrResult = await pool.query(
`
SELECT id,status,expires_at,type,qr_code
FROM qr_tags
WHERE qr_code=$1
`,
[code]
);

if(!qrResult.rows.length){
return res.status(404).json({message:"QR not found"});
}

const qr = qrResult.rows[0];

/* 🚫 NOT ACTIVATED */

if(qr.status !== "active"){
return res.status(403).json({
message:"QR not activated"
});
}

/* ⛔ EXPIRED */

if(qr.expires_at && new Date(qr.expires_at) < new Date()){
return res.status(403).json({
status:"expired",
message:"Subscription expired"
});
}

let profile=null;

if(qr.type==="vehicle"){

const result = await pool.query(
`
SELECT vehicle_number,model,owner_mobile
FROM vehicle_profiles
WHERE qr_tag_id=$1
`,
[qr.id]
);

if(result.rows.length){
profile=result.rows[0];
}

}

if(!profile){
return res.status(404).json({message:"Profile not found"});
}

/* log scan */

await pool.query(
`
INSERT INTO emergency_logs(qr_tag_id,action_type,caller_ip)
VALUES($1,'scan',$2)
`,
[qr.id,req.ip]
);

return res.json({
qr_code: qr.qr_code,
vehicle_number: profile.vehicle_number,
model: profile.model,
owner_mobile: profile.owner_mobile
});

}catch(err){

console.error("EMERGENCY ERROR:",err);
res.status(500).json({message:"Server error"});

}

});

return router;

}