module.exports = {
  provider: "twilio",
  sid: process.env.TWILIO_SID,
  auth: process.env.TWILIO_AUTH,
  phone: process.env.TWILIO_PHONE,
};
