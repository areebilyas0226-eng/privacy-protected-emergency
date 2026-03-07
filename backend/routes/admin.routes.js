import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import adminAuth from "../middleware/adminAuth.js";

import QRCode from "qrcode";
import PDFDocument from "pdfkit";

export default function adminRoutes(pool){

const router = express.Router();

/* ================= ADMIN LOGIN ================= */

router.post("/login", async (req,res)=>{
try{

const {email,password} = req.body;

if(!email || !password){
return res.status(400).json({message:"Missing credentials"});
}

if(email !== process.env.ADMIN_EMAIL){
return res.status(401).json({message:"Invalid credentials"});
}

const valid = await bcrypt.compare(
password,
process.env.ADMIN_PASSWORD_HASH
);

if(!valid){
return res.status(401).json({message:"Invalid credentials"});
}

const token = jwt.sign(
{role:"admin"},
process.env.JWT_SECRET,
{expiresIn:"1h"}
);

res.cookie("admin_token",token,{
httpOnly:true,
secure:process.env.NODE_ENV==="production",
sameSite:"none"
});

res.json({message:"login_success"});

}catch(err){
console.error(err);
res.status(500).json({message:"Login failed"});
}
});

/* ================= VERIFY SESSION ================= */

router.get("/me",adminAuth,(req,res)=>{
res.json({authenticated:true,role:"admin"});
});

router.use(adminAuth);

/* ================= CREATE QR ORDER ================= */

router.post("/qr-orders", async (req,res)=>{

const client = await pool.connect();

try{

const {batch_name,agent_name,quantity} = req.body;

if(!batch_name || !agent_name || !quantity){
return res.status(400).json({message:"Missing fields"});
}

await client.query("BEGIN");

const orderId = uuidv4();

await client.query(
`INSERT INTO qr_orders
(id,batch_name,agent_name,quantity,status)
VALUES ($1,$2,$3,$4,'pending')`,
[orderId,batch_name,agent_name,quantity]
);

const totalQR = Number(quantity) * 2;

for(let i=0;i<totalQR;i++){

await client.query(
`
INSERT INTO qr_tags
(id, qr_code, status, order_id, type)
VALUES
($1,$2,'inactive',$3,'qr')
`,
[
uuidv4(),
uuidv4(),
orderId
]
);

}

await client.query("COMMIT");

res.json({
message:"qr_order_created",
generated_qr:totalQR
});

}catch(err){

await client.query("ROLLBACK");

console.error("QR CREATE ERROR:",err);

res.status(500).json({
message:"QR order failed",
error:err.message
});

}finally{

client.release();

}

});

/* ================= QR ORDER HISTORY ================= */

router.get("/qr-orders", async (req,res)=>{

try{

const result = await pool.query(`
SELECT *
FROM qr_orders
ORDER BY created_at DESC
`);

res.json(result.rows);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch QR orders"
});

}

});

/* ================= INVENTORY ================= */

router.get("/inventory", async (req,res)=>{

try{

const result = await pool.query(`
SELECT
q.id,
q.qr_code,
q.status,
q.type,
q.plan_type,
q.activated_at,
q.expires_at,
o.batch_name
FROM qr_tags q
LEFT JOIN qr_orders o
ON q.order_id = o.id
ORDER BY q.created_at DESC
LIMIT 1000
`);

res.json(result.rows);

}catch(err){
console.error(err);
res.status(500).json({message:"Failed to fetch inventory"});
}

});

/* ================= DOWNLOAD QR PDF ================= */

router.get("/order-qrs/:id", async (req,res)=>{

try{

const orderId = req.params.id;

const result = await pool.query(
`SELECT qr_code FROM qr_tags WHERE order_id=$1`,
[orderId]
);

if(result.rows.length===0){
return res.status(404).json({message:"No QR codes"});
}

res.setHeader("Content-Type","application/pdf");

const doc = new PDFDocument({margin:30});
doc.pipe(res);

let x=30;
let y=30;

for(const row of result.rows){

const url=`${process.env.FRONTEND_URL}/qr/${row.qr_code}`;
const dataURL=await QRCode.toDataURL(url);

const buffer=Buffer.from(dataURL.split(",")[1],"base64");

doc.image(buffer,x,y,{width:100});

x+=120;

if(x>450){
x=30;
y+=120;
}

if(y>700){
doc.addPage();
x=30;
y=30;
}

}

doc.end();

}catch(err){

console.error(err);
res.status(500).json({message:"QR download failed"});

}

});

/* ================= RENEW SUBSCRIPTION ================= */

router.post("/renew/:id", async (req,res)=>{

try{

const {plan}=req.body;
const id=req.params.id;

const plans={
"1month":1,
"3month":3,
"6month":6,
"12month":12
};

if(!plans[plan]){
return res.status(400).json({message:"Invalid plan"});
}

await pool.query(
`
UPDATE qr_tags
SET
expires_at = NOW() + ($1 || ' months')::interval,
plan_type = $2,
status='active'
WHERE id=$3
`,
[plans[plan],plan,id]
);

res.json({message:"subscription_renewed"});

}catch(err){

console.error(err);
res.status(500).json({message:"Renewal failed"});

}

});

return router;

}