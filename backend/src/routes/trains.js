const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");

// Get all trains
router.get("/", trainController.getTrains);

// Search trains
router.get("/search", trainController.searchTrains);

// Add new train
router.post("/", trainController.addTrain);

// Update train by ID
router.put("/:id", trainController.updateTrain);

// Delete train by ID
router.delete("/:id", trainController.deleteTrain);

module.exports = router;