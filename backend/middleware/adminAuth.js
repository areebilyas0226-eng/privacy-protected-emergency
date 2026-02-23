export default function adminAuth(req, res, next) {
  try {
    const headerKey = req.headers["x-admin-key"];
    const envKey = process.env.ADMIN_KEY;

    // Ensure server is properly configured
    if (!envKey || typeof envKey !== "string") {
      console.error("ADMIN_KEY missing in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Ensure header exists
    if (!headerKey || typeof headerKey !== "string") {
      return res.status(401).json({ message: "Admin key required" });
    }

    // Normalize values (remove hidden whitespace)
    const normalizedHeader = headerKey.trim();
    const normalizedEnv = envKey.trim();

    if (normalizedHeader !== normalizedEnv) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    return next();
  } catch (err) {
    console.error("Admin auth error:", err);
    return res.status(500).json({ message: "Authentication error" });
  }
}