const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // change to SendGrid/SMTP in production
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
};
