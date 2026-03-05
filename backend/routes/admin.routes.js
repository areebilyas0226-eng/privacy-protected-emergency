import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool){

const router = express.Router();

/* =================
ADMIN LOGIN
================= */

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

/* =================
VERIFY SESSION
================= */

router.get("/me",adminAuth,(req,res)=>{

res.json({
authenticated:true,
role:"admin"
});

});

/* =================
PROTECTED ROUTES
================= */

router.use(adminAuth);

/* =====================================================
DASHBOARD ORDERS (Create Order on Dashboard)
===================================================== */

router.post("/orders", async (req,res)=>{

try{

const {customer_name,mobile,quantity} = req.body;

if(!customer_name || !mobile || !quantity){
return res.status(400).json({message:"Missing fields"});
}

const orderId = uuidv4();

await pool.query(
`INSERT INTO tag_orders
(id,customer_name,mobile,quantity_ordered,quantity_fulfilled,status)
VALUES ($1,$2,$3,$4,0,'pending')`,
[orderId,customer_name,mobile,quantity]
);

res.json({message:"order_created"});

}catch(err){

console.error(err);
res.status(500).json({message:"Order creation failed"});

}

});

/* =====================================================
DASHBOARD ORDER HISTORY
===================================================== */

router.get("/orders", async (req,res)=>{

try{

const result = await pool.query(`
SELECT *
FROM tag_orders
ORDER BY created_at DESC
`);

res.json(result.rows);

}catch(err){

console.error(err);
res.status(500).json({message:"Failed to fetch orders"});

}

});

/* =====================================================
QR ORDERS (Orders Page System)
===================================================== */

router.post("/qr-orders", async (req,res)=>{

try{

const {batch_name,agent_name,quantity} = req.body;

if(!batch_name || !agent_name || !quantity){
return res.status(400).json({message:"Missing fields"});
}

const orderId = uuidv4();

/* save qr order */

await pool.query(
`INSERT INTO qr_orders
(id,batch_name,agent_name,quantity,status)
VALUES ($1,$2,$3,$4,'pending')`,
[orderId,batch_name,agent_name,quantity]
);

/* =================
DOUBLE QR GENERATION
================= */

const totalQR = Number(quantity) * 2;

/* batch insert for performance */

const values = [];
const params = [];

for(let i=0;i<totalQR;i++){

const id = uuidv4();
const code = uuidv4();

params.push(`($${i*2+1},$${i*2+2},'inactive')`);

values.push(id,code);

}

await pool.query(
`INSERT INTO qr_tags (id,qr_code,status)
VALUES ${params.join(",")}`,
values
);

res.json({
message:"qr_order_created",
generated_qr:totalQR
});

}catch(err){

console.error(err);
res.status(500).json({message:"QR order failed"});

}

});

/* =================
QR ORDER HISTORY
================= */

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
res.status(500).json({message:"Failed to fetch QR orders"});

}

});

/* =================
INVENTORY
================= */

router.get("/inventory", async (req,res)=>{

try{

const result = await pool.query(`
SELECT
q.id,
q.qr_code,
q.status,
q.activated_at,
q.expires_at,
b.batch_name
FROM qr_tags q
LEFT JOIN qr_batches b
ON q.batch_id = b.id
ORDER BY q.created_at DESC
LIMIT 1000
`);

res.json(result.rows);

}catch(err){

console.error(err);
res.status(500).json({message:"Failed to fetch inventory"});

}

});

/* =================
EXTEND SUBSCRIPTION
================= */

router.post("/extend/:id", async (req,res)=>{

try{

const {months} = req.body;
const id = req.params.id;

if(!months){
return res.status(400).json({message:"Months required"});
}

await pool.query(
`UPDATE qr_tags
SET expires_at = expires_at + ($1 || ' months')::interval
WHERE id=$2`,
[months,id]
);

res.json({message:"subscription_extended"});

}catch(err){

console.error(err);
res.status(500).json({message:"Extension failed"});

}

});

return router;

}