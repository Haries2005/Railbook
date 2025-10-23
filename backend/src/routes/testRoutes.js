const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/dbcheck", async (req, res) => {
  try {
    // Check if mongoose connection is ready
    if (mongoose.connection.readyState === 1) {
      res.json({ success: true, message: "✅ MongoDB connected!" });
    } else {
      res.json({ success: false, message: "⚠️ MongoDB not connected!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
