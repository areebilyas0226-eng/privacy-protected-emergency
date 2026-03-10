import express from "express";

export default function qrRoutes(pool){

const router = express.Router();

router.get("/:code", async(req,res)=>{

try{

const result = await pool.query(
`
SELECT status, expires_at
FROM qr_tags
WHERE qr_code=$1
`,
[req.params.code]
);

if(!result.rows.length){
return res.status(404).json({message:"QR not found"});
}

const qr = result.rows[0];

const now = new Date();

if(qr.expires_at){

const expiry = new Date(qr.expires_at);

/* expired */

if(expiry < now){
return res.json({
status:"expired",
expires_at:expiry
});
}

/* expiry warning */

const diffDays =
(expiry.getTime() - now.getTime()) / (1000*60*60*24);

const warning = diffDays <= 7;

return res.json({
status:qr.status,
expires_at:expiry,
warning
});

}

return res.json({
status:qr.status,
expires_at:null,
warning:false
});

}catch(err){

console.error("QR STATUS ERROR:",err);

res.status(500).json({message:"Server error"});

}

});

return router;

}