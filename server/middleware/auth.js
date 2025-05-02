const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authentication failed: No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed: User not found" });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ error: "Authentication failed: Invalid token" });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied: Admin privileges required" });
  }
};

module.exports = { auth, adminAuth };
