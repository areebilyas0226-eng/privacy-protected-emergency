router.post("/activate/:code", async(req,res)=>{

try{

const { code } = req.params;

const result = await pool.query(`
UPDATE qr_tags
SET
status='activation_pending',
activated_at = NOW(),
expires_at = NOW() + interval '5 months'
WHERE qr_code=$1
RETURNING id
`,[code]);

if(result.rowCount === 0){
return res.status(404).json({message:"qr_not_found"});
}

res.json({message:"tag_activated"});

}catch(err){

console.error(err);
res.status(500).json({message:"activation_failed"});

}

});