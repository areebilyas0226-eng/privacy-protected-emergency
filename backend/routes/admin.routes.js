import express from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool){

const router = express.Router();

/* =================
LOGIN
================= */

router.post("/login", async(req,res)=>{

const {email,password} = req.body;

if(
email !== process.env.ADMIN_EMAIL
) return res.status(401).json({message:"Invalid"});

const valid = await bcrypt.compare(
password,
process.env.ADMIN_PASSWORD_HASH
);

if(!valid)
return res.status(401).json({message:"Invalid"});

const token = jwt.sign(
{role:"admin"},
process.env.JWT_SECRET,
{expiresIn:"1h"}
);

res.cookie("admin_token",token,{
httpOnly:true,
sameSite:"lax"
});

res.json({message:"ok"});

});

router.use(adminAuth);

/* =================
ORDERS
================= */

router.get("/orders", async(req,res)=>{

const result = await pool.query(
`SELECT * FROM tag_orders
ORDER BY created_at DESC`
);

res.json(result.rows);

});

/* =================
INVENTORY
================= */

router.get("/inventory", async(req,res)=>{

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
ON q.batch_id=b.id
ORDER BY q.created_at DESC
LIMIT 1000
`);

res.json(result.rows);

});

/* =================
EXTEND SUBSCRIPTION
================= */

router.post("/extend/:id", async(req,res)=>{

const {months} = req.body;
const id = req.params.id;

await pool.query(
`UPDATE qr_tags
SET expires_at = expires_at + ($1 || ' months')::interval
WHERE id=$2`,
[months,id]
);

res.json({message:"extended"});

});

return router;

}