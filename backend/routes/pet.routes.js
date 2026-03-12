import express from "express";

export default function petRoutes(pool){

const router = express.Router();

/* PET REGISTER */

router.post("/register/:code", async(req,res)=>{

try{

const { code } = req.params;

const {
pet_name,
pet_type,
breed,
color,
owner_name,
owner_mobile,
emergency_contact
} = req.body;

await pool.query(
`
INSERT INTO pets
(qr_code,pet_name,pet_type,breed,color,owner_name,owner_mobile,emergency_contact)
VALUES($1,$2,$3,$4,$5,$6,$7,$8)
`,
[
code,
pet_name,
pet_type,
breed,
color,
owner_name,
owner_mobile,
emergency_contact
]
);

await pool.query(
`
UPDATE qr_tags
SET status='active'
WHERE qr_code=$1
`,
[code]
);

res.json({success:true});

}catch(err){

console.error("PET REGISTER ERROR:",err);
res.status(500).json({message:"Registration failed"});

}

});

return router;

}