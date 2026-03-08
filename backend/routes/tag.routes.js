router.post("/activate/:code", async (req,res)=>{

try{

const { code } = req.params;

if(!code){
return res.status(400).json({
message:"invalid_qr_code"
});
}

/* check tag */

const tag = await pool.query(
`SELECT id,status FROM qr_tags WHERE qr_code=$1`,
[code]
);

if(tag.rowCount === 0){
return res.status(404).json({
message:"qr_not_found"
});
}

if(tag.rows[0].status !== "inactive"){
return res.status(400).json({
message:"tag_already_activated"
});
}

/* activate */

await pool.query(`
UPDATE qr_tags
SET
status='activation_pending',
activated_at = NOW(),
expires_at = NOW() + interval '5 months'
WHERE qr_code=$1
`,[code]);

res.json({
message:"tag_activated"
});

}catch(err){

console.error("Activation error:",err);

res.status(500).json({
message:"activation_failed"
});

}

});