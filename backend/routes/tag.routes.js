import express from "express";

export default function tagRoutes(pool){

const router = express.Router();

/* activate tag */

router.post("/activate/:code", async(req,res)=>{

try{

const { code } = req.params;

await pool.query(
`
UPDATE qr_tags
SET
status='activation_pending',
activated_at = NOW(),
expires_at = NOW() + interval '5 months'
WHERE qr_code=$1
`,
[code]
);

res.json({message:"tag_activated"});

}catch(err){

console.error(err);
res.status(500).json({message:"activation_failed"});

}

});

/* resolve qr */

router.get("/qr/:code", async(req,res)=>{

try{

const { code } = req.params;

const result = await pool.query(
`
SELECT *
FROM qr_tags
WHERE qr_code=$1
`,
[code]
);

if(result.rows.length===0){
return res.status(404).json({message:"not_found"});
}

res.json(result.rows[0]);

}catch(err){

console.error(err);
res.status(500).json({message:"qr_failed"});

}

});

return router;

}