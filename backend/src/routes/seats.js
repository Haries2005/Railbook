const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");

// GET /api/seats/available - Get available seats
router.get("/available", seatController.getAvailableSeats);

// GET /api/seats/booked - Get booked seats (THIS WAS MISSING!)
router.get("/booked", seatController.getBookedSeats);

module.exports = router;