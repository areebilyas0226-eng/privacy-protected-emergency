import express from "express";

export default function profileRoutes(pool){

const router = express.Router();

router.post("/:code", async (req,res)=>{

try{

const { code } = req.params;

const {
owner_name,
mobile,
vehicle_number,
blood_group,
emergency_contact
} = req.body;

if(!owner_name || !mobile || !vehicle_number){
return res.status(400).json({
message:"Missing required fields"
});
}

/* find QR tag */

const tagResult = await pool.query(
`
SELECT id
FROM qr_tags
WHERE qr_tag_id=$1
`,
[code]
);

if(!tagResult.rows.length){
return res.status(404).json({
message:"QR tag not found"
});
}

const tagId = tagResult.rows[0].id;


/* create profile */

await pool.query(
`
INSERT INTO vehicle_profiles
(
owner_name,
owner_mobile,
vehicle_number,
blood_group,
emergency_contact
)
VALUES($1,$2,$3,$4,$5)
`,
[
owner_name,
mobile,
vehicle_number,
blood_group,
emergency_contact
]
);


/* activate tag */

await pool.query(
`
UPDATE qr_tags
SET status='active'
WHERE id=$1
`,
[tagId]
);

return res.json({
message:"Tag activated successfully"
});

}catch(err){

console.error("PROFILE CREATE ERROR:",err);

return res.status(500).json({
message:"Server error"
});

}

});

return router;

}