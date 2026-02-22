export default function adminAuth(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey) {
    return res.status(401).json({ message: "Admin key required" });
  }

  const envKey = process.env.ADMIN_KEY;

  if (!envKey) {
    console.error("ADMIN_KEY not set in environment");
    return res.status(500).json({ message: "Server configuration error" });
  }

  // Trim to avoid hidden whitespace issues
  if (adminKey.trim() !== envKey.trim()) {
    return res.status(403).json({ message: "Invalid admin key" });
  }

  next();
}