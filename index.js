const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const helmet = require("helmet");
const dotenv = require("dotenv");

// Import routes
const materialRoutes = require("./routes/materialRoutes");
const examRoutes = require("./routes/examRoute");
const resultRoutes = require("./routes/resultRoute");
const uploadRoutes = require("./routes/uploadRoute");

// Configure environment
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

// Routes
app.use("/api/materials", materialRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    status: err.status || 500
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
