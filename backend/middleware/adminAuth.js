import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  try {
    const token = req.cookies?.admin_token;

    // No token present
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate role
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Attach admin info to request (optional)
    req.admin = decoded;

    return next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}