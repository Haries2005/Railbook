const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  train_id: { type: mongoose.Schema.Types.ObjectId, ref: "Train", required: true },
  class_name: { type: String, required: true },
  seat_number: { type: String, required: true },
  journey_date: { type: String, required: true },
  is_available: { type: Boolean, default: true },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }
}, { timestamps: true });

module.exports = mongoose.model("Seat", seatSchema);