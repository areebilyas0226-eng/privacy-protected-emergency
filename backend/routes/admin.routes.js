router.get("/inventory", async (req,res)=>{

try{

const result = await pool.query(`
SELECT

q.id AS tag_id,
q.qr_code,
q.status,
q.type AS qr_type,
q.plan_type,
q.activated_at,
q.expires_at,

p.owner_name,
p.owner_mobile,
p.vehicle_number,

b.batch_name

FROM qr_tags q

LEFT JOIN vehicle_profiles p
ON q.id = p.qr_tag_id

LEFT JOIN qr_batches b
ON q.order_id = b.id

ORDER BY q.created_at DESC
LIMIT 1000
`);

res.json(result.rows);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch inventory"
});

}

});