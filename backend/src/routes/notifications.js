const express = require("express");
const { sendEmailNotification } = require("../controllers/notificationController");
const router = express.Router();

router.post("/email", sendEmailNotification);

module.exports = router;
