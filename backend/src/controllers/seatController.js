const Seat = require("../models/Seat");
const Train = require("../models/Train");
const mongoose = require("mongoose");

// Get available seats for a train/class/date
exports.getAvailableSeats = async (req, res) => {
  try {
    const trainId = req.query.trainId || req.query.train_id;
    const className = req.query.className || req.query.class_name;
    const journeyDate = req.query.journeyDate || req.query.journey_date;

    console.log("🔍 Fetching available seats for:", { trainId, className, journeyDate });

    if (!trainId || !className || !journeyDate) {
      console.log("❌ Missing parameters:", req.query);
      return res.status(400).json({ 
        message: "Missing required parameters: train_id, class_name, journey_date" 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      return res.status(400).json({ message: "Invalid train ID format" });
    }

    // Get train to determine total seats
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const classInfo = train.classes.find(c => c.class_name === className);
    if (!classInfo) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Generate all seat numbers based on class
    const totalSeats = classInfo.available_seats || 
      (className === 'Sleeper' || className === 'SL' ? 72 :
       className === 'AC 3 Tier' || className === '3A' ? 64 :
       className === 'AC 2 Tier' || className === '2A' ? 46 : 18);

    const allSeats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString());

    // Check which seats are booked - Mongoose auto-converts string to ObjectId
    const bookedSeats = await Seat.find({
      train_id: trainId,
      class_name: className,
      journey_date: journeyDate,
      is_available: false
    }).select('seat_number');

    const bookedSeatNumbers = bookedSeats.map(s => s.seat_number);

    // Return available seats
    const availableSeats = allSeats.filter(seat => !bookedSeatNumbers.includes(seat));

    console.log(`✅ Found ${availableSeats.length}/${totalSeats} available seats`);

    res.json(availableSeats);

  } catch (error) {
    console.error("❌ Error fetching available seats:", error);
    res.status(500).json({ message: "Error fetching seats", error: error.message });
  }
};

// ✅ GET BOOKED SEATS - SIMPLIFIED VERSION
exports.getBookedSeats = async (req, res) => {
  try {
    const trainId = req.query.trainId || req.query.train_id;
    const className = req.query.className || req.query.class_name;
    const journeyDate = req.query.journeyDate || req.query.journey_date;

    console.log("🔍 Fetching booked seats for:", { trainId, className, journeyDate });
    console.log("🔍 Raw query params:", req.query);

    if (!trainId || !className || !journeyDate) {
      console.log("❌ Missing parameters:", req.query);
      return res.status(400).json({ 
        message: "Missing required parameters: train_id, class_name, journey_date" 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      console.error("❌ Invalid trainId format:", trainId);
      return res.status(400).json({ message: "Invalid train ID format" });
    }

    console.log("✅ Valid trainId:", trainId);

    // Find all booked seats - Mongoose automatically converts string to ObjectId
    const bookedSeats = await Seat.find({
      train_id: trainId,
      class_name: className,
      journey_date: journeyDate,
      is_available: false
    }).select('seat_number -_id');

    const bookedSeatNumbers = bookedSeats.map(s => s.seat_number);

    console.log(`✅ Found ${bookedSeatNumbers.length} booked seats:`, bookedSeatNumbers);

    // Debug: Check all seats for this train/class/date
    const allSeatsForTrain = await Seat.find({
      train_id: trainId,
      class_name: className,
      journey_date: journeyDate
    });
    console.log(`📊 Total seat records in DB: ${allSeatsForTrain.length}`);
    
    if (allSeatsForTrain.length > 0) {
      console.log(`📊 Sample seat record:`, JSON.stringify(allSeatsForTrain[0], null, 2));
    }

    res.json(bookedSeatNumbers);

  } catch (error) {
    console.error("❌ Error fetching booked seats:", error);
    res.status(500).json({ message: "Error fetching booked seats", error: error.message });
  }
};