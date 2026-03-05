import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool) {

const router = express.Router();

/* =================
ADMIN LOGIN
================= */

router.post("/login", async (req, res) => {

const { email, password } = req.body;

if (!email || !password) {
return res.status(400).json({ message: "Missing credentials" });
}

if (email !== process.env.ADMIN_EMAIL) {
return res.status(401).json({ message: "Invalid credentials" });
}

const valid = await bcrypt.compare(
password,
process.env.ADMIN_PASSWORD_HASH
);

if (!valid) {
return res.status(401).json({ message: "Invalid credentials" });
}

const token = jwt.sign(
{ role: "admin" },
process.env.JWT_SECRET,
{ expiresIn: "1h" }
);

res.cookie("admin_token", token, {
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "none"
});

res.json({ message: "login_success" });

});

/* =================
VERIFY SESSION
================= */

router.get("/me", adminAuth, async (req, res) => {

res.json({
authenticated: true,
role: "admin"
});

});

/* =================
PROTECTED ROUTES
================= */

router.use(adminAuth);

/* =================
CREATE ORDER
================= */

router.post("/orders", async (req, res) => {

try {

const { customer_name, mobile, quantity } = req.body;

if (!customer_name || !mobile || !quantity) {
return res.status(400).json({ message: "Missing fields" });
}

const id = uuidv4();

await pool.query(
`INSERT INTO tag_orders
(id, customer_name, mobile, quantity_ordered, quantity_fulfilled, status)
VALUES ($1,$2,$3,$4,0,'pending')`,
[id, customer_name, mobile, quantity]
);

res.json({ message: "order_created" });

} catch (err) {

console.error(err);
res.status(500).json({ message: "Order creation failed" });

}

});

/* =================
ORDERS
================= */

router.get("/orders", async (req, res) => {

const result = await pool.query(`
SELECT *
FROM tag_orders
ORDER BY created_at DESC
`);

res.json(result.rows);

});

/* =================
INVENTORY
================= */

router.get("/inventory", async (req, res) => {

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

});

/* =================
EXTEND SUBSCRIPTION
================= */

router.post("/extend/:id", async (req, res) => {

const { months } = req.body;
const id = req.params.id;

if (!months) {
return res.status(400).json({ message: "Months required" });
}

await pool.query(
`UPDATE qr_tags
SET expires_at = expires_at + ($1 || ' months')::interval
WHERE id = $2`,
[months, id]
);

res.json({ message: "subscription_extended" });

});

return router;

}