const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  name: String,
  age: Number,
  gender: String,
  seat_number: String
}, { timestamps: true });

module.exports = mongoose.model("Passenger", passengerSchema);
