const Train = require("../models/Train");

// ------------------- Add a New Train (Admin Functionality) -------------------
exports.addTrain = async (req, res) => {
  try {
    console.log("🟢 Incoming Train Data:", req.body);

    const train = await Train.create(req.body); // req.body should include classes array
    res.status(201).json({
      message: "✅ Train added successfully!",
      train,
    });
  } catch (err) {
    console.error("❌ Add train error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get All Trains -------------------
exports.getTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    res.status(200).json(trains);
  } catch (err) {
    console.error("❌ Get trains error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Search Trains -------------------
exports.searchTrains = async (req, res) => {
  try {
    const { trainNumber, source, destination } = req.query;
    const query = { is_active: true };

    console.log("🔍 Search query params:", req.query);

    if (trainNumber) query.train_number = { $regex: trainNumber, $options: "i" };
    if (source) query.source_station = { $regex: source, $options: "i" };
    if (destination) query.destination_station = { $regex: destination, $options: "i" };

    const trains = await Train.find(query);

    console.log(`✅ ${trains.length} train(s) found`);
    res.status(200).json(trains);
  } catch (err) {
    console.error("❌ Search trains error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add these at the end of your trainController.js file
exports.updateTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("📝 Updating train:", id);
    console.log("📦 Update data:", updateData);

    const Train = require("../models/Train");
    const train = await Train.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    console.log("✅ Train updated successfully");
    res.json(train);
  } catch (error) {
    console.error("❌ Error updating train:", error);
    res.status(500).json({ message: "Error updating train", error: error.message });
  }
};

exports.deleteTrain = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Deleting train:", id);

    const Train = require("../models/Train");
    const train = await Train.findByIdAndDelete(id);

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    console.log("✅ Train deleted successfully");
    res.json({ message: "Train deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting train:", error);
    res.status(500).json({ message: "Error deleting train", error: error.message });
  }
};