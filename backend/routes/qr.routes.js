import express from "express";

export default function qrRoutes(pool){

const router = express.Router();

/* ================= ACTIVATE QR ================= */

router.post("/:code/activate", async(req,res)=>{

const code=req.params.code;

try{

const result=await pool.query(
`SELECT status FROM qr_tags WHERE qr_code=$1`,
[code]
);

if(!result.rows.length){
return res.status(404).json({message:"QR not found"});
}

if(result.rows[0].status==="active"){
return res.json({message:"already_active"});
}

const update=await pool.query(
`
UPDATE qr_tags
SET
status='active',
activated_at=NOW(),
expires_at=NOW()+INTERVAL '5 months'
WHERE qr_code=$1
RETURNING *
`,
[code]
);

res.json(update.rows[0]);

}catch(err){

console.error(err);
res.status(500).json({message:"Activation failed"});

}

});

/* ================= QR STATUS ================= */

router.get("/:code", async(req,res)=>{

const code=req.params.code;

try{

const result=await pool.query(
`
SELECT
status,
expires_at
FROM qr_tags
WHERE qr_code=$1
`,
[code]
);

if(!result.rows.length){
return res.status(404).json({message:"QR not found"});
}

const qr=result.rows[0];

if(qr.expires_at && new Date(qr.expires_at)<new Date()){
return res.json({status:"expired"});
}

res.json(qr);

}catch(err){

console.error(err);
res.status(500).json({message:"Server error"});

}

});

return router;

}