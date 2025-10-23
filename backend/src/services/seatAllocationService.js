const Seat = require("../models/Seat");

exports.allocateSeats = async (trainId, numSeats) => {
  const seats = await Seat.find({ train: trainId, isBooked: false }).limit(numSeats);
  if (seats.length < numSeats) throw new Error("Not enough seats available");

  const seatNumbers = seats.map((s) => s.seatNumber);
  await Seat.updateMany({ _id: { $in: seats.map((s) => s._id) } }, { isBooked: true });

  return seatNumbers;
};
