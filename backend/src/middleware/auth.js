// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  console.log("🔐 Auth middleware triggered");

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];
      console.log("🔑 Token found:", token.substring(0, 20) + "...");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded. User ID:", decoded.id);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.log("❌ User not found for token");
        return res.status(401).json({ message: "User not found" });
      }

      console.log("✅ Auth successful:", req.user.email);
      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error.message);
      return res.status(401).json({ 
        message: "Not authorized, token failed",
        error: error.message 
      });
    }
  } else {
    console.log("❌ No Authorization header found");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Optional: Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    console.log("✅ Admin access granted");
    next();
  } else {
    console.log("❌ Admin access denied");
    res.status(403).json({ message: "Not authorized as admin" });
  }
};