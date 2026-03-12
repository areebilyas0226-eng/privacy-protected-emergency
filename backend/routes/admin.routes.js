import express from "express";

export default function adminRoutes(pool){

const router = express.Router();

/* TEST ROUTE */

router.get("/test",(req,res)=>{
res.json({message:"Admin routes working"});
});

/* =========================
ADMIN LOGIN
========================= */

router.post("/login", async (req,res)=>{

try{

const {email,password} = req.body;

if(!email || !password){
return res.status(400).json({
message:"Email and password required"
});
}

/* Example credentials (replace later with DB auth) */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@vahantag.com";
const ADMIN_PASS  = process.env.ADMIN_PASS  || "admin123";

if(email !== ADMIN_EMAIL || password !== ADMIN_PASS){
return res.status(401).json({
message:"Invalid credentials"
});
}

/* Set cookie */

res.cookie("admin_auth","true",{
httpOnly:true,
secure:true,
sameSite:"none",
maxAge:24*60*60*1000
});

res.json({
message:"Login successful"
});

}catch(err){

console.error("Admin login error:",err);

res.status(500).json({
message:"Server error"
});

}

});

return router;

}