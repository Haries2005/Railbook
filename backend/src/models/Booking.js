const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  aadharNumber: { type: String, required: true },
  berth: { type: String, required: true },
  seatNumber: { type: String, required: true }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  trainId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Train", 
    required: true 
  },
  trainNumber: { type: String, required: true },
  trainName: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  className: { type: String, required: true },
  selectedSeats: { type: [String], required: true },
  journeyDate: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  passengers: [passengerSchema],
  mobileNumber: { type: String, required: true },
  totalFare: { type: Number, required: true },
  pnr: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'waitlisted', 'cancelled'], 
    default: 'confirmed' 
  }
}, { timestamps: true });

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ pnr: 1 });
bookingSchema.index({ trainId: 1, journeyDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);