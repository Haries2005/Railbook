const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
  train_number: { type: String, required: true },
  train_name: { type: String, required: true },
  source_station: { type: String, required: true },
  destination_station: { type: String, required: true },
  departure_time: { type: String },
  arrival_time: { type: String },
  is_active: { type: Boolean, default: true },

  // 👇 Add train classes
  classes: [
    {
      class_name: { type: String, required: true }, // e.g., 'Sleeper', 'AC 3 Tier', 'AC Chair Car'
      fare: { type: Number, required: true },       // e.g., 450
      available_seats: { type: Number, required: true }, // e.g., 120
    },
  ],
});

module.exports = mongoose.model("Train", trainSchema);
