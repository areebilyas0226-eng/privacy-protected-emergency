import express from "express";
import twilio from "twilio";

export default function callRoutes(pool) {

const router = express.Router();

const client = twilio(
process.env.TWILIO_ACCOUNT_SID,
process.env.TWILIO_AUTH_TOKEN
);

router.post("/owner/:code", async (req,res)=>{

try{

const code = req.params.code?.trim();

const result = await pool.query(
`
SELECT p.owner_mobile
FROM qr_tags q
LEFT JOIN vehicle_profiles p
ON q.id = p.qr_tag_id
WHERE q.qr_code = $1
LIMIT 1
`,
[code]
);

if(!result.rows.length){
return res.status(404).json({status:"not_found"});
}

const owner = result.rows[0];

await client.calls.create({
to: owner.owner_mobile,
from: process.env.TWILIO_PHONE,
url: `${process.env.BASE_URL}/twilio/connect`
});

return res.json({status:"calling"});

}catch(err){

console.error(err);

return res.status(500).json({
status:"call_failed"
});

}

});

return router;

}