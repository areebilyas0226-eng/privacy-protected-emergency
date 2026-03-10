import express from "express";

export default function qrRoutes(pool){

const router = express.Router();

/* ================= QR STATUS ================= */

router.get("/:code", async(req,res)=>{

const code=req.params.code;

try{

const result=await pool.query(
`
SELECT status, expires_at
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

return res.json({
status:qr.status
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Server error"
});

}

});

return router;

}