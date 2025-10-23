// src/routes/bookings.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Train = require("../models/Train");
const { protect } = require("../middleware/auth");

// Generate unique PNR
const generatePNR = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp.slice(-6)}${random}`;
};

// 🎫 CREATE BOOKING
router.post("/", protect, async (req, res) => {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("📥 BOOKING REQUEST RECEIVED");
    console.log("=".repeat(50));
    console.log("👤 User ID:", req.user?._id);
    console.log("📧 User Email:", req.user?.email);
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));

    const {
      trainId,
      trainNumber,
      trainName,
      source,
      destination,
      journeyDate,
      departureTime,
      arrivalTime,
      selectedClass,
      passengers,
      mobileNumber,
      totalFare,
    } = req.body;

    // ✅ VALIDATION
    console.log("\n🔍 Starting validation...");

    if (!trainId) {
      console.error("❌ Validation failed: trainId missing");
      return res.status(400).json({ message: "Train ID is required" });
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      console.error("❌ Validation failed: No passengers");
      return res.status(400).json({ message: "At least one passenger is required" });
    }

    if (!selectedClass) {
      console.error("❌ Validation failed: selectedClass missing");
      return res.status(400).json({ message: "Class selection is required" });
    }

    // Check seat assignments
    console.log("🎫 Validating seat assignments:");
    passengers.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} -> Seat: ${p.seatNumber || 'MISSING'}`);
    });

    const missingSeats = passengers.filter(p => !p.seatNumber);
    if (missingSeats.length > 0) {
      console.error("❌ Validation failed: Missing seats for:", missingSeats.map(p => p.name));
      return res.status(400).json({ 
        message: "All passengers must have seat numbers assigned",
        missingSeats: missingSeats.map(p => p.name)
      });
    }

    console.log("✅ All validations passed");

    // ✅ VERIFY TRAIN EXISTS
    console.log("\n🔍 Verifying train:", trainId);
    const train = await Train.findById(trainId);
    if (!train) {
      console.error("❌ Train not found in database");
      return res.status(404).json({ message: "Train not found" });
    }
    console.log("✅ Train verified:", train.train_name);

    // ✅ GENERATE PNR
    const pnr = generatePNR();
    console.log("🎟️ Generated PNR:", pnr);

    // ✅ EXTRACT SEAT NUMBERS
    const selectedSeats = passengers.map(p => p.seatNumber);
    console.log("💺 Selected seats:", selectedSeats);

    // ✅ CREATE BOOKING DOCUMENT
    console.log("\n💾 Creating booking document...");
    const bookingDoc = {
      userId: req.user._id,
      trainId,
      trainNumber,
      trainName,
      source,
      destination,
      className: selectedClass, // ⚠️ Backend uses className
      selectedSeats,
      journeyDate,
      departureTime,
      arrivalTime,
      passengers: passengers.map(p => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        aadharNumber: p.aadharNumber,
        berth: p.berth,
        seatNumber: p.seatNumber
      })),
      mobileNumber,
      totalFare,
      pnr,
      status: "confirmed"
    };

    const booking = await Booking.create(bookingDoc);
    console.log("✅ Booking saved to database:", booking._id);

    // ✅ UPDATE AVAILABLE SEATS
    console.log("\n📊 Updating train seat availability...");
    const classInfo = train.classes.find(c => c.class_name === selectedClass);
    if (classInfo) {
      const oldSeats = classInfo.available_seats;
      if (classInfo.available_seats >= passengers.length) {
        classInfo.available_seats -= passengers.length;
        await train.save();
        console.log(`✅ Seats updated: ${oldSeats} → ${classInfo.available_seats}`);
      } else {
        console.log("⚠️ Not enough seats, but proceeding with booking");
      }
    }

    // ✅ FORMAT RESPONSE FOR FRONTEND
    const response = {
      id: booking._id.toString(),
      _id: booking._id.toString(),
      userId: booking.userId.toString(),
      pnr: booking.pnr,
      trainId: booking.trainId.toString(),
      trainNumber: booking.trainNumber,
      trainName: booking.trainName,
      source: booking.source,
      destination: booking.destination,
      selectedClass: booking.className, // Convert back to selectedClass
      journeyDate: booking.journeyDate,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      passengers: booking.passengers,
      mobileNumber: booking.mobileNumber,
      totalFare: booking.totalFare,
      status: booking.status,
      bookingDate: booking.createdAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    console.log("\n" + "=".repeat(50));
    console.log("✅ BOOKING SUCCESSFUL");
    console.log("🎟️ PNR:", pnr);
    console.log("=".repeat(50) + "\n");

    res.status(201).json(response);
  } catch (err) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ BOOKING ERROR");
    console.error("=".repeat(50));
    console.error(err);
    console.error("=".repeat(50) + "\n");
    
    res.status(500).json({ 
      message: "Booking failed", 
      error: err.message 
    });
  }
});

// 📋 GET USER BOOKINGS
router.get("/", protect, async (req, res) => {
  try {
    console.log("📋 Fetching bookings for user:", req.user._id);
    
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${bookings.length} booking(s)`);

    // Transform to frontend format
    const response = bookings.map(b => ({
      id: b._id.toString(),
      _id: b._id.toString(),
      userId: b.userId.toString(),
      pnr: b.pnr,
      trainId: b.trainId.toString(),
      trainNumber: b.trainNumber,
      trainName: b.trainName,
      source: b.source,
      destination: b.destination,
      selectedClass: b.className,
      journeyDate: b.journeyDate,
      departureTime: b.departureTime,
      arrivalTime: b.arrivalTime,
      passengers: b.passengers,
      mobileNumber: b.mobileNumber,
      totalFare: b.totalFare,
      status: b.status,
      bookingDate: b.createdAt,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }));

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// 🔍 GET BOOKING BY PNR
router.get("/:pnr", protect, async (req, res) => {
  try {
    console.log("🔍 Fetching booking with PNR:", req.params.pnr);
    
    const booking = await Booking.findOne({ pnr: req.params.pnr });
    
    if (!booking) {
      console.log("❌ Booking not found");
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("✅ Booking found");

    const response = {
      id: booking._id.toString(),
      _id: booking._id.toString(),
      userId: booking.userId.toString(),
      pnr: booking.pnr,
      trainId: booking.trainId.toString(),
      trainNumber: booking.trainNumber,
      trainName: booking.trainName,
      source: booking.source,
      destination: booking.destination,
      selectedClass: booking.className,
      journeyDate: booking.journeyDate,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      passengers: booking.passengers,
      mobileNumber: booking.mobileNumber,
      totalFare: booking.totalFare,
      status: booking.status,
      bookingDate: booking.createdAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching booking:", err);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

// ❌ CANCEL BOOKING
router.patch("/:pnr/cancel", protect, async (req, res) => {
  try {
    console.log("❌ Cancelling booking:", req.params.pnr);
    
    const booking = await Booking.findOne({ pnr: req.params.pnr });
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Restore available seats
    const train = await Train.findById(booking.trainId);
    if (train) {
      const classInfo = train.classes.find(c => c.class_name === booking.className);
      if (classInfo) {
        classInfo.available_seats += booking.passengers.length;
        await train.save();
        console.log("✅ Seats restored");
      }
    }

    console.log("✅ Booking cancelled");

    res.json({
      id: booking._id.toString(),
      pnr: booking.pnr,
      status: booking.status,
      message: "Booking cancelled successfully"
    });
  } catch (err) {
    console.error("❌ Error cancelling booking:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

module.exports = router;