// backend/src/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./utils/database");
require("dotenv").config();

const app = express();

// ----------------- CORS CONFIGURATION (PRODUCTION READY) -----------------
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // Allow all Vercel preview deployments
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-JSON"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ----------------- MIDDLEWARES -----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ----------------- REQUEST LOGGING (DEVELOPMENT ONLY) -----------------
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log("📦 Body:", JSON.stringify(req.body, null, 2).substring(0, 500));
    }
    next();
  });
}

// ----------------- IMPORT ROUTES -----------------
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/auth");
const trainRoutes = require("./routes/trains");
const bookingRoutes = require("./routes/bookings");
const seatRoutes = require("./routes/seats");
const notificationRoutes = require("./routes/notifications");
const errorHandler = require("./middleware/errorHandler");

// ----------------- HEALTH CHECK -----------------
app.get("/", (req, res) => {
  res.json({
    status: "🟢 Online",
    message: "Railbook API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      test: "/api/test",
      auth: "/api/auth",
      trains: "/api/trains",
      bookings: "/api/bookings",
      seats: "/api/seats",
      notifications: "/api/notifications"
    }
  });
});

// Keep-alive endpoint for preventing Render sleep
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", uptime: process.uptime() });
});

// ----------------- REGISTER ROUTES -----------------
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/notifications", notificationRoutes);

// ----------------- 404 HANDLER -----------------
app.use((req, res) => {
  console.log(`⚠️ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/trains",
      "/api/bookings"
    ]
  });
});

// ----------------- ERROR HANDLER -----------------
app.use(errorHandler);

// ----------------- DATABASE CONNECTION & SERVER -----------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 Health: http://localhost:${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;