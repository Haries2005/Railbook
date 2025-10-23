const { sendEmail } = require("../services/emailService");

exports.sendEmailNotification = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    await sendEmail(to, subject, text);
    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
