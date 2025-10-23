// backend/src/controllers/bookingController.js
const Booking = require("../models/Booking");
const Seat = require("../models/Seat");
const Train = require("../models/Train");

exports.createBooking = async (req, res) => {
  try {
    console.log("\n==================================================");
    console.log("📥 BOOKING REQUEST RECEIVED");
    console.log("==================================================");

    const userId = req.user._id;
    const { 
      trainId, 
      trainNumber,
      trainName,
      source,
      destination,
      selectedClass, 
      passengers,
      journeyDate,
      departureTime,
      arrivalTime,
      mobileNumber,
      totalFare
    } = req.body;

    // Validation
    if (!trainId || !selectedClass || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    const selectedSeats = passengers.map(p => p.seatNumber).filter(Boolean);

    if (selectedSeats.length !== passengers.length) {
      return res.status(400).json({ 
        message: "Each passenger must have a seat assigned"
      });
    }

    // Verify train exists
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const selectedClassInfo = train.classes.find(
      (c) => c.class_name === selectedClass
    );

    if (!selectedClassInfo) {
      return res.status(400).json({ message: "Selected class not found" });
    }

    // Check seat availability
    const unavailableSeats = await Seat.find({
      train_id: trainId,
      class_name: selectedClass,
      seat_number: { $in: selectedSeats },
      journey_date: journeyDate,
      is_available: false,
    });

    if (unavailableSeats.length > 0) {
      return res.status(400).json({ 
        message: "Some seats are already booked",
        unavailableSeats: unavailableSeats.map(s => s.seat_number)
      });
    }

    // Generate PNR
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Create booking
    const booking = new Booking({
      userId,
      trainId,
      trainNumber,
      trainName,
      source,
      destination,
      className: selectedClass,
      selectedSeats,
      journeyDate,
      departureTime,
      arrivalTime,
      passengers,
      mobileNumber,
      totalFare,
      pnr,
      status: 'confirmed'
    });

    await booking.save();

    // Create/update seat records with proper error handling
    try {
      const seatOperations = selectedSeats.map(seatNumber => ({
        updateOne: {
          filter: {
            train_id: trainId,
            class_name: selectedClass,
            seat_number: seatNumber,
            journey_date: journeyDate
          },
          update: {
            $set: {
              is_available: false,
              booking_id: booking._id
            }
          },
          upsert: true
        }
      }));

      await Seat.bulkWrite(seatOperations);
    } catch (seatError) {
      console.error("⚠️ Seat creation warning:", seatError);
      // Don't fail the booking if seat records fail
    }

    // Update train availability
    await Train.updateOne(
      { _id: trainId, "classes.class_name": selectedClass },
      { $inc: { "classes.$.available_seats": -selectedSeats.length } }
    );

    console.log("✅ BOOKING SUCCESSFUL - PNR:", pnr);

    // Send response
    res.status(201).json({
      id: booking._id,
      pnr: booking.pnr,
      trainId: booking.trainId,
      trainNumber: booking.trainNumber,
      trainName: booking.trainName,
      source: booking.source,
      destination: booking.destination,
      journeyDate: booking.journeyDate,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      selectedClass: booking.className,
      passengers: booking.passengers,
      selectedSeats: booking.selectedSeats,
      mobileNumber: booking.mobileNumber,
      totalFare: booking.totalFare,
      bookingDate: booking.createdAt,
      status: booking.status
    });

  } catch (error) {
    console.error("❌ Error in createBooking:", error);
    res.status(500).json({ 
      message: "Error creating booking", 
      error: error.message 
    });
  }
};

// Other functions remain the same...
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('trainId', 'train_number train_name source_station destination_station')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error in getAllBookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId: userId })
      .populate('trainId', 'train_number train_name source_station destination_station')
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      pnr: booking.pnr,
      bookingDate: booking.createdAt,
      trainName: booking.trainName,
      trainNumber: booking.trainNumber,
      journeyDate: booking.journeyDate,
      selectedClass: booking.className,
      source: booking.source,
      destination: booking.destination,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      passengers: booking.passengers,
      selectedSeats: booking.selectedSeats,
      mobileNumber: booking.mobileNumber,
      totalFare: booking.totalFare,
      status: booking.status
    }));

    res.status(200).json(formattedBookings);
  } catch (error) {
    console.error("❌ Error in getUserBookings:", error);
    res.status(500).json({ message: "Error fetching user bookings" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('trainId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("❌ Error in getBookingById:", error);
    res.status(500).json({ message: "Error fetching booking" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Release the seats
    await Seat.updateMany(
      { 
        train_id: booking.trainId, 
        class_name: booking.className, 
        seat_number: { $in: booking.selectedSeats },
        journey_date: booking.journeyDate
      },
      { 
        $set: { 
          is_available: true,
          booking_id: null
        } 
      }
    );

    // Update train availability
    await Train.updateOne(
      { _id: booking.trainId, "classes.class_name": booking.className },
      { $inc: { "classes.$.available_seats": booking.selectedSeats.length } }
    );

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("❌ Error in cancelBooking:", error);
    res.status(500).json({ message: "Error cancelling booking" });
  }
};