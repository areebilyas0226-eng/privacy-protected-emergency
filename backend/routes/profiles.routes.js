import express from "express";

export default function profileRoutes(pool){

const router = express.Router();

router.post("/:code", async (req,res)=>{

try{

const { code } = req.params;

const {
owner_name,
mobile,
vehicle_name,
vehicle_number,
blood_group,
family_contact
} = req.body;

if(!owner_name || !mobile || !vehicle_number){
return res.status(400).json({
message:"Missing required fields"
});
}

await pool.query(
`
INSERT INTO vehicle_profiles
(
qr_tag_id,
owner_name,
mobile,
vehicle_name,
vehicle_number,
blood_group,
family_contact
)
VALUES($1,$2,$3,$4,$5,$6,$7)
`,
[
code,
owner_name,
mobile,
vehicle_name,
vehicle_number,
blood_group,
family_contact
]
);

return res.json({
message:"Profile created"
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