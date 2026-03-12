import express from "express";

export default function tagRoutes(pool){

const router = express.Router();

/* =====================
ACTIVATE TAG
===================== */

router.post("/activate/:code", async(req,res)=>{

try{

const { code } = req.params;

const tag = await pool.query(
`SELECT id,status,type FROM qr_tags WHERE qr_code=$1`,
[code]
);

if(tag.rowCount === 0){
return res.status(404).json({message:"qr_not_found"});
}

if(tag.rows[0].status !== "inactive"){
return res.status(400).json({message:"already_activated"});
}

await pool.query(
`
UPDATE qr_tags
SET
status='active',
activated_at=NOW(),
expires_at=NOW()+ interval '5 months'
WHERE qr_code=$1
`,
[code]
);

return res.json({
message:"tag_activated",
type:tag.rows[0].type
});

}catch(err){

console.error("TAG ACTIVATION ERROR:",err);

res.status(500).json({
message:"activation_failed"
});

}

});

return router;

}