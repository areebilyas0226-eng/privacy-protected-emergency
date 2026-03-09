import express from "express";
import rateLimit from "express-rate-limit";
import { generateOTP, otpExpiry } from "../services/otp.service.js";

export default function otpRoutes(pool){

const router = express.Router();

/* =========================
OTP RATE LIMIT
========================= */

const otpLimiter = rateLimit({
windowMs: 10 * 60 * 1000,
max: 5,
standardHeaders: true,
legacyHeaders: false
});

/* =========================
SEND OTP
========================= */

router.post("/send", otpLimiter, async (req,res)=>{

try{

const mobile = req.body?.mobile?.trim();

if(!mobile){
return res.status(400).json({message:"Mobile required"});
}

if(!/^[6-9]\d{9}$/.test(mobile)){
return res.status(400).json({message:"Invalid mobile"});
}

const otp = generateOTP();
const expires = otpExpiry();

/* invalidate previous OTP */

await pool.query(
`
UPDATE otp_verifications
SET verified=true
WHERE mobile=$1
AND verified=false
`,
[mobile]
);

/* store new OTP */

await pool.query(
`
INSERT INTO otp_verifications
(mobile, otp, expires_at, verified)
VALUES($1,$2,$3,false)
`,
[mobile, otp, expires]
);

console.log("OTP generated:", otp);

return res.json({
message:"OTP sent successfully"
});

}catch(err){

console.error("OTP SEND ERROR:",err);
return res.status(500).json({message:"Server error"});

}

});


/* =========================
VERIFY OTP
========================= */

router.post("/verify", async(req,res)=>{

try{

const mobile = req.body?.mobile?.trim();
const otp = req.body?.otp?.trim();

if(!mobile || !otp){
return res.status(400).json({message:"mobile and otp required"});
}

const result = await pool.query(
`
SELECT id
FROM otp_verifications
WHERE mobile=$1
AND otp=$2
AND expires_at > NOW()
AND verified=false
ORDER BY created_at DESC
LIMIT 1
`,
[mobile, otp]
);

if(!result.rows.length){
return res.status(400).json({message:"Invalid or expired OTP"});
}

/* mark OTP verified */

await pool.query(
`
UPDATE otp_verifications
SET verified=true
WHERE id=$1
`,
[result.rows[0].id]
);

return res.json({
message:"OTP verified"
});

}catch(err){

console.error("OTP VERIFY ERROR:",err);
return res.status(500).json({message:"Server error"});

}

});

return router;

}