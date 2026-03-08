import express from "express";

export default function publicRoutes(pool) {

const router = express.Router();

function normalize(code){
return code?.trim() || null;
}

async function getQR(code){

const result = await pool.query(
`
SELECT status, expires_at
FROM qr_tags
WHERE qr_code=$1
`,
[code]
);

return result.rows[0] || null;

}

/* ===============================
QR SCAN ENTRY
=============================== */

router.get("/q/:code", async (req,res)=>{

const code = normalize(req.params.code);

if(!code){
return res.status(400).send("Invalid QR code");
}

try{

const qr = await getQR(code);

if(!qr){
return res.status(404).send("QR not found");
}

const frontend = process.env.FRONTEND_URL;

if(!frontend){
return res.status(500).send("Frontend URL not configured");
}

/* inactive tag */

if(qr.status === "inactive"){
return res.redirect(`${frontend}/activate/${code}`);
}

/* expired */

if(qr.expires_at && new Date(qr.expires_at) < new Date()){
return res.redirect(`${frontend}/subscribe/${code}`);
}

/* active */

return res.redirect(`${frontend}/emergency/${code}`);

}catch(err){

console.error("PUBLIC QR ERROR:",err);
return res.status(500).send("Server error");

}

});

return router;

}