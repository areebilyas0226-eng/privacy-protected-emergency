import express from "express";

export default function publicRoutes(pool) {

const router = express.Router();

/* =========================
HELPERS
========================= */

function normalize(code){
if(!code) return null;
return code.trim();
}

function isValidCode(code){
return /^[a-zA-Z0-9\-]+$/.test(code);
}

async function getQR(code){

const result = await pool.query(
`
SELECT status, expires_at
FROM qr_tags
WHERE qr_code = $1
LIMIT 1
`,
[code]
);

return result.rows[0] || null;

}

/* =========================
QR SCAN ENTRY
========================= */

router.get("/q/:code", async (req,res)=>{

const code = normalize(req.params.code);

if(!code || !isValidCode(code)){
return res.status(400).send("Invalid QR code");
}

try{

const qr = await getQR(code);

if(!qr){
return res.status(404).send("QR not found");
}

const frontend = process.env.FRONTEND_URL;

if(!frontend){
console.error("FRONTEND_URL missing");
return res.status(500).send("Server configuration error");
}

/* Prevent caching */

res.set({
"Cache-Control": "no-store",
"Pragma": "no-cache"
});

/* =========================
INACTIVE TAG
========================= */

if(qr.status === "inactive"){
return res.redirect(`${frontend}/activate/${code}`);
}

/* =========================
EXPIRED TAG
========================= */

if(qr.expires_at && new Date(qr.expires_at) < new Date()){
return res.redirect(`${frontend}/subscribe/${code}`);
}

/* =========================
ACTIVE TAG
========================= */

return res.redirect(`${frontend}/emergency/${code}`);

}catch(err){

console.error("QR PUBLIC ROUTE ERROR:", err);

return res.status(500).send("Internal server error");

}

});

return router;

}